import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

// Helper to get token based on portal
const getAuthDetails = () => {
  // Try Admin/Staff/Manager in order
  const admin = localStorage.getItem('sathiGro_admin');
  const staff = localStorage.getItem('sathiGro_staff');
  const manager = localStorage.getItem('sathiGro_manager');

  if (admin) return JSON.parse(admin);
  if (staff) return JSON.parse(staff);
  if (manager) return JSON.parse(manager);
  return null;
};

export const getAllOrdersAdmin = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/admin/list`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.put(`${API_URL}/admin/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getOrderDetails = async (id) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};
