import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/settings`;

export const getAdminSettings = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminSettings = async (token, settingsData) => {
  const response = await axios.put(API_URL, settingsData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
