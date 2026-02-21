import { useEffect } from 'react';
import useDeliveryStore from '../store/deliveryStore';

const useDelivery = (token) => {
    const {
        profile,
        stats,
        orders,
        wallet,
        transactions,
        loading,
        error,
        fetchProfile,
        fetchOrders,
        fetchWallet,
        fetchStats,
        updateLocation,
        toggleStatus,
        triggerSimulation
    } = useDeliveryStore();

    useEffect(() => {
        if (token) {
            fetchProfile(token);
            fetchOrders(token, 'active');
            fetchWallet(token);
            fetchStats(token);
        }
    }, [token, fetchProfile, fetchOrders, fetchWallet, fetchStats]);

    return {
        profile,
        stats,
        orders,
        wallet,
        transactions,
        loading,
        error,
        toggleStatus: (status) => toggleStatus(token, status),
        refreshOrders: (type) => fetchOrders(token, type),
        refreshStats: () => fetchStats(token),
        refreshAll: async () => {
            if (!token) return;
            await Promise.all([
                fetchProfile(token),
                fetchOrders(token, 'active'),
                fetchWallet(token),
                fetchStats(token)
            ]);
        },
        updateLocation: (longitude, latitude) => updateLocation(token, longitude, latitude),
        simulate: () => triggerSimulation(token)
    };
};

export default useDelivery;
