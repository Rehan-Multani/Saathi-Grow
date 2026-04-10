import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin, getProfile, updateProfile as updateAdminApi } from '../api/adminApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(() => {
        const saved = localStorage.getItem('sathiGro_admin');
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed;
    });
    const [loading, setLoading] = useState(false);

    const adminLogout = useCallback(() => {
        setAdminUser(null);
        localStorage.removeItem('sathiGro_admin');
    }, []);

    const refreshAdminProfile = useCallback(async () => {
        const saved = localStorage.getItem('sathiGro_admin');
        const user = saved ? JSON.parse(saved) : null;

        if (!user?.token) return;

        try {
            const data = await getProfile(user.token);
            const updatedUser = { ...data, token: user.token };
            setAdminUser(updatedUser);
            localStorage.setItem('sathiGro_admin', JSON.stringify(updatedUser));
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
            const allowedRoles = ['Admin', 'Branch Manager', 'Staff'];
            if (!allowedRoles.includes(data.role)) {
                throw new Error('Access denied. You do not have an administrative role.');
            }
            setAdminUser(data);
            localStorage.setItem('sathiGro_admin', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const adminUpdateProfile = useCallback(async (profileData) => {
        const saved = localStorage.getItem('sathiGro_admin');
        const user = saved ? JSON.parse(saved) : null;

        if (!user?.token) throw new Error('Not authenticated');

        setLoading(true);
        try {
            const data = await updateAdminApi(user.token, profileData);
            const updatedUser = { ...data, token: user.token };
            setAdminUser(updatedUser);
            localStorage.setItem('sathiGro_admin', JSON.stringify(updatedUser));
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
            loading
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
