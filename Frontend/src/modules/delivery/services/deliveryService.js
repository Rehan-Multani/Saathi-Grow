import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = API_BASE_URL;

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

export const updateDeliveryStatus = async (token, deliveryId, status, stopOrderId = null, stopStatus = null, otp = null) => {
    const { data } = await axios.patch(`${API_URL}/delivery/orders/${deliveryId}/status`, { status, stopOrderId, stopStatus, otp }, getAuthHeaders(token));
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

export const getRouteDirections = async (token, origin, destination) => {
    const { data } = await axios.get(`${API_URL}/delivery/route?origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}`, getAuthHeaders(token));
    return data;
};
