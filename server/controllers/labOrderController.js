const LabOrder = require('../models/LabOrder');
const Patient = require('../models/Patient');
const TestCatalog = require('../models/TestCatalog');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');
const aiService = require('../services/aiService');

exports.createLabOrder = async (req, res, next) => {
  try {
    const { patientId, testIds, referredBy, priority = 'routine', clinicalNotes = '' } = req.body;
    const orderedBy = req.user._id;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Patient not found',
        data: null
      }));
    }

    // Validate tests exist and are active
    const tests = await TestCatalog.find({ _id: { $in: testIds }, isActive: true });
    if (tests.length !== testIds.length) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'One or more tests not found or inactive',
        data: null
      }));
    }

    // Create lab order with tests
    const labOrderData = {
      patient: patientId,
      orderedBy,
      referredBy,
      tests: testIds.map(testId => ({
        test: testId,
        priority,
        clinicalNotes,
        status: 'ordered'
      }))
    };

    const labOrder = new LabOrder(labOrderData);
    await labOrder.calculateTotalAmount();
    await labOrder.save();

    // Populate for response
    const populatedOrder = await LabOrder.findById(labOrder._id)
      .populate('patient', 'name MRH phone dateOfBirth gender')
      .populate('orderedBy', 'name email')
      .populate('tests.test', 'testCode testName category department price turnaroundHours parameters');

    // Emit socket event for real-time updates
    req.io?.emit('new_lab_order', populatedOrder);

    res.status(201).json(apiResponse({
      success: true,
      message: 'Lab order created successfully',
      data: populatedOrder
    }));
  } catch (error) {
    next(error);
  }
};

exports.getLabOrders = async (req, res, next) => {
  try {
    const { 
      status, 
      priority, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (status) {
      if (Array.isArray(status)) {
        filters.overallStatus = { $in: status };
      } else {
        filters.overallStatus = status;
      }
    }
    if (priority) {
      filters.tests = { $elemMatch: { priority } };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await LabOrder.countDocuments(filters);
    
    const orders = await LabOrder.find(filters)
      .populate('patient', 'name MRH phone')
      .populate('orderedBy', 'name email')
      .populate('tests.test', 'testCode testName category department price')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(apiResponse({
      success: true,
      message: 'Lab orders retrieved successfully',
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      }
    }));
  } catch (error) {
    next(error);
  }
};

exports.getLabOrderById = async (req, res, next) => {
  try {
    const order = await LabOrder.findById(req.params.id)
      .populate('patient', 'name MRH phone dateOfBirth gender')
      .populate('orderedBy', 'name email')
      .populate('referredBy', 'name')
      .populate('tests.test', 'testCode testName category department price turnaroundHours parameters')
      .populate('tests.resultEnteredBy', 'name')
      .populate('sampleCollectedBy', 'name');

    if (!order) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Lab order not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Lab order retrieved successfully',
      data: order
    }));
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const order = await LabOrder.findByIdAndUpdate(
      req.params.id,
      { overallStatus: status },
      { new: true, runValidators: true }
    ).populate('patient', 'name MRH')
     .populate('orderedBy', 'name');

    if (!order) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Lab order not found',
        data: null
      }));
    }

    // Emit socket event for real-time updates
    req.io?.emit('lab_order_status_updated', order);

    res.status(200).json(apiResponse({
      success: true,
      message: 'Lab order status updated successfully',
      data: order
    }));
  } catch (error) {
    next(error);
  }
};

exports.enterResults = async (req, res, next) => {
  try {
    const { testId, results } = req.body;
    
    const order = await LabOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Lab order not found',
        data: null
      }));
    }

    // Find the specific test in the order
    const testIndex = order.tests.findIndex(test => test._id.toString() === testId);
    if (testIndex === -1) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test not found in order',
        data: null
      }));
    }

    // Process results with auto-flagging
    const processedResults = [];
    let hasCriticalValues = false;

    const testCatalog = await TestCatalog.findById(order.tests[testIndex].test);
    const patient = await Patient.findById(order.patient);

    for (const result of results) {
      const parameter = testCatalog.parameters.find(p => p.name === result.parameter);
      let flag = 'normal';

      if (parameter) {
        flag = calculateFlag(result.value, parameter, patient.gender);
        if (flag.includes('critical')) {
          hasCriticalValues = true;
        }
      }

      processedResults.push({
        ...result,
        flag,
        unit: parameter?.unit || result.unit,
        normalRange: getNormalRange(parameter, patient.gender)
      });
    }

    // Update test results
    order.tests[testIndex].results = processedResults;
    order.tests[testIndex].resultEnteredAt = new Date();
    order.tests[testIndex].resultEnteredBy = req.user._id;
    order.tests[testIndex].status = 'completed';

    // Get AI interpretation
    try {
      const aiInterpretation = await aiService.interpretLabResults({
        test: testCatalog.testName,
        results: processedResults,
        patientInfo: {
          age: calculateAge(patient.dateOfBirth),
          gender: patient.gender
        }
      });
      order.tests[testIndex].aiInterpretation = aiInterpretation;
    } catch (aiError) {
      console.error('AI interpretation failed:', aiError);
    }

    // Update overall status
    order.updateOverallStatus();

    // Handle critical values
    if (hasCriticalValues && !order.criticalValueAlerted) {
      order.criticalValueAlerted = true;
      req.io?.emit('critical_value_alert', {
        orderId: order._id,
        patient: order.patient,
        criticalResults: processedResults.filter(r => r.flag.includes('critical'))
      });
    }

    await order.save();

    // Populate for response
    const populatedOrder = await LabOrder.findById(order._id)
      .populate('patient', 'name MRH')
      .populate('tests.test', 'testCode testName')
      .populate('tests.resultEnteredBy', 'name');

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test results entered successfully',
      data: populatedOrder
    }));
  } catch (error) {
    next(error);
  }
};

exports.getPatientLabHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const orders = await LabOrder.find({ patient: patientId })
      .populate('tests.test', 'testCode testName category department price')
      .populate('orderedBy', 'name')
      .populate('tests.resultEnteredBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(apiResponse({
      success: true,
      message: 'Patient lab history retrieved successfully',
      data: orders
    }));
  } catch (error) {
    next(error);
  }
};

// Helper functions
function calculateFlag(value, parameter, gender) {
  if (!parameter || !value) return 'normal';

  const normalRange = getNormalRange(parameter, gender);
  if (!normalRange) return 'normal';

  // Parse numeric values
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'normal';

  // Parse range (e.g., "70-120", "<200", ">3.5")
  const rangeParts = normalRange.match(/([<>=]*)(\d+\.?\d*)-?(\d+\.?\d*)?/);
  if (!rangeParts) return 'normal';

  const [, operator, min, max] = rangeParts;
  
  if (operator === '<' && numValue >= parseFloat(min)) return 'high';
  if (operator === '>' && numValue <= parseFloat(min)) return 'low';
  
  if (min && max) {
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    
    if (numValue < minVal * 0.5) return 'critical_low';
    if (numValue > maxVal * 2) return 'critical_high';
    if (numValue < minVal) return 'low';
    if (numValue > maxVal) return 'high';
  }

  return 'normal';
}

function getNormalRange(parameter, gender) {
  if (!parameter) return '';
  
  switch (gender.toLowerCase()) {
    case 'male':
      return parameter.normalRangeMale || '';
    case 'female':
      return parameter.normalRangeFemale || '';
    default:
      return parameter.normalRangeChild || '';
  }
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
