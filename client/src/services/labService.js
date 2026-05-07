import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const getLabQueue = async () => {
  const response = await dedupedGet(api, '/lab/queue');
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
  const response = await dedupedGet(api, `/lab/patient/${patientId}`);
  return response.data;
};

export default {
  getLabQueue,
  createLabOrder,
  updateResults,
  verifyResults,
  getPatientLabReports
};
