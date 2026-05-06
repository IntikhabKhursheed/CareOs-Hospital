import api from './axiosInstance';

const generateBill = async (payload, download = false) => {
  const path = `/billing${download ? '?download=true' : ''}`;
  const response = await api.post(path, payload, {
    responseType: download ? 'blob' : 'json'
  });
  return response.data || response;
};

const addPayment = async (id, payload) => {
  const response = await api.post(`/billing/${id}/payment`, payload);
  return response.data;
};

const getBills = async (params) => {
  const response = await api.get('/billing', { params });
  return response.data;
};

const detectAnomalies = async (payload) => {
  const response = await api.post('/billing/anomalies', payload);
  return response.data;
};

export default {
  generateBill,
  addPayment,
  getBills,
  detectAnomalies
};
