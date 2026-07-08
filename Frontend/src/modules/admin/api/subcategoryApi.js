import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin/subcategories`;

export const getSubCategories = async (token, params = {}) => {
  const { categoryId, categoryName, status, search, page, limit } = params;
  let url = API_URL;
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (categoryName) queryParams.append('categoryName', categoryName);
  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (queryParams.toString()) url += `?${queryParams.toString()}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createSubCategory = async (token, formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateSubCategory = async (token, id, formData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteSubCategory = async (token, id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
