import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const raiseComplaint = async (token, complaintData) => {
  const isFormData = complaintData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await axios.post(`${BASE_URL}/complaints/raise`, complaintData, {
    headers
  });
  return response.data;
};


export const getUserComplaints = async (token) => {
  const response = await axios.get(`${BASE_URL}/complaints/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

