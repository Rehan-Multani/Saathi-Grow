import { API_BASE_URL } from '../../../config/apiConfig';

const VENDORS_API_BASE_URL = `${API_BASE_URL}/admin/vendors`;

export const getVendors = async (token) => {
  const response = await fetch(VENDORS_API_BASE_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch vendors');
  return data;
};

export const createVendor = async (token, vendorData) => {
  const isFormData = vendorData instanceof FormData;
  const headers = { 'Authorization': `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(VENDORS_API_BASE_URL, {
    method: 'POST',
    headers,
    body: isFormData ? vendorData : JSON.stringify(vendorData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create vendor');
  return data;
};

export const updateVendor = async (token, id, vendorData) => {
  const isFormData = vendorData instanceof FormData;
  const headers = { 'Authorization': `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${VENDORS_API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers,
    body: isFormData ? vendorData : JSON.stringify(vendorData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update vendor');
  return data;
};

export const deleteVendor = async (token, id) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete vendor');
  return data;
};

export const getVendorById = async (token, id) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch vendor details');
  return data;
};

// Payouts
export const getPayouts = async (token) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}/payouts`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch payouts');
  return data;
};

export const updatePayoutStatus = async (token, id, payoutData) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}/payouts/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payoutData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update payout status');
  return data;
};
