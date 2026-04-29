import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

export const createPromoCode = async (token, promoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/promocodes`, promoData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getPromoCodes = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/promocodes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updatePromoCode = async (token, id, promoData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/promocodes/${id}`, promoData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deletePromoCode = async (token, id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/promocodes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const validatePromoCode = async (token, code, subTotal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/promocodes/validate`, { code, subTotal }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getApplicablePromos = async (token, subTotal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/promocodes/applicable`, { subTotal }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
export const getUpsellingPromos = async (token, subTotal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/promocodes/upselling`, { subTotal }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
