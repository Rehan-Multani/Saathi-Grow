import { create } from 'zustand';
import {
    getDeliveryProfile,
    updatePartnerStatus,
    updatePartnerLocation,
    getDeliveryOrders,
    getWalletTransactions,
    getDashboardStats,
    simulateOrder as simulateOrderApi
} from '../services/deliveryService';

const useDeliveryStore = create((set, get) => ({
    profile: null,
    stats: null,
    orders: [],
    history: [],
    wallet: null,
    transactions: [],
    loading: false,
    error: null,

    fetchProfile: async (token) => {
        set({ loading: true });
        try {
            const profile = await getDeliveryProfile(token);
            set({ profile, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    toggleStatus: async (token, currentStatus) => {
        const newStatus = currentStatus === 'online' ? 'offline' : 'online';
        try {
            await updatePartnerStatus(token, newStatus);
            set((state) => ({
                profile: { ...state.profile, status: newStatus }
            }));
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
