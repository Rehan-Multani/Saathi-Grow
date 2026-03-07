import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/vendors/wallet`;

export const getVendorWallet = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const { data } = await axios.get(`${API_URL}`, config);
  return data;
};

export const getVendorWalletStats = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const { data } = await axios.get(`${API_URL}/stats`, config);
  return data;
};
