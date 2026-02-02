import { createContext, useContext, useState, useEffect } from 'react';

const StaffAuthContext = createContext();

export const useStaffAuth = () => useContext(StaffAuthContext);

export const StaffAuthProvider = ({ children }) => {
    const [staffUser, setStaffUser] = useState(() => {
        const saved = localStorage.getItem('saathigro_staff');
        return saved ? JSON.parse(saved) : null;
    });

    // Mock login function
    const staffLogin = (email, password) => {
        return new Promise((resolve, reject) => {
            // Mock credentials check for Staff
            if (email === 'staff@sathigro.com' && password === 'staff123') {
                const mockStaff = {
                    id: 'staff_1',
                    name: 'John Staff',
                    email: email,
                    role: 'Store Associate'
                };
                setStaffUser(mockStaff);
                localStorage.setItem('saathigro_staff', JSON.stringify(mockStaff));
                resolve(mockStaff);
            } else {
                reject(new Error('Invalid email or password'));
            }
        });
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
