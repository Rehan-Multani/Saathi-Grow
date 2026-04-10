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

const extractVendors = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.vendors)) return payload.vendors;
  if (Array.isArray(payload?.data?.vendors)) return payload.data.vendors;
  return [];
};

const extractPayouts = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.payouts)) return payload.payouts;
  if (Array.isArray(payload?.data?.payouts)) return payload.data.payouts;
  return [];
};

export const getVendors = async (token, params = {}, options = {}) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}${buildQuery(params)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch vendors');
  const vendors = extractVendors(data);
  if (options.paginated) {
    const pagination = data?.pagination || {};
    return {
      vendors,
      pagination: {
        total: Number(pagination.total ?? response.headers.get('x-total-count') ?? 0),
        page: Number(pagination.page ?? response.headers.get('x-page') ?? params.page ?? 1),
        limit: Number(pagination.limit ?? response.headers.get('x-limit') ?? params.limit ?? 10),
        totalPages: Number(pagination.totalPages ?? response.headers.get('x-total-pages') ?? 1)
      }
    };
  }
  return vendors;
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
  const payouts = extractPayouts(data);
  if (options.paginated) {
    const pagination = data?.pagination || {};
    return {
      payouts,
      stats: data?.stats || null,
      pagination: {
        total: Number(pagination.total ?? response.headers.get('x-total-count') ?? 0),
        page: Number(pagination.page ?? response.headers.get('x-page') ?? params.page ?? 1),
        limit: Number(pagination.limit ?? response.headers.get('x-limit') ?? params.limit ?? 10),
        totalPages: Number(pagination.totalPages ?? response.headers.get('x-total-pages') ?? 1)
      }
    };
  }
  return payouts;
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

export const approvePayoutRequest = async (token, id, referenceNumber, note) => {
  return updatePayoutStatus(token, id, { status: 'Paid', referenceNumber, note });
};

export const rejectPayoutRequest = async (token, id, note) => {
  return updatePayoutStatus(token, id, { status: 'Rejected', note });
};

export const getPayoutById = async (token, id) => {
  const response = await fetch(`${VENDORS_API_BASE_URL}/payouts/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch payout');
  return data;
};

// Aliases for better semantics and backward compatibility with refactored pages
export const getVendorDetails = getVendorById;
export const getVendorPayouts = getPayouts;
