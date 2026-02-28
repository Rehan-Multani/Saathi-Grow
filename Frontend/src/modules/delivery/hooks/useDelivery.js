import { useEffect, useRef, useCallback } from 'react';
import useDeliveryStore from '../store/deliveryStore';

/**
 * Central hook for delivery partner data.
 * Uses a ref guard so API calls only fire ONCE per mount,
 * preventing the infinite-loop caused by Zustand state updates
 * triggering re-renders that re-fire the effect.
 */
const useDelivery = () => {
    const {
        token,
        profile,
        stats,
        orders,
        history,
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

    // Guard: only fetch once per mount, regardless of re-renders
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token || hasFetched.current) return;
        hasFetched.current = true;

        fetchProfile();
        fetchOrders(token, 'active');
        fetchWallet(token);
        fetchStats(token);
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const memoizedToggleStatus = useCallback((status) => toggleStatus(token, status), [token, toggleStatus]);
    const refreshOrders = useCallback((type) => fetchOrders(token, type), [token, fetchOrders]);
    const refreshStats = useCallback(() => fetchStats(token), [token, fetchStats]);
    const refreshAll = useCallback(async () => {
        if (!token) return;
        await Promise.all([
            fetchProfile(),
            fetchOrders(token, 'active'),
            fetchWallet(token),
            fetchStats(token)
        ]);
    }, [token, fetchProfile, fetchOrders, fetchWallet, fetchStats]);

    const memoizedUpdateLocation = useCallback((longitude, latitude) => updateLocation(token, longitude, latitude), [token, updateLocation]);
    const simulate = useCallback(() => triggerSimulation(token), [token, triggerSimulation]);

    return {
        profile,
        stats,
        orders,
        history,
        wallet,
        transactions,
        loading,
        error,
        toggleStatus: memoizedToggleStatus,
        refreshOrders,
        refreshStats,
        refreshAll,
        updateLocation: memoizedUpdateLocation,
        simulate
    };
};

export default useDelivery;
