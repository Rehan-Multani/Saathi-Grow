import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

export const getDeliveryProfile = async (token) => {
    const { data } = await axios.get(`${API_URL}/delivery/profile`, getAuthHeaders(token));
    return data;
};

export const updatePartnerStatus = async (token, status) => {
    const { data } = await axios.patch(`${API_URL}/delivery/status`, { status }, getAuthHeaders(token));
    return data;
};

export const updatePartnerLocation = async (token, longitude, latitude) => {
    const { data } = await axios.post(`${API_URL}/delivery/location`, { longitude, latitude }, getAuthHeaders(token));
    return data;
};

export const getDeliveryOrders = async (token, type = 'active') => {
    const { data } = await axios.get(`${API_URL}/delivery/orders?type=${type}`, getAuthHeaders(token));
    return data;
};

export const getDeliveryDetail = async (token, id) => {
    const { data } = await axios.get(`${API_URL}/delivery/orders/${id}`, getAuthHeaders(token));
    return data;
};

export const updateDeliveryStatus = async (token, deliveryId, status) => {
    const { data } = await axios.patch(`${API_URL}/delivery/orders/${deliveryId}/status`, { status }, getAuthHeaders(token));
    return data;
};

export const getWalletTransactions = async (token) => {
    const { data } = await axios.get(`${API_URL}/delivery/wallet`, getAuthHeaders(token));
    return data;
};

export const getDashboardStats = async (token) => {
    const { data } = await axios.get(`${API_URL}/delivery/stats`, getAuthHeaders(token));
    return data;
};

export const simulateOrder = async (token) => {
    const { data } = await axios.post(`${API_URL}/delivery/simulate-order`, {}, getAuthHeaders(token));
    return data;
};
