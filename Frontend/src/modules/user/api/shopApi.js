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

export const fetchCampaignMetadata = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/campaigns/public/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch campaign metadata');
  return data;
};

export const fetchActiveOfferDeals = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/offer-deals/public?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch active offers');
  return data;
};

export const fetchCampaignProducts = async (id, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/campaigns/public/${id}/products?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch campaign products');
  return data;
};

export const fetchOfferProducts = async (id, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/offer-deals/public/${id}/products?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch offer products');
  return data;
};
export const searchProducts = async (query = '', page = 1, storeParams = {}) => {
  const params = new URLSearchParams({ q: query, page, ...storeParams }).toString();
  const response = await fetch(`${API_BASE_URL}/admin/products/search/ai?${params}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to search products');
  return data;
};

export const getNearbyStores = async (lat, lng, radius) => {
  const url = `${API_BASE_URL}/user/stores/nearby?lat=${lat}&lng=${lng}${radius ? `&radius=${radius}` : ''}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch nearby stores');
  return data;
};

export const logDemandRequest = async (payload, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/demand`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to log demand');
  return data;
};

export const fetchPublicSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings/public`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch settings');
  return data;
};

export const fetchProductReviews = async (productId, page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch reviews');
  return data;
};

export const submitProductReview = async (payload, token) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit review');
  return data;
};
