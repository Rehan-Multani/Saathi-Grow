import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/complaints`;

export const raiseComplaint = async (token, complaintData) => {
  const isFormData = complaintData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await axios.post(`${BASE_URL}/raise`, complaintData, {
    headers
  });
  return response.data;
};


export const getUserComplaints = async (token) => {
  const response = await axios.get(`${BASE_URL}/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

