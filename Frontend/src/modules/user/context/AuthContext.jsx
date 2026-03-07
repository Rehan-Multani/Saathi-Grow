import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as authApi from '../api/userAuthApi';
import { toast } from 'react-toastify';
import { isWebView as checkWebView } from '../../../utils/deviceUtils';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/apiConfig';

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
        const savedUser = localStorage.getItem('sathiGro_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(localStorage.getItem('sathiGro_token') || null);
    const [loading, setLoading] = useState(true); // Initial loading true to check auth
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginView, setLoginView] = useState('login'); // 'login' or 'register'
    const [isWebView] = useState(checkWebView());

    // Handle Persistence
    useEffect(() => {
        if (token) {
            localStorage.setItem('sathiGro_user', JSON.stringify(user));
            localStorage.setItem('sathiGro_token', token);
        } else {
            localStorage.removeItem('sathiGro_user');
            localStorage.removeItem('sathiGro_token');
        }
    }, [user, token]);

    // Initial Auth Verification on Mount
    useEffect(() => {
        const verifyAuth = async () => {
            if (token) {
                await refreshProfile();
            }
            setLoading(false);
        };
        verifyAuth();
    }, []); // Only on mount

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
        localStorage.removeItem('sathiGro_cart'); // clear stale cart data on logout
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

    /**
     * Helper to protect actions. 
     * If logged in, executes the action.
     * If not logged in, opens login modal (on web) or redirects (on APK).
     */
    const protectAction = (action) => {
        if (token) {
            action();
        } else {
            if (isWebView) {
                // For APK, we usually redirect to login page, but we can also use modal if preferred.
                // Redirecting to /login is safer for strict APK flow.
                window.location.href = '/login';
            } else {
                toast.info('Please login to continue');
                openLogin();
            }
        }
    };

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
                refreshProfile,
                isWebView,
                setLoading,
                protectAction
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

