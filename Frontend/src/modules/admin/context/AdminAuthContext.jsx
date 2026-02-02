import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(() => {
        const saved = localStorage.getItem('saathigro_admin');
        return saved ? JSON.parse(saved) : null;
    });

    // Mock login function
    const adminLogin = (email, password) => {
        return new Promise((resolve, reject) => {
            // Mock credentials check
            if (email === 'admin@sathigro.com' && password === 'admin123') {
                const mockAdmin = {
                    id: 'admin_1',
                    name: 'Super Admin',
                    email: email,
                    role: 'Super Admin'
                };
                setAdminUser(mockAdmin);
                localStorage.setItem('saathigro_admin', JSON.stringify(mockAdmin));
                resolve(mockAdmin);
            } else {
                reject(new Error('Invalid email or password'));
            }
        });
    };

    const adminLogout = () => {
        setAdminUser(null);
        localStorage.removeItem('saathigro_admin');
    };

    return (
        <AdminAuthContext.Provider value={{ adminUser, adminLogin, adminLogout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
