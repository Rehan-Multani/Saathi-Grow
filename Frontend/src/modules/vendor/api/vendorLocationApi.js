import { API_BASE_URL } from '../../../config/apiConfig';

const VENDOR_URL = `${API_BASE_URL}/vendors/locations`;

export const getVendorLocations = async (token, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.append(k, v); });
  const qs = query.toString() ? `?${query}` : '';
  const res = await fetch(`${VENDOR_URL}${qs}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch locations');
  return data;
};

export const getAvailableVendorLocations = async (token, currentProductId = null) => {
  const query = new URLSearchParams();
  if (currentProductId) query.append('currentProductId', currentProductId);
  const qs = query.toString() ? `?${query}` : '';
  const res = await fetch(`${VENDOR_URL}/available${qs}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch available locations');
  return data;
};

export const createVendorLocation = async (token, payload) => {
  const res = await fetch(VENDOR_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create location');
  return data;
};

export const updateVendorLocation = async (token, id, payload) => {
  const res = await fetch(`${VENDOR_URL}/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update location');
  return data;
};

export const deleteVendorLocation = async (token, id) => {
  const res = await fetch(`${VENDOR_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete location');
  return data;
};
