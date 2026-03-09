import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../../admin/api/adminApi';

const StaffAuthContext = createContext();

export const useStaffAuth = () => useContext(StaffAuthContext);

export const StaffAuthProvider = ({ children }) => {
    const [staffUser, setStaffUser] = useState(() => {
        const saved = localStorage.getItem('saathigro_staff');
        return saved ? JSON.parse(saved) : null;
    });

    // Auto-refresh profile on mount to sync permissions/status
    useEffect(() => {
        if (staffUser?.token) {
            refreshProfile();
        }
    }, []);

    const refreshProfile = async () => {
        try {
            const { getProfile } = await import('../../admin/api/adminApi');
            const data = await getProfile(staffUser.token);
            // Sync user data keeping token
            const updatedUser = { ...data, token: staffUser.token };
            setStaffUser(updatedUser);
            localStorage.setItem('saathigro_staff', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to refresh staff profile:', error);
            if (error.response?.status === 401) {
                staffLogout();
            }
        }
    };

    const staffLogin = async (email, password) => {
        try {
            const data = await loginAdmin(email, password);
            if (data.role !== 'Staff') {
                throw new Error('Access denied. This portal is only for Staff.');
            }
            setStaffUser(data);
            localStorage.setItem('saathigro_staff', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const staffLogout = () => {
        setStaffUser(null);
        localStorage.removeItem('saathigro_staff');
    };

    const updateProfile = async (profileData) => {
        if (!staffUser?.token) throw new Error('Not authenticated');
        const { updateProfile: updateApi } = await import('../../admin/api/adminApi');
        const data = await updateApi(staffUser.token, profileData);
        const updatedUser = { ...data, token: staffUser.token };
        setStaffUser(updatedUser);
        localStorage.setItem('saathigro_staff', JSON.stringify(updatedUser));
        return updatedUser;
    };

    return (
        <StaffAuthContext.Provider value={{ staffUser, staffLogin, staffLogout, staffUpdateProfile: updateProfile }}>
            {children}
        </StaffAuthContext.Provider>
    );
};

