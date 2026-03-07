import React, { createContext, useContext, useState, useEffect } from 'react';
import * as vendorAuthApi from '../api/vendorAuthApi';
import * as vendorProductApi from '../api/vendorProductApi';
import * as vendorOrderApi from '../api/vendorOrderApi';
import * as vendorWalletApi from '../api/vendorWalletApi';
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
    const [walletData, setWalletData] = useState({
        balance: 0,
        totalEarnings: 0,
        transactions: []
    });
    const [earningsStats, setEarningsStats] = useState({
        totalSales: 0,
        totalReturns: 0,
        orderCount: 0,
        returnCount: 0
    });

    // Fetch profile and products on initial load if token exists
    useEffect(() => {
        if (vendor?.token) {
            refreshProfile();
            fetchProducts();
            fetchOrders();
            fetchWalletData();
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

    const fetchOrders = async (params = {}) => {
        if (!vendor?.token) return;
        try {
            const data = await vendorOrderApi.getVendorOrders(vendor.token, params);
            setOrders(data);

            // Update stats
            const pending = data.filter(o => o.status === 'confirmed' || o.status === 'pending').length;
            const earnings = data.reduce((sum, o) => o.status === 'delivered' ? sum + (o.vendorPayoutAmount || o.totalAmount) : sum, 0);

            setStats(prev => ({
                ...prev,
                totalOrders: data.length,
                pendingOrders: pending,
                earnings
            }));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    const fetchWalletData = async () => {
        if (!vendor?.token) return;
        try {
            const wallet = await vendorWalletApi.getVendorWallet(vendor.token);
            const stats = await vendorWalletApi.getVendorWalletStats(vendor.token);
            setWalletData(wallet);
            setEarningsStats(stats);

            // Sync overall stats if needed
            setStats(prev => ({
                ...prev,
                earnings: wallet.totalEarnings
            }));
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
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

    const updateProductStock = async (productId, stockData) => {
        setLoading(true);
        try {
            await vendorProductApi.updateVendorProductStock(vendor.token, productId, stockData);
            await fetchProducts();
            toast.success('Stock updated');
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Map frontend statuses to backend statuses if needed
            const statusMap = {
                'Packing': 'preparing',
                'Ready for Pickup': 'ready_for_pickup',
                'Cancelled': 'cancelled'
            };
            const backendStatus = statusMap[newStatus] || newStatus.toLowerCase();

            await vendorOrderApi.updateVendorOrderStatus(vendor.token, orderId, backendStatus);
            toast.success(`Order ${newStatus}`);
            await fetchOrders();
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
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
            setLoading,
            login,
            register,
            logout,
            addProduct,
            deleteProduct,
            updateProduct,
            updateProductStock,
            updateOrderStatus,
            toggleShopStatus,
            updateVendorProfile,
            changePassword,
            refreshProfile,
            fetchProducts,
            fetchOrders,
            walletData,
            earningsStats,
            fetchWalletData
        }}>
            {children}
        </VendorContext.Provider>
    );
};
