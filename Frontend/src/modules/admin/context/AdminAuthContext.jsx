import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';
import { loginAdmin, getProfile, updateProfile as updateAdminApi } from '../api/adminApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(() => {
        const saved = localStorage.getItem('saathigro_admin');
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed;
    });
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async (token) => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success || res.status === 200) {
                setUnreadCount(res.data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    const refreshUnreadCount = useCallback(() => {
        if (adminUser?.token) {
            fetchUnreadCount(adminUser.token);
        }
    }, [adminUser?.token, fetchUnreadCount]);

    useEffect(() => {
        if (!adminUser?.token) return;

        refreshUnreadCount();
        const interval = setInterval(refreshUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [adminUser?.token, refreshUnreadCount]);

    const adminLogout = useCallback(() => {
        setAdminUser(null);
        localStorage.removeItem('saathigro_admin');
    }, []);

    const refreshAdminProfile = useCallback(async () => {
        const saved = localStorage.getItem('saathigro_admin');
        const user = saved ? JSON.parse(saved) : null;

        if (!user?.token) return;

        try {
            const data = await getProfile(user.token);
            const updatedUser = { ...data, token: user.token };

            // Only update if data has actually changed to prevent redundant re-renders
            if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                setAdminUser(updatedUser);
                localStorage.setItem('saathigro_admin', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to refresh admin profile:', error);
            if (error.message.includes('authorized') || error.message.includes('expired')) {
                adminLogout();
            }
        }
    }, [adminLogout]);

    useEffect(() => {
        refreshAdminProfile();
    }, [refreshAdminProfile]);

    const adminLogin = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const data = await loginAdmin(email, password);
            const allowedRoles = ['Admin', 'Store Manager', 'Staff'];
            if (!allowedRoles.includes(data.role)) {
                throw new Error('Access denied. You do not have an administrative role.');
            }
            setAdminUser(data);
            localStorage.setItem('saathigro_admin', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const adminUpdateProfile = useCallback(async (profileData) => {
        const saved = localStorage.getItem('saathigro_admin');
        const user = saved ? JSON.parse(saved) : null;

        if (!user?.token) throw new Error('Not authenticated');

        setLoading(true);
        try {
            const data = await updateAdminApi(user.token, profileData);
            const updatedUser = { ...data, token: user.token };
            setAdminUser(updatedUser);
            localStorage.setItem('saathigro_admin', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AdminAuthContext.Provider value={{
            adminUser,
            adminLogin,
            adminLogout,
            adminUpdateProfile,
            refreshAdminProfile,
            unreadCount,
            refreshUnreadCount,
            loading
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
