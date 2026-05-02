const aiService = require('../services/aiService');
const apiResponse = require('../utils/apiResponse');

exports.generateClinicalNote = async (req, res, next) => {
  try {
    const { chiefComplaint, symptoms, vitalSigns, patientHistory } = req.body;
    const note = await aiService.generateClinicalNote(chiefComplaint, symptoms, vitalSigns, patientHistory);
    res.status(200).json(apiResponse({ success: true, message: 'Clinical note generated', data: { note } }));
  } catch (error) {
    next(error);
  }
};

exports.suggestDiagnosis = async (req, res, next) => {
  try {
    const { symptoms, vitalSigns, patientAge, patientGender, conditions } = req.body;
    const result = await aiService.suggestDiagnosis(symptoms, vitalSigns, patientAge, patientGender, conditions);
    res.status(200).json(apiResponse({ success: true, message: 'Diagnosis suggestions generated', data: result }));
  } catch (error) {
    next(error);
  }
};

exports.checkDrugInteraction = async (req, res, next) => {
  try {
    const { medicines } = req.body;
    const result = await aiService.checkDrugInteraction(medicines);
    res.status(200).json(apiResponse({ success: true, message: 'Drug interaction results generated', data: result }));
  } catch (error) {
    next(error);
  }
};

exports.interpretLabResults = async (req, res, next) => {
  try {
    const { testName, results, patientAge, patientGender, history } = req.body;
    const result = await aiService.interpretLabResults(testName, results, patientAge, patientGender, history);
    res.status(200).json(apiResponse({ success: true, message: 'Lab results interpreted', data: result }));
  } catch (error) {
    next(error);
  }
};

exports.generateDischargeSummary = async (req, res, next) => {
  try {
    const { admissionDetails, diagnosis, procedures, medications } = req.body;
    const summary = await aiService.generateDischargeSummary(admissionDetails, diagnosis, procedures, medications);
    res.status(200).json(apiResponse({ success: true, message: 'Discharge summary generated', data: { summary } }));
  } catch (error) {
    next(error);
  }
};

exports.identifyFollowUps = async (req, res, next) => {
  try {
    const { patients } = req.body;
    const result = await aiService.identifyFollowUps(patients);
    res.status(200).json(apiResponse({ success: true, message: 'Follow-ups identified', data: result }));
  } catch (error) {
    next(error);
  }
};

exports.detectBillingAnomaly = async (req, res, next) => {
  try {
    const { visitDetails, billedItems } = req.body;
    const result = await aiService.detectBillingAnomaly(visitDetails, billedItems);
    res.status(200).json(apiResponse({ success: true, message: 'Billing anomaly detection complete', data: result }));
  } catch (error) {
    next(error);
  }
};

exports.generateWeeklyReport = async (req, res, next) => {
  try {
    const { weeklyStats } = req.body;
    const report = await aiService.generateWeeklyReport(weeklyStats);
    res.status(200).json(apiResponse({ success: true, message: 'Weekly report generated', data: { report } }));
  } catch (error) {
    next(error);
  }
};
