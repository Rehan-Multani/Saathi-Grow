import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getStoreComplaints = async (token) => {
  const response = await axios.get(`${BASE_URL}/complaints/store/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const resolveComplaintByStore = async (token, resolutionData) => {
  const response = await axios.put(`${BASE_URL}/complaints/store/resolve`, resolutionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
