import api from './axiosInstance';

const apiClient = api;

const register = async (payload) => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

const login = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

const refreshToken = async () => {
  const response = await apiClient.post('/auth/refresh-token');
  return response.data;
};

export default {
  register,
  login,
  logout,
  refreshToken
};
