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

    return (
        <StaffAuthContext.Provider value={{ staffUser, staffLogin, staffLogout }}>
            {children}
        </StaffAuthContext.Provider>
    );
};
