import { create } from 'zustand';
import {
    getDeliveryProfile,
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
    profile: (() => {
        try {
            const saved = localStorage.getItem('sg_delivery_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Error parsing sg_delivery_user from localStorage:', e);
            return null;
        }
    })(),
    token: (() => {
        try {
            return localStorage.getItem('sg_delivery_token') || null;
        } catch (e) {
            console.error('Error getting sg_delivery_token from localStorage:', e);
            return null;
        }
    })(),
    stats: null,
    orders: [],
    history: [],
    wallet: null,
    transactions: [],
    walletPagination: { totalPages: 1, currentPage: 1, totalCount: 0 },
    historyPagination: { totalPages: 1, currentPage: 1, totalCount: 0 },
    loading: false,
    error: null,

    // ₹₹ Internal fetch-in-progress flags to prevent concurrent duplicate calls ₹₹
    _fetching: {
        profile: false,
        activeOrders: false,
        historyOrders: false,
        wallet: false,
        stats: false
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ AUTH ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
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
        set({
            profile: null, token: null,
            orders: [], history: [], stats: null, wallet: null, transactions: [],
            _fetching: { profile: false, activeOrders: false, historyOrders: false, wallet: false, stats: false }
        });
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ PROFILE ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    fetchProfile: async () => {
        const { token, _fetching } = get();
        if (!token || _fetching.profile) return;

        set((s) => ({ _fetching: { ...s._fetching, profile: true } }));
        try {
            const data = await getDeliveryProfile(token);
            localStorage.setItem('sg_delivery_user', JSON.stringify(data.partner));
            set((s) => ({ profile: data.partner, _fetching: { ...s._fetching, profile: false } }));
        } catch (error) {
            if (error.response?.status === 401) get().logout();
            set((s) => ({ error: error.message, _fetching: { ...s._fetching, profile: false } }));
        }
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ STATUS ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    toggleStatus: async (token, currentStatus) => {
        const statusToSend = currentStatus === 'Online' ? 'offline' : 'online';
        try {
            const data = await updatePartnerStatus(token, statusToSend);
            localStorage.setItem('sg_delivery_user', JSON.stringify(data));
            set({ profile: data });
        } catch (error) {
            set({ error: error.message });
        }
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ ORDERS ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    fetchOrders: async (token, type = 'active', params = {}) => {
        const { _fetching } = get();
        const fetchKey = type === 'active' ? 'activeOrders' : 'historyOrders';
        if (!token || _fetching[fetchKey]) return;

        set((s) => ({ _fetching: { ...s._fetching, [fetchKey]: true } }));
        try {
            const queryStr = Object.keys(params)
                .filter(k => params[k] !== '' && params[k] !== undefined && params[k] !== null)
                .map(k => `${k}=${params[k]}`)
                .join('&');
            const response = await getDeliveryOrders(token, type, queryStr ? `&${queryStr}` : '');
            
            if (type === 'active') {
                set((s) => ({ orders: response, _fetching: { ...s._fetching, activeOrders: false } }));
            } else if (type === 'history') {
                set((s) => ({ 
                    history: response.history, 
                    historyPagination: response.pagination || { totalPages: 1, currentPage: 1, totalCount: 0 },
                    _fetching: { ...s._fetching, historyOrders: false } 
                }));
            } else {
                set((s) => ({ _fetching: { ...s._fetching, [fetchKey]: false } }));
            }
        } catch (error) {
            set((s) => ({ error: error.message, _fetching: { ...s._fetching, [fetchKey]: false } }));
        }
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ WALLET ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    fetchWallet: async (token, page = 1, limit = 10) => {
        const { _fetching } = get();
        if (!token || _fetching.wallet) return;

        set((s) => ({ _fetching: { ...s._fetching, wallet: true } }));
        try {
            const data = await getWalletTransactions(token, page, limit);
            set((s) => ({
                wallet: { balance: data.cashInHand || 0 },
                transactions: data.history || [],
                walletPagination: data.pagination || { totalPages: 1, currentPage: 1, totalCount: 0 },
                _fetching: { ...s._fetching, wallet: false }
            }));
        } catch (error) {
            set((s) => ({ error: error.message, _fetching: { ...s._fetching, wallet: false } }));
        }
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ LOCATION ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    setLocalLocation: (longitude, latitude) => {
        set((state) => ({
            profile: {
                ...state.profile,
                currentLocation: { type: 'Point', coordinates: [longitude, latitude] }
            }
        }));
    },

    updateLocation: async (token, longitude, latitude, accuracy = null, heading = null) => {
        try {
            await updatePartnerLocation(token, longitude, latitude, accuracy, heading);
            get().setLocalLocation(longitude, latitude);
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ STATS ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    fetchStats: async (token) => {
        const { _fetching } = get();
        if (!token || _fetching.stats) return;

        set((s) => ({ _fetching: { ...s._fetching, stats: true } }));
        try {
            const stats = await getDashboardStats(token);
            set((s) => ({ stats, _fetching: { ...s._fetching, stats: false } }));
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            set((s) => ({ _fetching: { ...s._fetching, stats: false } }));
        }
    },

    // ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹ SIMULATE ₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹₹
    triggerSimulation: async (token) => {
        try {
            await simulateOrderApi(token);
        } catch (error) {
            console.error('Failed to simulate order:', error);
        }
    }
}));

export default useDeliveryStore;
