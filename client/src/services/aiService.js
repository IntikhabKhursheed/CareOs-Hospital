import api from './axiosInstance';

const generateClinicalNote = async (payload) => {
  const response = await api.post('/ai/clinical-note', payload);
  return response.data;
};

const suggestDiagnosis = async (payload) => {
  const response = await api.post('/ai/diagnosis', payload);
  return response.data;
};

const checkDrugInteraction = async (payload) => {
  const response = await api.post('/ai/drug-interaction', payload);
  return response.data;
};

const interpretLabResults = async (payload) => {
  const response = await api.post('/ai/interpret-lab', payload);
  return response.data;
};

const generateDischargeSummary = async (payload) => {
  const response = await api.post('/ai/discharge-summary', payload);
  return response.data;
};

const identifyFollowUps = async (payload) => {
  const response = await api.post('/ai/follow-ups', payload);
  return response.data;
};

const detectBillingAnomaly = async (payload) => {
  const response = await api.post('/ai/billing-anomaly', payload);
  return response.data;
};

const generateWeeklyReport = async (payload) => {
  const response = await api.post('/ai/weekly-report', payload);
  return response.data;
};

const generateWeeklyReportV2 = async (payload) => {
  const response = await api.post('/ai/generate-weekly-report', payload);
  return response.data;
};

export default {
  generateClinicalNote,
  suggestDiagnosis,
  checkDrugInteraction,
  interpretLabResults,
  generateDischargeSummary,
  identifyFollowUps,
  detectBillingAnomaly,
  generateWeeklyReport,
  generateWeeklyReportV2
};
