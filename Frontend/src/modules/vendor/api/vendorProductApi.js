import { API_BASE_URL } from '../../../config/apiConfig';

const VENDOR_PRODUCTS_API_BASE_URL = `${API_BASE_URL}/vendors/products`;

export const getVendorProducts = async (token) => {
  const response = await fetch(VENDOR_PRODUCTS_API_BASE_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

export const addVendorProduct = async (token, productData) => {
  const isFormData = productData instanceof FormData;
  const headers = { 'Authorization': `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(VENDOR_PRODUCTS_API_BASE_URL, {
    method: 'POST',
    headers,
    body: isFormData ? productData : JSON.stringify(productData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add product');
  return data;
};

export const updateVendorProduct = async (token, id, productData) => {
  const isFormData = productData instanceof FormData;
  const headers = { 'Authorization': `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${VENDOR_PRODUCTS_API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers,
    body: isFormData ? productData : JSON.stringify(productData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update product');
  return data;
};

export const deleteVendorProduct = async (token, id) => {
  const response = await fetch(`${VENDOR_PRODUCTS_API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
};

export const getVendorAISuggestions = async (token, productName, type) => {
  const response = await fetch(`${API_BASE_URL}/vendors/products/ai-suggestions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productName, type })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch AI suggestions');
  return data;
};

export const getBranchesForVendor = async (token) => {
  const response = await fetch(`${API_BASE_URL}/vendors/branches`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch branches');
  return data;
};
