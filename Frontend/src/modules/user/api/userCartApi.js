import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/user/cart`;

export const getCart = async (token) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch cart');
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

export const syncCart = async (token, cartItems) => {
  const response = await fetch(`${API_URL}/sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cartItems })
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to sync cart');
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

export const clearCartOnServer = async (token) => {
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to clear cart');
  return data;
};
