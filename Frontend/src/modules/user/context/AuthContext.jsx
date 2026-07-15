import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as authApi from '../api/userAuthApi';
import { toast } from 'react-toastify';
import { isWebView as checkWebView } from '../../../utils/deviceUtils';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/apiConfig';
import { captureReferralFromUrl, clearStoredReferralCode } from '../utils/referralUtils';

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
    const [loading, setLoading] = useState(true); // Initial loading true to check auth
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginView, setLoginView] = useState('login'); // 'login' or 'register'
    const [isWebView] = useState(checkWebView());

    // Persist ?ref= from invite links until registration
    useEffect(() => {
        captureReferralFromUrl();
    }, []);

    // Handle Persistence
    useEffect(() => {
        if (token) {
            localStorage.setItem('saathigro_user', JSON.stringify(user));
            localStorage.setItem('saathigro_token', token);
        } else {
            localStorage.removeItem('saathigro_user');
            localStorage.removeItem('saathigro_token');
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

    const login = useCallback(async (credentials) => {
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
    }, []);

    const register = useCallback(async (credentials) => {
        setLoading(true);
        try {
            const data = await authApi.verifyOTP(credentials);
            setUser(data.user);
            setToken(data.token);
            setShowLoginModal(false);
            clearStoredReferralCode();
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const isFetchingProfile = useRef(false);

    const refreshProfile = useCallback(async () => {
        if (!token) return null;
        // Prevent concurrent duplicate calls
        if (isFetchingProfile.current) return null;
        isFetchingProfile.current = true;
        try {
            const data = await authApi.getProfile(token);
            
            // SECURITY: If user is deactivated, force logout immediately
            if (data.user && data.user.isActive === false) {
                toast.error('Your account has been deactivated by admin.', { toastId: 'account-deactivated' });
                logout();
                return null;
            }
            
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error('Profile refresh failed:', error);
            if (error.statusCode === 403 || error.message.includes('deactivated') || error.message.includes('Access Denied')) {
                toast.error('Account Access Denied', { toastId: 'access-denied' });
                logout();
            } else if (error.message.includes('expired') || error.message.includes('authorized')) {
                logout();
            }
            return null;
        } finally {
            isFetchingProfile.current = false;
        }
    }, [token]); // Only changes when token changes

    const updateUser = useCallback(async (formData) => {
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
    }, [token]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('saathigro_cart'); // clear stale cart data on logout
        toast.info('Logged out');
    }, []);

    const openLogin = useCallback(() => {
        setLoginView('login');
        setShowLoginModal(true);
    }, []);

    const openRegister = useCallback(() => {
        setLoginView('register');
        setShowLoginModal(true);
    }, []);

    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

    /**
     * Helper to protect actions. 
     * If logged in, executes the action.
     * If not logged in, opens login modal (on web) or redirects (on APK).
     */
    const protectAction = useCallback((action) => {
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
    }, [token, isWebView, openLogin]);

    const contextValue = useMemo(() => ({
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
    }), [
        user, token, loading, login, register, updateUser, logout,
        showLoginModal, openLogin, openRegister, closeLoginModal,
        loginView, refreshProfile, isWebView, protectAction
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

