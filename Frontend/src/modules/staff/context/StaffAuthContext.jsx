import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin } from '../../../common/api/adminApi';

const StaffAuthContext = createContext();

export const useStaffAuth = () => useContext(StaffAuthContext);

export const StaffAuthProvider = ({ children }) => {
    const [staffUser, setStaffUser] = useState(() => {
        const saved = localStorage.getItem('saathigro_staff');
        return saved ? JSON.parse(saved) : null;
    });

    const staffLogout = useCallback(() => {
        setStaffUser(null);
        localStorage.removeItem('saathigro_staff');
    }, []);

    const refreshProfile = useCallback(async () => {
        if (!staffUser?.token) return;
        try {
            const { getProfile } = await import('../../../common/api/adminApi');
            const data = await getProfile(staffUser.token);
            const updatedUser = { ...data, token: staffUser.token };
            setStaffUser(updatedUser);
            localStorage.setItem('saathigro_staff', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to refresh staff profile:', error);
            if (error.response?.status === 401) {
                staffLogout();
            }
        }
    }, [staffUser?.token, staffLogout]);

    useEffect(() => {
        if (staffUser?.token) {
            refreshProfile();
        }
    }, [refreshProfile]);

    const staffLogin = useCallback(async (email, password) => {
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
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        if (!staffUser?.token) throw new Error('Not authenticated');
        const { updateProfile: updateApi } = await import('../../../common/api/adminApi');
        const data = await updateApi(staffUser.token, profileData);
        const updatedUser = { ...data, token: staffUser.token };
        setStaffUser(updatedUser);
        localStorage.setItem('saathigro_staff', JSON.stringify(updatedUser));
        return updatedUser;
    }, [staffUser?.token]);

    return (
        <StaffAuthContext.Provider value={{ staffUser, staffLogin, staffLogout, staffUpdateProfile: updateProfile }}>
            {children}
        </StaffAuthContext.Provider>
    );
};
