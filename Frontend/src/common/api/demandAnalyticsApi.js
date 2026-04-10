import { API_BASE_URL } from '../../config/apiConfig';

const getAuthHeaders = () => {
  const savedAdmin = localStorage.getItem('sathiGro_admin');
  const adminData = savedAdmin ? JSON.parse(savedAdmin) : null;
  const token = adminData?.token;

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchDemandAnalytics = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/demand/admin?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch demand analytics');
  return data;
};
