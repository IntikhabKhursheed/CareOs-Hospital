import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/patients`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const createPatient = async (payload) => {
  const response = await apiClient.post('/', payload);
  return response.data;
};

const getPatients = async (params) => {
  const response = await apiClient.get('/', { params });
  return response.data;
};

const getPatientById = async (id) => {
  const response = await apiClient.get(`/${id}`);
  return response.data;
};

const updatePatient = async (id, payload) => {
  const response = await apiClient.put(`/${id}`, payload);
  return response.data;
};

const getPatientHistory = async (id) => {
  const response = await apiClient.get(`/${id}/history`);
  return response.data;
};

export default {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  getPatientHistory
};
