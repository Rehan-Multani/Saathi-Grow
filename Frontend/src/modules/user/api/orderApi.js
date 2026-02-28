import { API_BASE_URL } from '../../../config/apiConfig';
import axios from 'axios';

const API_URL = `${API_BASE_URL}/orders`;

export const createRazorpayOrder = async (token, items) => {
  const response = await fetch(`${API_URL}/razorpay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create Razorpay secure window');
  return data;
};

export const calculateBill = async (token, items) => {
  const response = await fetch(`${API_URL}/calculate-bill`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to calculate secure bill summary');
  return data;
};

export const verifyRazorpayPayment = async (token, paymentPayload) => {
  const response = await fetch(`${API_URL}/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentPayload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to verify exact transaction logic');
  return data;
};

export const createCODOrder = async (token, orderData) => {
  const response = await fetch(`${API_URL}/cod`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orderData })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate COD order layout');
  return data;
};

export const createWalletOrder = async (token, orderData) => {
  const response = await fetch(`${API_URL}/wallet`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orderData })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to process wallet payment');
  return data;
};

export const fetchMyOrders = async (token) => {
  const response = await fetch(`${API_URL}/myorders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Can't load transaction history currently");
  return data;
};

export const fetchOrderDetails = async (token, orderId) => {
  const response = await fetch(`${API_URL}/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error syncing single historical layout');
  return data;
};

export const cancelOrder = async (token, orderId, reason) => {
  try {
    const { data } = await axios.post(`${API_URL}/${orderId}/cancel`, { reason }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel order secure layout');
  }
};

export const submitReturnRequest = async (token, orderId, { reason, description }) => {
  try {
    const { data } = await axios.post(`${API_URL}/${orderId}/return`, { reason, description }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit return request');
  }
};
