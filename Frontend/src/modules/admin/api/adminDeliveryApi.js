import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin/delivery`;
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
  const admin = localStorage.getItem('sathiGro_admin');
  const manager = localStorage.getItem('sathiGro_manager') || localStorage.getItem('saathigro_manager');
  const staff = localStorage.getItem('sathiGro_staff') || localStorage.getItem('saathigro_staff');
  const vendor = localStorage.getItem('sathiGro_vendor_token');
  
  if (admin) return JSON.parse(admin);
  if (staff) return JSON.parse(staff);
  if (manager) return JSON.parse(manager);
  if (vendor) {
      // Vendor token might be stored differently, but we need a similar object structure { token }
      return { token: vendor };
  }
  return null;
};

export const getDeliveryPartners = async (params = {}, options = {}) => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data, headers } = await axios.get(`${API_URL}${buildQuery(params)}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  if (options.paginated) {
    return {
      partners: data,
      pagination: {
        total: Number(headers['x-total-count'] || 0),
        page: Number(headers['x-page'] || params.page || 1),
        limit: Number(headers['x-limit'] || params.limit || 10),
        totalPages: Number(headers['x-total-pages'] || 1)
      }
    };
  }
  return data;
};

export const getDeliveryPartnerById = async (id) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const updateDeliveryPartner = async (id, partnerData) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.put(`${API_URL}/${id}`, partnerData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const addDeliveryPartner = async (partnerData) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(API_URL, partnerData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const updateDeliveryPartnerStatus = async (id, authStatus) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.put(`${API_URL}/${id}/status`, { authStatus }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const deleteDeliveryPartner = async (id) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

// Dispatch & Assignment APIs

export const getUnassignedOrders = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/unassigned-orders`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getAvailablePartners = async (orderIds = []) => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const params = orderIds.length > 0 ? `?orderIds=${orderIds.join(',')}` : '';
  const { data } = await axios.get(`${API_URL}/available${params}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const assignOrder = async (orderId, partnerId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/assign`, { orderId, partnerId }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const unassignOrder = async (orderId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/unassign`, { orderId }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const autoAssignOrder = async (orderId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/auto-assign/${orderId}`, {}, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getActiveTracking = async () => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/active-tracking`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

// --- Sprint 3: Delivery Run APIs ---

export const getOrdersBySlot = async (date = '', branchId = '') => {
  const auth = getAuthDetails();
  if (!auth) return null;

  const { data } = await axios.get(`${API_URL}/run/orders-by-slot`, {
    params: { date, branchId },
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const createDeliveryRun = async (payload) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/run/create`, payload, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const getAllDeliveryRuns = async (status = '', date = '') => {
  const auth = getAuthDetails();
  if (!auth) return [];

  const { data } = await axios.get(`${API_URL}/run`, {
    params: { status, date },
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const cancelDeliveryRun = async (runId) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.delete(`${API_URL}/run/${runId}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

// Cash Settlement APIs
export const getCashSettlementList = async (params = {}) => {
  const auth = getAuthDetails();
  if (!auth) return { partners: [], stats: { totalPendingCash: 0, activeCollectors: 0 } };

  const { data } = await axios.get(`${API_URL}/cash-settlement${buildQuery(params)}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const settleRiderCash = async (partnerId, pin) => {
  const auth = getAuthDetails();
  if (!auth) throw new Error('Not Authenticated');

  const { data } = await axios.post(`${API_URL}/settle-cash/${partnerId}`, { pin }, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};


