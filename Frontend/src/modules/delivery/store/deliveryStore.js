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
    profile: JSON.parse(localStorage.getItem('sg_delivery_user')) || null,
    token: localStorage.getItem('sg_delivery_token') || null,
    stats: null,
    orders: [],
    history: [],
    wallet: null,
    transactions: [],
    loading: false,
    error: null,

    // ── Internal fetch-in-progress flags to prevent concurrent duplicate calls ──
    _fetching: {
        profile: false,
        orders: false,
        wallet: false,
        stats: false
    },

    // ─────────────────────────── AUTH ───────────────────────────
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
            _fetching: { profile: false, orders: false, wallet: false, stats: false }
        });
    },

    // ─────────────────────────── PROFILE ───────────────────────────
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

    // ─────────────────────────── STATUS ───────────────────────────
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

    // ─────────────────────────── ORDERS ───────────────────────────
    fetchOrders: async (token, type = 'active') => {
        const { _fetching } = get();
        if (!token || _fetching.orders) return;

        set((s) => ({ _fetching: { ...s._fetching, orders: true } }));
        try {
            const orders = await getDeliveryOrders(token, type);
            if (type === 'active') set((s) => ({ orders, _fetching: { ...s._fetching, orders: false } }));
            else if (type === 'history') set((s) => ({ history: orders, _fetching: { ...s._fetching, orders: false } }));
            else set((s) => ({ _fetching: { ...s._fetching, orders: false } }));
        } catch (error) {
            set((s) => ({ error: error.message, _fetching: { ...s._fetching, orders: false } }));
        }
    },

    // ─────────────────────────── WALLET ───────────────────────────
    fetchWallet: async (token) => {
        const { _fetching } = get();
        if (!token || _fetching.wallet) return;

        set((s) => ({ _fetching: { ...s._fetching, wallet: true } }));
        try {
            const data = await getWalletTransactions(token);
            set((s) => ({ wallet: data.wallet, transactions: data.transactions, _fetching: { ...s._fetching, wallet: false } }));
        } catch (error) {
            set((s) => ({ error: error.message, _fetching: { ...s._fetching, wallet: false } }));
        }
    },

    // ─────────────────────────── LOCATION ───────────────────────────
    updateLocation: async (token, longitude, latitude) => {
        try {
            await updatePartnerLocation(token, longitude, latitude);
            set((state) => ({
                profile: {
                    ...state.profile,
                    currentLocation: { type: 'Point', coordinates: [longitude, latitude] }
                }
            }));
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    },

    // ─────────────────────────── STATS ───────────────────────────
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

    // ─────────────────────────── SIMULATE ───────────────────────────
    triggerSimulation: async (token) => {
        try {
            await simulateOrderApi(token);
        } catch (error) {
            console.error('Failed to simulate order:', error);
        }
    }
}));

export default useDeliveryStore;
