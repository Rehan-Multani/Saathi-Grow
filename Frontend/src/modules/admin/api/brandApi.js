const API_BASE_URL = 'http://localhost:5000/api/admin/brands';

export const getBrands = async (token) => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch brands');
  }
  return data;
};

export const createBrand = async (token, brandData) => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: brandData, // Expecting FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create brand');
  }
  return data;
};

export const updateBrand = async (token, id, brandData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: brandData, // Expecting FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update brand');
  }
  return data;
};

export const deleteBrand = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete brand');
  }
  return data;
};

export const getBrandById = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch brand details');
  }
  return data;
};
