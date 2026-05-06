import api from './axiosInstance';

const apiClient = api;

const createAppointment = async (payload) => {
  const response = await apiClient.post('/appointments', payload);
  return response.data;
};

const getAppointments = async (params) => {
  const response = await apiClient.get('/appointments', { params });
  return response.data;
};

const updateStatus = async (id, status) => {
  const response = await apiClient.put(`/appointments/${id}/status`, { status });
  return response.data;
};

const getDoctorSchedule = async (params) => {
  const response = await apiClient.get('/appointments/schedule', { params });
  return response.data;
};

const getTodayQueue = async () => {
  const response = await apiClient.get('/appointments/queue/today');
  return response.data;
};

export default {
  createAppointment,
  getAppointments,
  updateStatus,
  getDoctorSchedule,
  getTodayQueue
};
