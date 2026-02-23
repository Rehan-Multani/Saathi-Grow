import { create } from 'zustand';
import {
    getDeliveryProfile,
    requestOTP as requestOTPApi,
    verifyOTP as verifyOTPApi,
    updateDeliveryProfile as updateProfileApi
} from '../api/deliveryAuthApi';
import {
    updatePartnerStatus,
    updatePartnerLocation,
    getDeliveryOrders,
    getWalletTransactions,
    getDashboardStats,
    simulateOrder as simulateOrderApi
} from '../services/deliveryService';

const useDeliveryStore = create((set, get) => ({
    profile: JSON.parse(localStorage.getItem('sg_delivery_user')) || null,
    token: localStorage.getItem('sg_delivery_token') || null,
    stats: null,
    orders: [],
    history: [],
    wallet: null,
    transactions: [],
    loading: false,
    error: null,

    login: async (phone, otp) => {
        set({ loading: true, error: null });
        try {
            const data = await verifyOTPApi(phone, otp);
            localStorage.setItem('sg_delivery_token', data.token);
            localStorage.setItem('sg_delivery_user', JSON.stringify(data.partner));
            set({ profile: data.partner, token: data.token, loading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', loading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('sg_delivery_token');
        localStorage.removeItem('sg_delivery_user');
        set({ profile: null, token: null, orders: [], history: [], stats: null });
    },

    fetchProfile: async () => {
        const token = get().token;
        if (!token) return;
        set({ loading: true });
        try {
            const data = await getDeliveryProfile(token);
            set({ profile: data.partner, loading: false });
            localStorage.setItem('sg_delivery_user', JSON.stringify(data.partner));
        } catch (error) {
            if (error.response?.status === 401) get().logout();
            set({ error: error.message, loading: false });
        }
    },

    toggleStatus: async (token, currentStatus) => {
        const statusToSend = currentStatus === 'Online' ? 'offline' : 'online';
        try {
            const data = await updatePartnerStatus(token, statusToSend);
            // The backend returns the updated partner object
            set((state) => ({
                profile: data
            }));
            localStorage.setItem('sg_delivery_user', JSON.stringify(data));
        } catch (error) {
            set({ error: error.message });
        }
    },

    fetchOrders: async (token, type = 'active') => {
        set({ loading: true });
        try {
            const orders = await getDeliveryOrders(token, type);
            if (type === 'active') set({ orders, loading: false });
            else if (type === 'history') set({ history: orders, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchWallet: async (token) => {
        set({ loading: true });
        try {
            const data = await getWalletTransactions(token);
            set({ wallet: data.wallet, transactions: data.transactions, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    updateLocation: async (token, longitude, latitude) => {
        try {
            await updatePartnerLocation(token, longitude, latitude);
            set((state) => ({
                profile: {
                    ...state.profile,
                    currentLocation: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                }
            }));
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    },

    fetchStats: async (token) => {
        try {
            const stats = await getDashboardStats(token);
            set({ stats });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    triggerSimulation: async (token) => {
        try {
            await simulateOrderApi(token);
        } catch (error) {
            console.error('Failed to simulate order:', error);
        }
    }
}));

export default useDeliveryStore;
