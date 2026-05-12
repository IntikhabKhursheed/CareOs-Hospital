import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const apiClient = api;

const createDoctor = async (payload) => {
  const response = await apiClient.post('/doctors', payload);
  return response.data;
};

const getDoctors = async (params) => {
  const response = await dedupedGet(apiClient, '/doctors', { params });
  return response.data;
};

const getDoctorById = async (id) => {
  const response = await dedupedGet(apiClient, `/doctors/${id}`);
  return response.data;
};

const updateDoctor = async (id, payload) => {
  const response = await apiClient.put(`/doctors/${id}`, payload);
  return response.data;
};

export default {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor
};
