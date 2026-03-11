import { API_BASE_URL } from '../../../config/apiConfig';

const VENDORS_API_BASE_URL = `${API_BASE_URL}/admin/vendors`;
const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const getVendors = async (token, params = {}, options = {}) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}${buildQuery(params)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch vendors');
  if (options.paginated) {
    return {
      vendors: data,
      pagination: {
        total: Number(response.headers.get('x-total-count') || 0),
        page: Number(response.headers.get('x-page') || params.page || 1),
        limit: Number(response.headers.get('x-limit') || params.limit || 10),
        totalPages: Number(response.headers.get('x-total-pages') || 1)
      }
    };
  }
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
export const getPayouts = async (token, params = {}, options = {}) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}/payouts${buildQuery(params)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch payouts');
  if (options.paginated) {
    return {
      payouts: data,
      pagination: {
        total: Number(response.headers.get('x-total-count') || 0),
        page: Number(response.headers.get('x-page') || params.page || 1),
        limit: Number(response.headers.get('x-limit') || params.limit || 10),
        totalPages: Number(response.headers.get('x-total-pages') || 1)
      }
    };
  }
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
