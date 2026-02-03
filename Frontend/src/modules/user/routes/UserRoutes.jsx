import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartSidebar from '../components/cart/CartSidebar';
import ScrollToTop from '../components/layout/ScrollToTop';

// Lazy Load Pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const CategoryPage = lazy(() => import('../pages/categories/CategoryPage'));
const ProductDetailsPage = lazy(() => import('../pages/product/ProductDetailsPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const AddressPage = lazy(() => import('../pages/location/AddressPage'));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--saathi-green)] rounded-full animate-spin"></div>
    </div>
);

const UserLayout = () => {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <CartSidebar />
            <div className="min-h-screen bg-white dark:!bg-black transition-colors duration-300">
                <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                </Suspense>
            </div>
            <Footer />
        </>
    );
};

const UserRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
    );
};

export default UserRoutes;
