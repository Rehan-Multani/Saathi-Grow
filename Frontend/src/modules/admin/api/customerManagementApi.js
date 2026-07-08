import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin/users`;
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

const extractCustomers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  return [];
};

const extractUser = (payload) => {
  return payload?.user || payload?.data?.user || payload?.data || null;
};

export const getAllCustomers = async (token, params = {}, options = {}) => {
  const response = await fetch(`${API_URL}${buildQuery(params)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch customers');
  const customers = extractCustomers(data);
  if (options.paginated) {
    const pagination = data?.pagination || {};
    return {
      customers,
      pagination: {
        total: Number(pagination.total ?? response.headers.get('x-total-count') ?? 0),
        page: Number(pagination.page ?? response.headers.get('x-page') ?? params.page ?? 1),
        limit: Number(pagination.limit ?? response.headers.get('x-limit') ?? params.limit ?? 10),
        totalPages: Number(pagination.totalPages ?? response.headers.get('x-total-pages') ?? 1)
      }
    };
  }
  return customers;
};

export const getCustomerById = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch customer');
  return extractUser(data);
};

export const createCustomer = async (token, formData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create customer');
  return extractUser(data);
};

export const updateCustomer = async (token, id, formData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update customer');
  return extractUser(data);
};

export const deleteCustomer = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete customer');
  return data;
};

export const bulkDeleteCustomers = async (token, ids = []) => {
  const response = await fetch(`${API_URL}/bulk`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete customers');
  return data;
};

export const sendEmailToCustomer = async (token, id, payload) => {
  const response = await fetch(`${API_URL}/${id}/email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send email');
  return data;
};

export const sendMessageToCustomer = async (token, id, payload) => {
  const response = await fetch(`${API_URL}/${id}/message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send message');
  return data;
};
