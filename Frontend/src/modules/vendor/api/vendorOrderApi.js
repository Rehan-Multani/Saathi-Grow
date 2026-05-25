import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/vendors`;

export const getVendorOrders = async (token, params = {}) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params
  };
  const { data } = await axios.get(`${API_URL}/orders`, config);
  return data;
};

export const lookupVendorOrder = async (token, trackingId) => {
  const { data } = await axios.get(`${API_URL}/orders/lookup`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { trackingId: trackingId.trim() },
  });
  return data;
};

export const updateVendorOrderStatus = async (token, orderId, status) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const { data } = await axios.put(`${API_URL}/orders/${orderId}/status`, { status }, config);
  return data;
};

export const getVendorReturns = async (token, params = {}) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params
  };
  const { data } = await axios.get(`${API_URL}/returns`, config);
  return data;
};

export const handleStoreReturnAction = async (token, orderId, action, rejectionReason) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const { data } = await axios.put(`${API_URL}/returns/${orderId}`, { action, rejectionReason }, config);
  return data;
};
