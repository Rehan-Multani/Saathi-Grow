import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../../admin/api/adminApi';

const StaffAuthContext = createContext();

export const useStaffAuth = () => useContext(StaffAuthContext);

export const StaffAuthProvider = ({ children }) => {
    const [staffUser, setStaffUser] = useState(() => {
        const saved = localStorage.getItem('saathigro_staff');
        return saved ? JSON.parse(saved) : null;
    });

    // Mock login function
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


    // Correct implementation based on AdminAuthContext pattern:
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

