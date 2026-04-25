import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = API_BASE_URL;

export const requestOTP = async (phone) => {
  const { data } = await axios.post(`${API_URL}/delivery/auth/request-otp`, { phone });
  return data;
};

export const registerDeliveryPartner = async (formData) => {
  const { data } = await axios.post(`${API_URL}/delivery/auth/register`, formData);
  return data;
};

export const verifyOTP = async (phone, otp) => {
  const { data } = await axios.post(`${API_URL}/delivery/auth/verify-otp`, { phone, otp });
  return data;
};

export const getDeliveryProfile = async (token) => {
  const { data } = await axios.get(`${API_URL}/delivery/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateDeliveryProfile = async (token, formData) => {
  const { data } = await axios.put(`${API_URL}/delivery/auth/profile`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const changeDeliveryPassword = async (token, currentPassword, newPassword) => {
  const { data } = await axios.put(`${API_URL}/delivery/auth/change-password`,
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
