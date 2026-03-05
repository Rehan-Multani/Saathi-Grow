import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/orders`;

// Helper to get token based on portal
const getAuthDetails = () => {
  // Try Admin/Staff/Manager in order
  const admin = localStorage.getItem('sathiGro_admin');
  const staff = localStorage.getItem('saathigro_staff') || localStorage.getItem('sathiGro_staff');
  const manager = localStorage.getItem('sathiGro_manager') || localStorage.getItem('saathigro_manager');

  if (admin) return JSON.parse(admin);
  if (staff) return JSON.parse(staff);
  if (manager) return JSON.parse(manager);
  return null;
};

export const getAllOrdersAdmin = async (params = {}) => {
  const auth = getAuthDetails();
  if (!auth) return { orders: [], pagination: {} };

  const { data } = await axios.get(`${API_URL}/admin/list`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    params
  });
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.put(`${API_URL}/admin/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getOrderDetails = async (id) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const deleteOrder = async (id) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.delete(`${API_URL}/admin/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getReturnRequests = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/admin/returns`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const handleReturnRequest = async (id, action, rejectionReason = null) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.put(`${API_URL}/admin/${id}/return`, { action, rejectionReason }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const scheduleReturnPickup = async (id, pickupFee = 30) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.post(`${API_URL}/admin/${id}/return/schedule-pickup`, { pickupFee }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};
