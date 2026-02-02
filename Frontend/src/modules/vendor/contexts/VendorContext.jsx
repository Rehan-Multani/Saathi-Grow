import React, { createContext, useContext, useState } from 'react';

const VendorContext = createContext();

export const useVendor = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
    const [vendor, setVendor] = useState({
        name: "Fresh Mart Store",
        owner: "Rahul Kumar",
        email: "rahul@saathi.com",
        phone: "+91 9876543210",
        address: "Sector 14, Gurgaon",
        isOpen: true,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80"
    });

    const [stats, setStats] = useState({
        totalProducts: 45,
        totalOrders: 128,
        pendingOrders: 12,
        earnings: 15400
    });

    const [products, setProducts] = useState([
        { id: 1, name: 'Fresho Tomato', category: 'Vegetables', price: 40, stock: 100, image: 'https://www.bigbasket.com/media/uploads/p/l/10000200_17-fresho-tomato-hybrid.jpg' },
        { id: 2, name: 'Amul Taaza Milk', category: 'Dairy', price: 54, stock: 50, image: 'https://www.bigbasket.com/media/uploads/p/l/306926_4-amul-taaza-fresh-toned-milk.jpg' },
        { id: 3, name: 'Lays Chips', category: 'Munchies', price: 20, stock: 200, image: 'https://www.bigbasket.com/media/uploads/p/l/40196813_4-lays-potato-chips-indias-magic-masala.jpg' },
    ]);

    const [orders, setOrders] = useState([
        { id: 'ORD-001', customer: 'Amit Sharma', items: 3, total: 154, status: 'Pending', time: '10 mins ago', date: '2024-02-20' },
        { id: 'ORD-002', customer: 'Sneha Gupta', items: 1, total: 40, status: 'Packing', time: '25 mins ago', date: '2024-02-20' },
        { id: 'ORD-003', customer: 'Rajiv Verma', items: 5, total: 450, status: 'Dispatched', time: '1 hour ago', date: '2024-02-20' },
    ]);

    const login = (email, password) => {
        // Mock login
        console.log("Logged in", email);
        return true;
    };

    const register = (data) => {
        console.log("Registered", data);
        return true;
    };

    const addProduct = (product) => {
        setProducts([...products, { ...product, id: Date.now() }]);
    };

    const deleteProduct = (productId) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    const updateProduct = (updatedProduct) => {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const toggleShopStatus = () => {
        setVendor({ ...vendor, isOpen: !vendor.isOpen });
    };

    const updateVendorProfile = (updatedData) => {
        setVendor(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <VendorContext.Provider value={{
            vendor,
            stats,
            products,
            orders,
            login,
            register,
            addProduct,
            deleteProduct,
            updateProduct,
            updateOrderStatus,
            toggleShopStatus,
            updateVendorProfile
        }}>
            {children}
        </VendorContext.Provider>
    );
};
