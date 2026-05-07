import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const apiClient = api;

const createPatient = async (payload) => {
  const response = await apiClient.post('/patients', payload);
  return response.data;
};

const getPatients = async (params) => {
  const response = await dedupedGet(apiClient, '/patients', { params });
  return response.data;
};

const getPatientById = async (id) => {
  const response = await dedupedGet(apiClient, `/patients/${id}`);
  return response.data;
};

const updatePatient = async (id, payload) => {
  const response = await apiClient.put(`/patients/${id}`, payload);
  return response.data;
};

const getPatientHistory = async (id) => {
  const response = await dedupedGet(apiClient, `/patients/${id}/history`);
  return response.data;
};

const deletePatient = async (id) => {
  const response = await apiClient.delete(`/patients/${id}`);
  return response.data;
};

export default {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  getPatientHistory,
  deletePatient
};
