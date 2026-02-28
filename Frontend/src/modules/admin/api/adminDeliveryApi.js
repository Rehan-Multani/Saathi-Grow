import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin/delivery`;

// Helper to get token based on portal
const getAuthDetails = () => {
  const admin = localStorage.getItem('sathiGro_admin');
  const manager = localStorage.getItem('saathigro_manager');
  if (admin) return JSON.parse(admin);
  if (manager) return JSON.parse(manager);
  return null;
};

export const getDeliveryPartners = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const addDeliveryPartner = async (partnerData) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(API_URL, partnerData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const updateDeliveryPartnerStatus = async (id, authStatus) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.put(`${API_URL}/${id}/status`, { authStatus }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const deleteDeliveryPartner = async (id) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

// Dispatch & Assignment APIs

export const getUnassignedOrders = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/unassigned-orders`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getAvailablePartners = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/available`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const assignOrder = async (orderId, partnerId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/assign`, { orderId, partnerId }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const unassignOrder = async (orderId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/unassign`, { orderId }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const autoAssignOrder = async (orderId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/auto-assign/${orderId}`, {}, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getActiveTracking = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/active-tracking`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};
