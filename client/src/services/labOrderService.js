import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const apiClient = api;

const createLabOrder = async (payload) => {
  const response = await apiClient.post('/lab-orders', payload);
  return response.data;
};

const getLabOrders = async (params = {}) => {
  const response = await dedupedGet(apiClient, '/lab-orders', { params });
  return response.data;
};

const getLabOrderById = async (id) => {
  const response = await dedupedGet(apiClient, `/lab-orders/${id}`);
  return response.data;
};

const updateOrderStatus = async (id, payload) => {
  const response = await apiClient.put(`/lab-orders/${id}/status`, payload);
  return response.data;
};

const enterResults = async (id, payload) => {
  const response = await apiClient.put(`/lab-orders/${id}/results`, payload);
  return response.data;
};

const getPatientLabHistory = async (patientId) => {
  const response = await dedupedGet(apiClient, `/lab-orders/patient/${patientId}`);
  return response.data;
};

export default {
  createLabOrder,
  getLabOrders,
  getLabOrderById,
  updateOrderStatus,
  enterResults,
  getPatientLabHistory
};
