import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/wallet`;

export const fetchWalletData = async (token) => {
  const response = await fetch(`${API_URL}/data`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to load wallet data');
  return data;
};

export const initiateTopup = async (token, amount) => {
  const response = await fetch(`${API_URL}/topup/initiate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to initiate topup');
  return data;
};

export const verifyTopup = async (token, paymentPayload) => {
  const response = await fetch(`${API_URL}/topup/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentPayload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to verify topup');
  return data;
};
