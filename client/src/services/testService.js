import api from './axiosInstance';
import { dedupedGet } from './requestManager';

const apiClient = api;

const createTest = async (payload) => {
  const response = await apiClient.post('/tests', payload);
  return response.data;
};

const getAllTests = async (params) => {
  const response = await dedupedGet(apiClient, '/tests', { params });
  return response.data;
};

const searchTests = async (params) => {
  const response = await dedupedGet(apiClient, '/tests/search', { params });
  return response.data;
};

const getTestById = async (id) => {
  const response = await dedupedGet(apiClient, `/tests/${id}`);
  return response.data;
};

const updateTest = async (id, payload) => {
  const response = await apiClient.put(`/tests/${id}`, payload);
  return response.data;
};

const deleteTest = async (id) => {
  const response = await apiClient.delete(`/tests/${id}`);
  return response.data;
};

export default {
  createTest,
  getAllTests,
  searchTests,
  getTestById,
  updateTest,
  deleteTest
};
