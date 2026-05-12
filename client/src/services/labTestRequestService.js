import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const apiClient = api;

const getLabQueue = async (params = {}) => {
  const response = await dedupedGet(apiClient, '/lab-requests/queue', { params });
  return response.data;
};

const getTestRequestById = async (id) => {
  const response = await dedupedGet(apiClient, `/lab-requests/${id}`);
  return response.data;
};

const updateTestRequest = async (id, payload) => {
  const response = await apiClient.put(`/lab-requests/${id}`, payload);
  return response.data;
};

const markSampleCollected = async (id) => {
  const response = await apiClient.patch(`/lab-requests/${id}/collect-sample`);
  return response.data;
};

const enterResults = async (id, results) => {
  const response = await apiClient.patch(`/lab-requests/${id}/enter-results`, { results });
  return response.data;
};

const getPatientTestRequests = async (patientId) => {
  const response = await dedupedGet(apiClient, `/lab-requests/patient/${patientId}`);
  return response.data;
};

export default {
  getLabQueue,
  getTestRequestById,
  updateTestRequest,
  markSampleCollected,
  enterResults,
  getPatientTestRequests
};
