import api from './axiosInstance';

const getLabQueue = async () => {
  const response = await api.get('/lab/queue');
  return response.data;
};

const createLabOrder = async (payload) => {
  const response = await api.post('/lab', payload);
  return response.data;
};

const updateResults = async (id, payload) => {
  const response = await api.post(`/lab/${id}/results`, payload);
  return response.data;
};

const verifyResults = async (id, payload) => {
  const response = await api.post(`/lab/${id}/verify`, payload);
  return response.data;
};

const getPatientLabReports = async (patientId) => {
  const response = await api.get(`/lab/patient/${patientId}`);
  return response.data;
};

export default {
  getLabQueue,
  createLabOrder,
  updateResults,
  verifyResults,
  getPatientLabReports
};
