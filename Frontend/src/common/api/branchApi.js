import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin/branches`;
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

export const getBranches = async (token, params = {}, options = {}) => {
  const response = await fetch(`${API_URL}${buildQuery(params)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch branches');
  if (options.paginated) {
    return {
      branches: data,
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

export const createBranch = async (token, branchData) => {
  const isFormData = branchData instanceof FormData;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    },
    body: isFormData ? branchData : JSON.stringify(branchData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create branch');
  return data;
};

export const updateBranch = async (token, id, branchData) => {
  const isFormData = branchData instanceof FormData;
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    },
    body: isFormData ? branchData : JSON.stringify(branchData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update branch');
  return data;
};

export const deleteBranch = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete branch');
  return data;
};

export const getBranchById = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch branch');
  return data;
};
