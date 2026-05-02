import apiClient from './apiClient';

const generateBill = async (payload, download = false) => {
  const path = `/api/billing${download ? '?download=true' : ''}`;
  const response = await apiClient.post(path, payload, {
    responseType: download ? 'blob' : 'json'
  });
  return response.data || response;
};

const addPayment = async (id, payload) => {
  const response = await apiClient.post(`/api/billing/${id}/payment`, payload);
  return response.data;
};

const getBills = async (params) => {
  const response = await apiClient.get('/api/billing', { params });
  return response.data;
};

const detectAnomalies = async (payload) => {
  const response = await apiClient.post('/api/billing/anomalies', payload);
  return response.data;
};

export default {
  generateBill,
  addPayment,
  getBills,
  detectAnomalies
};
