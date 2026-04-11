import { API_BASE_URL } from '../../../config/apiConfig';

const ADMIN_URL = `${API_BASE_URL}/admin/locations`;

// Get all locations (optionally filtered by branchId)
export const getAdminLocations = async (token, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.append(k, v); });
  const qs = query.toString() ? `?${query}` : '';
  const res = await fetch(`${ADMIN_URL}${qs}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch locations');
  return data;
};

// Get AVAILABLE locations for a branch (for dropdown in Add/Edit Product)
export const getAvailableAdminLocations = async (token, branchId, currentProductId = null) => {
  const query = new URLSearchParams({ branchId });
  if (currentProductId) query.append('currentProductId', currentProductId);
  const res = await fetch(`${ADMIN_URL}/available?${query}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch available locations');
  return data;
};

export const createAdminLocation = async (token, payload) => {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create location');
  return data;
};

export const bulkCreateAdminLocations = async (token, payload) => {
  const res = await fetch(`${ADMIN_URL}/bulk`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to bulk create locations');
  return data;
};

export const updateAdminLocation = async (token, id, payload) => {
  const res = await fetch(`${ADMIN_URL}/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update location');
  return data;
};

export const deleteAdminLocation = async (token, id) => {
  const res = await fetch(`${ADMIN_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete location');
  return data;
};
