import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/orders`;
const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

// Helper to get token based on portal
const getAuthDetails = () => {
  const path = window.location.pathname;

  if (path.startsWith('/admin')) {
    const admin = localStorage.getItem('sathiGro_admin');
    if (admin) return JSON.parse(admin);
  } else if (path.startsWith('/staff')) {
    const staff = localStorage.getItem('saathigro_staff') || localStorage.getItem('sathiGro_staff');
    if (staff) return JSON.parse(staff);
  } else if (path.startsWith('/store-manager')) {
    const manager = localStorage.getItem('sathiGro_manager') || localStorage.getItem('saathigro_manager');
    if (manager) return JSON.parse(manager);
  }

  // Fallback
  const admin = localStorage.getItem('sathiGro_admin');
  const staff = localStorage.getItem('saathigro_staff') || localStorage.getItem('sathiGro_staff');
  const manager = localStorage.getItem('sathiGro_manager') || localStorage.getItem('saathigro_manager');

  if (admin) return JSON.parse(admin);
  if (staff) return JSON.parse(staff);
  if (manager) return JSON.parse(manager);
  return null;
};

export const getAllOrdersAdmin = async (params = {}) => {
  const auth = getAuthDetails();
  if (!auth) return { orders: [], pagination: {} };

  const { data } = await axios.get(`${API_URL}/admin/list`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    params
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

export const deleteOrder = async (id) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.delete(`${API_URL}/admin/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getReturnRequests = async (params = {}, options = {}) => {
  const auth = getAuthDetails();
  if (!auth) {
    return options.paginated
      ? { returns: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }, stats: { total: 0, pending: 0, approved: 0, rejected: 0 } }
      : [];
  }

  const requestParams = options.paginated
    ? { ...params, includeStats: true }
    : params;
  const { data, headers } = await axios.get(`${API_URL}/admin/returns${buildQuery(requestParams)}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });

  if (options.paginated) {
    if (Array.isArray(data)) {
      return {
        returns: data,
        pagination: {
          total: Number(headers['x-total-count'] || 0),
          page: Number(headers['x-page'] || params.page || 1),
          limit: Number(headers['x-limit'] || params.limit || 10),
          totalPages: Number(headers['x-total-pages'] || 1)
        },
        stats: { total: Number(headers['x-total-count'] || 0), pending: 0, approved: 0, rejected: 0 }
      };
    }
    return {
      returns: data.returns || [],
      pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      stats: data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
    };
  }

  return Array.isArray(data) ? data : (data.returns || []);
};

export const handleReturnRequest = async (id, action, rejectionReason = null) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.put(`${API_URL}/admin/${id}/return`, { action, rejectionReason }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const scheduleReturnPickup = async (id, pickupFee = 30) => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.post(`${API_URL}/admin/${id}/return/schedule-pickup`, { pickupFee }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};
