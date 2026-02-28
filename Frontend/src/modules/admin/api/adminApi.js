import { API_BASE_URL } from '../../../config/apiConfig';

const ADMIN_BASE_URL = `${API_BASE_URL}/admin`;

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${ADMIN_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const getProfile = async (token) => {
  const response = await fetch(`${ADMIN_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }
  return data;
};

export const updateProfile = async (token, profileData) => {
  const isFormData = profileData instanceof FormData;

  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${ADMIN_BASE_URL}/profile`, {
    method: 'PUT',
    headers,
    body: isFormData ? profileData : JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data;
};

export const getAllStaff = async (token) => {
  const response = await fetch(`${ADMIN_BASE_URL}/staff`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch staff');
  return data;
};

export const createStaff = async (token, staffData) => {
  const response = await fetch(`${ADMIN_BASE_URL}/staff`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(staffData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create staff');
  return data;
};

export const updateStaff = async (token, id, staffData) => {
  const response = await fetch(`${ADMIN_BASE_URL}/staff/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(staffData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update staff');
  return data;
};

export const deleteStaff = async (token, id) => {
  const response = await fetch(`${ADMIN_BASE_URL}/staff/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete staff');
  return data;
};

export const getDashboardStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard stats');
  return data;
};
