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
        // Mock Login
        const mockUser = {
            id: 'u_123',
            name: 'Saathi User',
            phone: phoneNumber
        };
        setUser(mockUser);
        setShowLoginModal(false);
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
