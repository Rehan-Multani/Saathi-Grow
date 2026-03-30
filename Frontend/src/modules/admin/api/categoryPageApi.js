import { API_BASE_URL } from '../../../config/apiConfig';

const CATEGORY_PAGES_API_BASE_URL = `${API_BASE_URL}/admin/category-pages`;

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const getPayloadOptions = (token, payload, method = 'POST') => {
  const isFormData = payload instanceof FormData;

  return {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    },
    body: isFormData ? payload : JSON.stringify(payload)
  };
};

export const getCategoryPages = async (token) => request(CATEGORY_PAGES_API_BASE_URL, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const getCategoryPageById = async (token, id) => request(`${CATEGORY_PAGES_API_BASE_URL}/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const createCategoryPage = async (token, payload) => request(
  CATEGORY_PAGES_API_BASE_URL,
  getPayloadOptions(token, payload, 'POST')
);

export const updateCategoryPage = async (token, id, payload) => request(
  `${CATEGORY_PAGES_API_BASE_URL}/${id}`,
  getPayloadOptions(token, payload, 'PUT')
);

export const deleteCategoryPage = async (token, id) => request(`${CATEGORY_PAGES_API_BASE_URL}/${id}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${token}`
  }
});
