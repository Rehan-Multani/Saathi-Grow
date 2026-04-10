import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/complaints`;

// Admin APIs
export const getAllComplaintsForAdmin = async (token) => {
  const response = await axios.get(`${BASE_URL}/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const escalateToStore = async (token, ticketId, adminNotes) => {
  const response = await axios.put(`${BASE_URL}/admin/escalate`, { ticketId, adminNotes }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Store APIs (Vendor / Branch)
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

export const closeTicket = async (token, ticketId, processRefund, refundAmount) => {
  const response = await axios.put(`${BASE_URL}/admin/close`, { ticketId, processRefund, refundAmount }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
