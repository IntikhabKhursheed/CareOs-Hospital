import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/appointments`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const createAppointment = async (payload) => {
  const response = await apiClient.post('/', payload);
  return response.data;
};

const getAppointments = async (params) => {
  const response = await apiClient.get('/', { params });
  return response.data;
};

const updateStatus = async (id, status) => {
  const response = await apiClient.put(`/${id}/status`, { status });
  return response.data;
};

const getDoctorSchedule = async (params) => {
  const response = await apiClient.get('/schedule', { params });
  return response.data;
};

const getTodayQueue = async () => {
  const response = await apiClient.get('/queue/today');
  return response.data;
};

export default {
  createAppointment,
  getAppointments,
  updateStatus,
  getDoctorSchedule,
  getTodayQueue
};
