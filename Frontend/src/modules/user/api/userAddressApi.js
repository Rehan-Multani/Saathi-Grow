import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/user/addresses`;

export const getAddresses = async (token) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch addresses');
  return data;
};

export const addAddress = async (token, addressData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add address');
  return data;
};

export const updateAddress = async (token, id, addressData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update address');
  return data;
};

export const deleteAddress = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete address');
  return data;
};
