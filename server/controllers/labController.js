const LabTest = require('../models/LabTest');
const Patient = require('../models/Patient');
const apiResponse = require('../utils/apiResponse');
const aiService = require('../services/aiService');

exports.createLabOrder = async (req, res, next) => {
  try {
    const { patient, testName, testCode, category, priority, sampleBarcode } = req.body;
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json(apiResponse({ success: false, message: 'Patient not found', data: null }));
    }
    const labTest = await LabTest.create({
      patient,
      orderedBy: req.user._id,
      testName,
      testCode: testCode || '',
      category: category || '',
      priority: priority || 'routine',
      sampleBarcode: sampleBarcode || ''
    });
    res.status(201).json(apiResponse({ success: true, message: 'Lab order created', data: labTest }));
  } catch (error) {
    next(error);
  }
};

exports.updateResults = async (req, res, next) => {
  try {
    const { results, status } = req.body;
    const labTest = await LabTest.findById(req.params.id);
    if (!labTest) {
      return res.status(404).json(apiResponse({ success: false, message: 'Lab order not found', data: null }));
    }
    labTest.results = results || labTest.results;
    labTest.status = status || 'resulted';
    const criticalFound = (labTest.results || []).some((item) => item.flag === 'critical');
    if (criticalFound && !labTest.criticalValueAlerted) {
      req.app.get('io')?.emit('critical_value_alert', { labTestId: labTest._id, patient: labTest.patient, testName: labTest.testName });
      labTest.criticalValueAlerted = true;
    }
    await labTest.save();
    res.status(200).json(apiResponse({ success: true, message: 'Lab results updated', data: labTest }));
  } catch (error) {
    next(error);
  }
};

exports.verifyResults = async (req, res, next) => {
  try {
    const { patientAge, patientGender, history } = req.body;
    const labTest = await LabTest.findById(req.params.id).populate('patient', 'name dateOfBirth');
    if (!labTest) {
      return res.status(404).json(apiResponse({ success: false, message: 'Lab order not found', data: null }));
    }
    labTest.status = 'verified';
    const aiResult = await aiService.interpretLabResults(
      labTest.testName,
      labTest.results,
      patientAge || '',
      patientGender || '',
      history || ''
    );
    labTest.aiInterpretation = `${aiResult.interpretation}\nClinical significance: ${aiResult.clinicalSignificance}\nRecommendations: ${Array.isArray(aiResult.recommendations) ? aiResult.recommendations.join('; ') : aiResult.recommendations}`;
    await labTest.save();
    res.status(200).json(apiResponse({ success: true, message: 'Lab results verified', data: { labTest, aiInterpretation: aiResult } }));
  } catch (error) {
    next(error);
  }
};

exports.getLabQueue = async (req, res, next) => {
  try {
    const { status = 'ordered' } = req.query;
    const queue = await LabTest.find({ status })
      .populate('patient', 'MRH name')
      .populate('orderedBy', 'name role')
      .sort({ createdAt: 1 });
    res.status(200).json(apiResponse({ success: true, message: 'Lab queue retrieved', data: queue }));
  } catch (error) {
    next(error);
  }
};

exports.getPatientLabReports = async (req, res, next) => {
  try {
    const reports = await LabTest.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
    res.status(200).json(apiResponse({ success: true, message: 'Patient lab reports retrieved', data: reports }));
  } catch (error) {
    next(error);
  }
};
