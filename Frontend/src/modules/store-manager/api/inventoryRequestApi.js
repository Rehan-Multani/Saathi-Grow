import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/admin/inventory-requests`;

export const createInventoryRequest = async (token, data) => {
  try {
    const response = await axios.post(BASE_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to request inventory update');
  }
};

export const getInventoryRequests = async (token) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch inventory requests');
  }
};

export const approveInventoryRequest = async (token, id) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve inventory request');
  }
};

export const rejectInventoryRequest = async (token, id) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}/reject`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject inventory request');
  }
};
