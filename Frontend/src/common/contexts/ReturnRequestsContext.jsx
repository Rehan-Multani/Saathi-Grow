import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { toast } from 'react-toastify';

const ReturnRequestsContext = createContext();

export const useReturnRequests = () => {
    const context = useContext(ReturnRequestsContext);
    if (!context) {
        throw new Error('useReturnRequests must be used within ReturnRequestsProvider');
    }
    return context;
};

export const ReturnRequestsProvider = ({ children }) => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get Auth Token from localStorage (generic helper)
    const getAuthToken = () => {
        try {
            const a = localStorage.getItem('sathiGro_admin') || localStorage.getItem('saathigro_admin') || localStorage.getItem('saathigro_vendor');
            return a ? JSON.parse(a).token : null;
        } catch { return null; }
    };

    const fetchReturns = useCallback(async (status = 'all') => {
        const token = getAuthToken();
        if (!token) return;
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/orders/admin/returns?status=${status}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReturnRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch Returns Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateReturnStatus = async (id, action, rejectionReason = null) => {
        const token = getAuthToken();
        if (!token) return;
        try {
            setLoading(true);
            await axios.put(`${API_BASE_URL}/orders/admin/${id}/return/accept`, { 
                action, 
                rejectionReason 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Return request ${action.toLowerCase()} successfully`);
            fetchReturns(); // Refresh list
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update return status');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        returnRequests,
        loading,
        fetchReturns,
        updateReturnStatus
    };

    return (
        <ReturnRequestsContext.Provider value={value}>
            {children}
        </ReturnRequestsContext.Provider>
    );
};
