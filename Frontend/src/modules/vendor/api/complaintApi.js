import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/complaints`;

export const getStoreComplaints = async (token) => {
  const response = await axios.get(`${BASE_URL}/store/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const resolveComplaintByStore = async (token, resolutionData) => {
  const response = await axios.put(`${BASE_URL}/store/resolve`, resolutionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
