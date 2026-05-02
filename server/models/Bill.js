const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const paymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0
    },
    method: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    items: {
      type: [billItemSchema],
      default: []
    },
    subtotal: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    balance: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'insurance'],
      default: 'pending'
    },
    paymentHistory: {
      type: [paymentHistorySchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
