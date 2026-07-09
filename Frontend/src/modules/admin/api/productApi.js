import { API_BASE_URL } from '../../../config/apiConfig';

const PRODUCTS_API_BASE_URL = `${API_BASE_URL}/admin/products`;

export const getProducts = async (token, params = {}) => {
  const queryParams = new URLSearchParams({
    limit: params.limit || 10,
    ...params
  }).toString();

  const response = await fetch(`${PRODUCTS_API_BASE_URL}?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch products');
  }
  return data;
};

export const createProduct = async (token, productData) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData, // FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create product');
  }
  return data;
};

export const updateProduct = async (token, id, productData) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData, // FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update product');
  }
  return data;
};

export const deleteProduct = async (token, id) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete product');
  }
  return data;
};

export const getProductById = async (token, id) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch product details');
  }
  return data;
};

export const getAISuggestions = async (token, productName, type) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/ai-suggestions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productName, type }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get AI suggestions');
  }
  return data;
};

export const adjustInventory = async (token, id, adjustmentData) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/${id}/inventory`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adjustmentData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to adjust inventory');
  }
  return data;
};

export const getInventoryLogs = async (token, id) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/${id}/inventory-logs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch inventory logs');
  }
  return data;
};

export const getAllInventoryLogs = async (token, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/inventory-logs?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch global inventory logs');
  }
  return data;
};

export const bulkUploadProductsJson = async (token, products) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/bulk-json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ products }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload products from JSON');
  }
  return data;
};

export const getInventoryStats = async (token, branchId = null) => {
  const queryParams = branchId ? `?branchId=${branchId}` : '';
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/inventory/stats${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch inventory stats');
  }
  return data;
};
export const bulkAdjustInventory = async (token, bulkData) => {
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/inventory/bulk-adjust`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bulkData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to bulk adjust inventory');
  }
  return data;
};

export const getBranchWiseStock = async (token, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/inventory/branch-wise?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch branch-wise stock');
  }
  return data;
};

export const getLowStockAlerts = async (token, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${PRODUCTS_API_BASE_URL}/inventory/low-stock?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch low stock alerts');
  }
  return data;
};
