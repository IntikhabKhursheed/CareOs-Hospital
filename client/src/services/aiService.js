import apiClient from './apiClient';

const generateClinicalNote = async (payload) => {
  const response = await apiClient.post('/api/ai/clinical-note', payload);
  return response.data;
};

const suggestDiagnosis = async (payload) => {
  const response = await apiClient.post('/api/ai/diagnosis', payload);
  return response.data;
};

const checkDrugInteraction = async (payload) => {
  const response = await apiClient.post('/api/ai/drug-interaction', payload);
  return response.data;
};

const interpretLabResults = async (payload) => {
  const response = await apiClient.post('/api/ai/interpret-lab', payload);
  return response.data;
};

const generateDischargeSummary = async (payload) => {
  const response = await apiClient.post('/api/ai/discharge-summary', payload);
  return response.data;
};

const identifyFollowUps = async (payload) => {
  const response = await apiClient.post('/api/ai/follow-ups', payload);
  return response.data;
};

const detectBillingAnomaly = async (payload) => {
  const response = await apiClient.post('/api/ai/billing-anomaly', payload);
  return response.data;
};

const generateWeeklyReport = async (payload) => {
  const response = await apiClient.post('/api/ai/weekly-report', payload);
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
  generateWeeklyReport
};
