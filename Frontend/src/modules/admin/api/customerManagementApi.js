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

export const getAllCustomers = async (token, params = {}, options = {}) => {
  const response = await fetch(`${API_URL}${buildQuery(params)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch customers');
  if (options.paginated) {
    return {
      customers: data.users,
      pagination: {
        total: Number(response.headers.get('x-total-count') || 0),
        page: Number(response.headers.get('x-page') || params.page || 1),
        limit: Number(response.headers.get('x-limit') || params.limit || 10),
        totalPages: Number(response.headers.get('x-total-pages') || 1)
      }
    };
  }
  return data.users;
};

export const getCustomerById = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch customer');
  return data.user;
};

export const createCustomer = async (token, formData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create customer');
  return data.user;
};

export const updateCustomer = async (token, id, formData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update customer');
  return data.user;
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
