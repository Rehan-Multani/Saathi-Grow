import { API_BASE_URL } from '../../../config/apiConfig';

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/categories?hasProducts=true`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
  return data;
};

export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/products?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

export const fetchBrands = async (category = '') => {
  const url = `${API_BASE_URL}/admin/products/brands${category ? `?category=${category}` : ''}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch brands');
  return data;
};

export const fetchProductById = async (id, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/products/${id}?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch product');
  return data;
};

export const fetchActiveCampaigns = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/campaigns/public?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch campaigns');
  return data;
};

export const fetchActiveOfferDeals = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/offer-deals/public?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch active offers');
  return data;
};
export const searchProducts = async (query = '', page = 1, storeParams = {}) => {
  const params = new URLSearchParams({ q: query, page, ...storeParams }).toString();
  const response = await fetch(`${API_BASE_URL}/admin/products/search/ai?${params}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to search products');
  return data;
};

export const getNearbyStores = async (lat, lng, radius = 20000) => {
  const response = await fetch(`${API_BASE_URL}/user/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch nearby stores');
  return data;
};
