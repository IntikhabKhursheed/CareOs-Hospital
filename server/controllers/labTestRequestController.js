const LabTestRequest = require('../models/LabTestRequest');
const Patient = require('../models/Patient');
const TestCatalog = require('../models/TestCatalog');
const apiResponse = require('../utils/apiResponse');

exports.createTestRequest = async (req, res, next) => {
  try {
    const { patientId, testId, urgency = 'routine', notes = '' } = req.body;
    const referrerId = req.user._id;
    const referrerName = req.user.name;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Patient not found',
        data: null
      }));
    }

    // Validate test exists and is active
    const test = await TestCatalog.findById(testId);
    if (!test || !test.isActive) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test not found or inactive',
        data: null
      }));
    }

    // Check if test request already exists for this patient and test
    const existingRequest = await LabTestRequest.findOne({
      patient: patientId,
      test: testId,
      status: { $in: ['pending', 'in_progress'] }
    });

    if (existingRequest) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'Test request already exists for this patient',
        data: null
      }));
    }

    // Create test request
    const testRequest = await LabTestRequest.create({
      patient: patientId,
      test: testId,
      referrer: referrerId,
      referrerName,
      urgency,
      notes
    });

    // Populate the request with patient and test details
    const populatedRequest = await LabTestRequest.findById(testRequest._id)
      .populate('patient', 'name MRH')
      .populate('test', 'testCode testName category department price turnaroundHours')
      .populate('referrer', 'name email');

    res.status(201).json(apiResponse({
      success: true,
      message: 'Test request created successfully',
      data: populatedRequest
    }));
  } catch (error) {
    next(error);
  }
};

exports.getLabQueue = async (req, res, next) => {
  try {
    const { status = 'pending', urgency, page = 1, limit = 10 } = req.query;
    const filters = { status };
    
    if (urgency) filters.urgency = urgency;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await LabTestRequest.countDocuments(filters);
    
    const requests = await LabTestRequest.find(filters)
      .populate('patient', 'name MRH phone')
      .populate('test', 'testCode testName category department price turnaroundHours parameters')
      .populate('referrer', 'name email')
      .populate('sampleCollectedBy', 'name')
      .populate('resultEnteredBy', 'name')
      .sort({ urgency: -1, assignedAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(apiResponse({
      success: true,
      message: 'Lab queue retrieved successfully',
      data: {
        requests,
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

exports.getTestRequestById = async (req, res, next) => {
  try {
    const request = await LabTestRequest.findById(req.params.id)
      .populate('patient', 'name MRH phone dateOfBirth gender')
      .populate('test', 'testCode testName category department price turnaroundHours parameters')
      .populate('referrer', 'name email')
      .populate('sampleCollectedBy', 'name')
      .populate('resultEnteredBy', 'name');

    if (!request) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test request not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test request retrieved successfully',
      data: request
    }));
  } catch (error) {
    next(error);
  }
};

exports.updateTestRequest = async (req, res, next) => {
  try {
    const { status, urgency, notes } = req.body;
    
    const request = await LabTestRequest.findByIdAndUpdate(
      req.params.id,
      { status, urgency, notes },
      { new: true, runValidators: true }
    ).populate('patient', 'name MRH')
     .populate('test', 'testCode testName category department')
     .populate('referrer', 'name');

    if (!request) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test request not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test request updated successfully',
      data: request
    }));
  } catch (error) {
    next(error);
  }
};

exports.markSampleCollected = async (req, res, next) => {
  try {
    const request = await LabTestRequest.findByIdAndUpdate(
      req.params.id,
      {
        sampleCollected: true,
        sampleCollectedAt: new Date(),
        sampleCollectedBy: req.user._id,
        status: 'in_progress'
      },
      { new: true }
    ).populate('patient', 'name MRH')
     .populate('test', 'testCode testName')
     .populate('sampleCollectedBy', 'name');

    if (!request) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test request not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Sample marked as collected',
      data: request
    }));
  } catch (error) {
    next(error);
  }
};

exports.enterResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    
    const request = await LabTestRequest.findByIdAndUpdate(
      req.params.id,
      {
        results,
        resultEnteredAt: new Date(),
        resultEnteredBy: req.user._id,
        status: 'completed'
      },
      { new: true }
    ).populate('patient', 'name MRH')
     .populate('test', 'testCode testName parameters')
     .populate('resultEnteredBy', 'name');

    if (!request) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test request not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test results entered successfully',
      data: request
    }));
  } catch (error) {
    next(error);
  }
};

exports.getPatientTestRequests = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const requests = await LabTestRequest.find({ patient: patientId })
      .populate('test', 'testCode testName category department price turnaroundHours')
      .populate('referrer', 'name')
      .populate('resultEnteredBy', 'name')
      .sort({ assignedAt: -1 });

    res.status(200).json(apiResponse({
      success: true,
      message: 'Patient test requests retrieved successfully',
      data: requests
    }));
  } catch (error) {
    next(error);
  }
};
