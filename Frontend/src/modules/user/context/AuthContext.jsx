import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as authApi from '../api/userAuthApi';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('saathigro_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(localStorage.getItem('saathigro_token') || null);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginView, setLoginView] = useState('login'); // 'login' or 'register'

    useEffect(() => {
        if (user && token) {
            localStorage.setItem('saathigro_user', JSON.stringify(user));
            localStorage.setItem('saathigro_token', token);
        } else {
            localStorage.removeItem('saathigro_user');
            localStorage.removeItem('saathigro_token');
        }
    }, [user, token]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const data = await authApi.verifyOTP(credentials);
            setUser(data.user);
            setToken(data.token);
            setShowLoginModal(false);
            toast.success('LoggedIn successfully!');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (credentials) => {
        setLoading(true);
        try {
            const data = await authApi.verifyOTP(credentials);
            setUser(data.user);
            setToken(data.token);
            setShowLoginModal(false);
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const isFetchingProfile = useRef(false);

    const refreshProfile = useCallback(async () => {
        if (!token) return;
        // Prevent concurrent duplicate calls
        if (isFetchingProfile.current) return;
        isFetchingProfile.current = true;
        try {
            const data = await authApi.getProfile(token);
            setUser(data.user);
        } catch (error) {
            console.error('Profile refresh failed:', error);
            if (error.message.includes('expired') || error.message.includes('authorized')) {
                logout();
            }
        } finally {
            isFetchingProfile.current = false;
        }
    }, [token]); // Only changes when token changes

    const updateUser = async (formData) => {
        setLoading(true);
        try {
            const data = await authApi.updateProfile(token, formData);
            setUser(data.user);
            toast.success('Profile updated');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        toast.info('Logged out');
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
                token,
                loading,
                login,
                register,
                updateUser,
                logout,
                showLoginModal,
                openLogin,
                openRegister,
                closeLoginModal,
                loginView,
                setLoginView,
                refreshProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
