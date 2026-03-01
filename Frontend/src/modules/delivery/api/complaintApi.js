import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/complaints`;

export const getPartnerComplaints = async (token) => {
  const response = await axios.get(`${BASE_URL}/partner/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
