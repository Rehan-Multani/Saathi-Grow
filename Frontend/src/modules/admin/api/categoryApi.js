const API_BASE_URL = 'http://localhost:5000/api/admin/categories';

export const getCategories = async (token) => {
  const response = await fetch(`${API_BASE_URL}`, {
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
  const response = await fetch(`${API_BASE_URL}`, {
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
  const response = await fetch(`${API_BASE_URL}/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/${id}`, {
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
