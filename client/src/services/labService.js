import apiClient from './apiClient';

const getLabQueue = async () => {
  const response = await apiClient.get('/api/lab/queue');
  return response.data;
};

const createLabOrder = async (payload) => {
  const response = await apiClient.post('/api/lab', payload);
  return response.data;
};

const updateResults = async (id, payload) => {
  const response = await apiClient.post(`/api/lab/${id}/results`, payload);
  return response.data;
};

const verifyResults = async (id, payload) => {
  const response = await apiClient.post(`/api/lab/${id}/verify`, payload);
  return response.data;
};

const getPatientLabReports = async (patientId) => {
  const response = await apiClient.get(`/api/lab/patient/${patientId}`);
  return response.data;
};

export default {
  getLabQueue,
  createLabOrder,
  updateResults,
  verifyResults,
  getPatientLabReports
};
