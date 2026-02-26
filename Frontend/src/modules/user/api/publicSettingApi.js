import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/settings/public`;

export const getPublicSettings = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch public configurations');
  return data;
};
