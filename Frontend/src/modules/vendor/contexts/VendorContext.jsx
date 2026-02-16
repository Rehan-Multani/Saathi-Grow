import React, { createContext, useContext, useState, useEffect } from 'react';
import * as vendorAuthApi from '../api/vendorAuthApi';
import * as vendorProductApi from '../api/vendorProductApi';
import { toast } from 'react-toastify';

const VendorContext = createContext();

export const useVendor = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
    const [vendor, setVendor] = useState(JSON.parse(localStorage.getItem('vendorUser')));
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        earnings: 0
    });

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // Fetch profile and products on initial load if token exists
    useEffect(() => {
        if (vendor?.token) {
            refreshProfile();
            fetchProducts();
        }
    }, []);

    const refreshProfile = async () => {
        try {
            const data = await vendorAuthApi.getVendorProfile(vendor.token);
            const updatedUser = { ...vendor, ...data };
            setVendor(updatedUser);
            localStorage.setItem('vendorUser', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            if (error.message.includes('expired') || error.message.includes('authorized')) {
                logout();
            }
        }
    };

    const fetchProducts = async () => {
        if (!vendor?.token) return;
        try {
            const data = await vendorProductApi.getVendorProducts(vendor.token);
            setProducts(data);
            setStats(prev => ({ ...prev, totalProducts: data.length }));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await vendorAuthApi.vendorLogin(email, password);
            setVendor(data);
            localStorage.setItem('vendorUser', JSON.stringify(data));
            toast.success('Welcome back!');
            // Fetch products after login
            const prods = await vendorProductApi.getVendorProducts(data.token);
            setProducts(prods);
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        setLoading(true);
        try {
            await vendorAuthApi.vendorRegister(data);
            toast.success('Registration successful! Please wait for admin approval.');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setVendor(null);
        setProducts([]);
        localStorage.removeItem('vendorUser');
        toast.info('Logged out successfully');
    };

    const updateVendorProfile = async (updatedData) => {
        setLoading(true);
        try {
            const data = await vendorAuthApi.updateVendorProfile(vendor.token, updatedData);
            const updatedUser = { ...vendor, ...data };
            setVendor(updatedUser);
            localStorage.setItem('vendorUser', JSON.stringify(updatedUser));
            toast.success('Profile updated successfully');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await updateVendorProfile({ password: newPassword });
    };

    const addProduct = async (productData) => {
        setLoading(true);
        try {
            await vendorProductApi.addVendorProduct(vendor.token, productData);
            await fetchProducts();
            toast.success('Product added successfully');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await vendorProductApi.deleteVendorProduct(vendor.token, productId);
            await fetchProducts();
            toast.success('Product deleted');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const updateProduct = async (productId, updatedData) => {
        setLoading(true);
        try {
            await vendorProductApi.updateVendorProduct(vendor.token, productId, updatedData);
            await fetchProducts();
            toast.success('Product updated');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const toggleShopStatus = () => {
        setVendor(prev => ({ ...prev, isOpen: !prev.isOpen }));
    };

    return (
        <VendorContext.Provider value={{
            vendor,
            stats,
            products,
            orders,
            loading,
            login,
            register,
            logout,
            addProduct,
            deleteProduct,
            updateProduct,
            updateOrderStatus,
            toggleShopStatus,
            updateVendorProfile,
            changePassword,
            refreshProfile,
            fetchProducts
        }}>
            {children}
        </VendorContext.Provider>
    );
};
