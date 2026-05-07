import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const apiClient = api;

const createAppointment = async (payload) => {
  const response = await apiClient.post('/appointments', payload);
  return response.data;
};

const getAppointments = async (params) => {
  const response = await dedupedGet(apiClient, '/appointments', { params });
  return response.data;
};

const updateStatus = async (id, status) => {
  const response = await apiClient.put(`/appointments/${id}/status`, { status });
  return response.data;
};

const getDoctorSchedule = async (params) => {
  const response = await dedupedGet(apiClient, '/appointments/schedule', { params });
  return response.data;
};

const getTodayQueue = async () => {
  const response = await dedupedGet(apiClient, '/appointments/queue/today');
  return response.data;
};

export default {
  createAppointment,
  getAppointments,
  updateStatus,
  getDoctorSchedule,
  getTodayQueue
};
