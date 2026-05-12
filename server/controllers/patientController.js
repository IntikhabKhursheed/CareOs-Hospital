const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Visit = require('../models/Visit');
const TestCatalog = require('../models/TestCatalog');
const LabTestRequest = require('../models/LabTestRequest');
const generateMRH = require('../utils/generateMRH');
const apiResponse = require('../utils/apiResponse');

exports.createPatient = async (req, res, next) => {
  try {
    const { name, dateOfBirth, gender, bloodGroup, phone, email, address, emergencyContact, allergies, chronicConditions, photo } = req.body;
    const MRH = generateMRH();
    const patient = await Patient.create({
      MRH,
      name,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      photo: photo || '',
      registeredBy: req.user._id
    });
    res.status(201).json(apiResponse({ success: true, message: 'Patient registered successfully', data: patient }));
  } catch (error) {
    next(error);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const { search = '', gender, bloodGroup, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (search) {
      filters.$or = [
        { MRH: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (gender) filters.gender = gender;
    if (bloodGroup) filters.bloodGroup = bloodGroup;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(filters);
    const patients = await Patient.find(filters)
      .populate('registeredBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.status(200).json(apiResponse({ success: true, message: 'Patients retrieved successfully', data: { patients, pagination: { total, page: Number(page), limit: Number(limit) } } }));
  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('registeredBy', 'name email');
    if (!patient) {
      return res.status(404).json(apiResponse({ success: false, message: 'Patient not found', data: null }));
    }
    res.status(200).json(apiResponse({ success: true, message: 'Patient loaded', data: patient }));
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).json(apiResponse({ success: false, message: 'Patient not found', data: null }));
    }
    res.status(200).json(apiResponse({ success: true, message: 'Patient updated successfully', data: patient }));
  } catch (error) {
    next(error);
  }
};

exports.assignTests = async (req, res, next) => {
  try {
    const { patientId, testIds } = req.body;
    
    if (!patientId || !testIds || !Array.isArray(testIds)) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'Patient ID and test IDs array are required',
        data: null
      }));
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Patient not found',
        data: null
      }));
    }

    // Validate test IDs
    const tests = await TestCatalog.find({ _id: { $in: testIds }, isActive: true });
    if (tests.length !== testIds.length) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'Some tests not found or inactive',
        data: null
      }));
    }

    // Add tests to patient (avoid duplicates)
    const existingTestIds = patient.tests || [];
    const newTestIds = testIds.filter(id => !existingTestIds.includes(id));
    
    // Update patient's tests array
    await Patient.findByIdAndUpdate(
      patientId,
      { 
        $addToSet: { tests: newTestIds }
      },
      { new: true }
    );

    // Create LabTestRequest entries for new test assignments
    const referrerId = req.user._id;
    const referrerName = req.user.name;
    const labRequests = [];
    
    for (const testId of newTestIds) {
      try {
        const labRequest = await LabTestRequest.create({
          patient: patientId,
          test: testId,
          referrer: referrerId,
          referrerName,
          status: 'pending',
          urgency: 'routine'
        });
        
        // Populate the request for response
        const populatedRequest = await LabTestRequest.findById(labRequest._id)
          .populate('test', 'testCode testName category department');
        
        labRequests.push(populatedRequest);
      } catch (error) {
        console.error('Failed to create lab request for test:', testId, error);
      }
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Tests assigned successfully',
      data: { 
        assignedTests: newTestIds.length,
        labRequests
      }
    }));
  } catch (error) {
    next(error);
  }
};

exports.removeTests = async (req, res, next) => {
  try {
    const { patientId, testIds } = req.body;
    
    if (!patientId || !testIds || !Array.isArray(testIds)) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'Patient ID and test IDs array are required',
        data: null
      }));
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Patient not found',
        data: null
      }));
    }

    // Remove tests from patient
    await Patient.findByIdAndUpdate(
      patientId,
      { 
        $pull: { tests: { $in: testIds } }
      },
      { new: true }
    );

    res.status(200).json(apiResponse({
      success: true,
      message: 'Tests removed successfully',
      data: { removedTests: testIds.length }
    }));
  } catch (error) {
    next(error);
  }
};

exports.getPatientHistory = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const appointments = await Appointment.find({ patient: patientId }).populate('doctor', 'name role').sort({ date: -1 });
    const visits = await Visit.find({ patient: patientId }).populate('doctor', 'name role').populate('appointment', 'date timeSlot status');
    res.status(200).json(apiResponse({ success: true, message: 'Patient history retrieved', data: { appointments, visits } }));
  } catch (error) {
    next(error);
  }
};
