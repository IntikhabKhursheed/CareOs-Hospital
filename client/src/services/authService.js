import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/auth',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const login = async (payload) => {
  const response = await apiClient.post('/login', payload);
  return response.data;
};

const logout = async () => {
  const response = await apiClient.post('/logout');
  return response.data;
};

const refreshToken = async () => {
  const response = await apiClient.post('/refresh-token');
  return response.data;
};

export default {
  login,
  logout,
  refreshToken
};
