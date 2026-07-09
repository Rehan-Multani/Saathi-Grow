import { API_BASE_URL } from '../../../config/apiConfig';

const CATEGORIES_API_BASE_URL = `${API_BASE_URL}/admin/categories`;

export const getCategories = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const response = await fetch(`${CATEGORIES_API_BASE_URL}${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch categories');
  }
  return data;
};

export const createCategory = async (token, categoryData) => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: categoryData, // Expecting FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create category');
  }
  return data;
};

export const updateCategory = async (token, id, categoryData) => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: categoryData, // Expecting FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update category');
  }
  return data;
};

export const deleteCategory = async (token, id) => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete category');
  }
  return data;
};

export const getCategoryById = async (token, id) => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch category details');
  }
  return data;
};

export const bulkUploadCategories = async (token, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${CATEGORIES_API_BASE_URL}/bulk-upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to bulk upload categories');
  }
  return data;
};
