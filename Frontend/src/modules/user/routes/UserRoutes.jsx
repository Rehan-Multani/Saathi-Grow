import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HomePage from '../pages/home/HomePage';
import CategoryPage from '../pages/categories/CategoryPage';
import ProductDetailsPage from '../pages/product/ProductDetailsPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import AddressPage from '../pages/location/AddressPage';
import CartSidebar from '../components/cart/CartSidebar';

const UserLayout = () => {
    return (
        <>
            <Navbar />
            <CartSidebar />
            <div className="min-h-screen">
                <Outlet />
            </div>
            <Footer />
        </>
    );
};

const UserRoutes = () => {
    return (
        <Routes>
            {/* Routes with Navbar */}
            <Route element={<UserLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/address" element={<AddressPage />} />

                {/* Auth Pages matching UserLayout for standard feel */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Routes without Navbar (Standalone) - Only Checkout needs distraction-free */}
            <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
    );
};

export default UserRoutes;
