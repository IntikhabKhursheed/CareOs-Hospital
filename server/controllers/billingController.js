const PDFDocument = require('pdfkit');
const Bill = require('../models/Bill');
const apiResponse = require('../utils/apiResponse');
const aiService = require('../services/aiService');

const buildBillTotals = (items, discount = 0, tax = 0, paidAmount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalAmount = Math.max(subtotal - discount + tax, 0);
  const balance = Math.max(totalAmount - paidAmount, 0);
  return { subtotal, totalAmount, balance };
};

const streamBillPdf = (res, bill) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=bill-${bill._id}.pdf`);
  doc.pipe(res);
  doc.fontSize(22).text('CareOS Hospital Bill', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Bill ID: ${bill._id}`);
  doc.text(`Patient: ${bill.patient}`);
  doc.text(`Status: ${bill.status}`);
  doc.moveDown();
  doc.text('Items', { underline: true });
  bill.items.forEach((item) => {
    doc.moveDown(0.2);
    doc.fontSize(11).text(`${item.description} (${item.category})`, { continued: true }).text(` x${item.quantity} @ $${item.unitPrice.toFixed(2)}`, { align: 'right' });
    doc.text(`Total: $${item.total.toFixed(2)}`);
  });
  doc.moveDown();
  doc.text(`Subtotal: $${bill.subtotal.toFixed(2)}`);
  doc.text(`Discount: $${bill.discount.toFixed(2)}`);
  doc.text(`Tax: $${bill.tax.toFixed(2)}`);
  doc.text(`Total amount: $${bill.totalAmount.toFixed(2)}`);
  doc.text(`Paid amount: $${bill.paidAmount.toFixed(2)}`);
  doc.text(`Balance: $${bill.balance.toFixed(2)}`);
  doc.moveDown();
  if (bill.paymentHistory.length) {
    doc.text('Payments', { underline: true });
    bill.paymentHistory.forEach((payment) => {
      doc.text(`${payment.date.toISOString().split('T')[0]} - ${payment.method} - $${payment.amount.toFixed(2)} (${payment.reference || 'no reference'})`);
    });
  }
  doc.end();
};

exports.generateBill = async (req, res, next) => {
  try {
    const { patient, visitDetails, services = [], discount = 0, tax = 0, paidAmount = 0 } = req.body;
    const items = services.map((item) => ({
      description: item.description || 'Service charge',
      category: item.category || 'Service',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: ((item.quantity || 1) * (item.unitPrice || 0))
    }));
    const totals = buildBillTotals(items, discount, tax, paidAmount);
    const bill = await Bill.create({
      patient,
      items,
      subtotal: totals.subtotal,
      discount,
      tax,
      totalAmount: totals.totalAmount,
      paidAmount,
      balance: totals.balance,
      status: totals.balance > 0 ? (paidAmount > 0 ? 'partial' : 'pending') : 'paid'
    });
    if (req.query.download === 'true') {
      return streamBillPdf(res, bill);
    }
    res.status(201).json(apiResponse({ success: true, message: 'Bill generated successfully', data: bill }));
  } catch (error) {
    next(error);
  }
};

exports.addPayment = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json(apiResponse({ success: false, message: 'Bill not found', data: null }));
    }
    const { amount, method, reference } = req.body;
    bill.paymentHistory.push({ amount, method, reference: reference || '' });
    bill.paidAmount += amount;
    bill.balance = Math.max(bill.totalAmount - bill.paidAmount, 0);
    bill.status = bill.balance === 0 ? 'paid' : 'partial';
    await bill.save();
    res.status(200).json(apiResponse({ success: true, message: 'Payment added successfully', data: bill }));
  } catch (error) {
    next(error);
  }
};

exports.getBills = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10, status } = req.query;
    const filters = {};
    if (search) {
      filters['items.description'] = { $regex: search, $options: 'i' };
    }
    if (status) {
      filters.status = status;
    }
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Bill.countDocuments(filters);
    const bills = await Bill.find(filters).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.status(200).json(apiResponse({ success: true, message: 'Bills retrieved', data: { bills, pagination: { total, page: Number(page), limit: Number(limit) } } }));
  } catch (error) {
    next(error);
  }
};

exports.detectAnomalies = async (req, res, next) => {
  try {
    const { visitDetails, billedItems } = req.body;
    const result = await aiService.detectBillingAnomaly(visitDetails, billedItems);
    res.status(200).json(apiResponse({ success: true, message: 'Billing anomaly detection complete', data: result }));
  } catch (error) {
    next(error);
  }
};
