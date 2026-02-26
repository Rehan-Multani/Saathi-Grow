import { API_BASE_URL } from '../../../config/apiConfig';

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/categories`);
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

export const fetchProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch product');
  return data;
};

export const fetchActiveCampaigns = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/campaigns/public`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch campaigns');
  return data;
};

export const fetchActiveOfferDeals = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/offer-deals/public`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch active offers');
  return data;
};
