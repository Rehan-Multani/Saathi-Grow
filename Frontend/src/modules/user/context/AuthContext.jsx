import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // User State: null means not logged in
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('saathigro_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginView, setLoginView] = useState('login'); // 'login' or 'register'

    useEffect(() => {
        if (user) {
            localStorage.setItem('saathigro_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('saathigro_user');
        }
    }, [user]);

    const login = (phoneNumber) => {
        // Read registered users
        const registeredUsers = JSON.parse(localStorage.getItem('saathigro_registered_users') || '[]');
        const userExists = registeredUsers.find(u => u.phone === phoneNumber);

        // Mock Login
        const mockUser = userExists || {
            id: 'u_' + Date.now(),
            name: 'Saathi User',
            phone: phoneNumber
        };

        setUser(mockUser);
        setShowLoginModal(false);
        return true;
    };

    const register = (userData) => {
        // Save to registered users list
        const registeredUsers = JSON.parse(localStorage.getItem('saathigro_registered_users') || '[]');

        // Avoid duplicate phone numbers
        if (registeredUsers.some(u => u.phone === userData.phone)) {
            return { success: false, message: 'Phone number already registered' };
        }

        const newUser = {
            id: 'u_' + Date.now(),
            ...userData
        };

        registeredUsers.push(newUser);
        localStorage.setItem('saathigro_registered_users', JSON.stringify(registeredUsers));

        // Auto login after register
        setUser(newUser);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
    };

    const openLogin = () => {
        setLoginView('login');
        setShowLoginModal(true);
    };

    const openRegister = () => {
        setLoginView('register');
        setShowLoginModal(true);
    };

    const closeLoginModal = () => setShowLoginModal(false);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                showLoginModal,
                openLogin,
                openRegister,
                closeLoginModal,
                loginView,
                setLoginView
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
