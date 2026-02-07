import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileRecommendations from '../components/layout/MobileRecommendations';
import CartSidebar from '../components/cart/CartSidebar';
import ScrollToTop from '../components/layout/ScrollToTop';
import LocationModal from '../components/location/LocationModal';
import FloatingCartStrip from '../components/cart/FloatingCartStrip';
import MobileFooter from '../components/layout/MobileFooter';
import SearchOverlay from '../components/search/SearchOverlay';

// Standard Imports for Order Flow (to prevent lazy loading white screen issues)
import OrdersPage from '../pages/profile/OrdersPage';
import OrderDetailsPage from '../pages/profile/OrderDetailsPage';
import CancelOrderPage from '../pages/profile/CancelOrderPage';
import ReturnOrderPage from '../pages/profile/ReturnOrderPage';
import RaiseComplaintPage from '../pages/profile/RaiseComplaintPage';
import SupportChatPage from '../pages/profile/SupportChatPage';

// Lazy Load Other Pages (Non-critical or large pages)
const LoginModal = lazy(() => import('../components/auth/LoginModal'));
const HomePage = lazy(() => import('../pages/home/HomePage'));
const CategoryPage = lazy(() => import('../pages/categories/CategoryPage'));
const ProductDetailsPage = lazy(() => import('../pages/product/ProductDetailsPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const AddressPage = lazy(() => import('../pages/location/AddressPage'));
const NotificationsPage = lazy(() => import('../pages/support/NotificationsPage'));
const HelpPage = lazy(() => import('../pages/support/HelpPage'));
const SettingsPage = lazy(() => import('../pages/support/SettingsPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SecurityPage = lazy(() => import('../pages/support/SecurityPage'));
const SavedAddressesPage = lazy(() => import('../pages/profile/SavedAddressesPage'));
const AddressFormPage = lazy(() => import('../pages/profile/AddressFormPage'));
const WalletPage = lazy(() => import('../pages/profile/WalletPage'));
const AddMoneyPage = lazy(() => import('../pages/profile/AddMoneyPage'));
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'));
const OfferPage = lazy(() => import('../pages/offer/OfferPage'));
const LogoutConfirmationPage = lazy(() => import('../pages/auth/LogoutConfirmationPage'));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--saathi-green)] rounded-full animate-spin"></div>
    </div>
);

const UserLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const authNoChromePaths = ['/logout-confirmation', '/login', '/register', '/order-success'];
    const hideDesktopChrome = authNoChromePaths.includes(location.pathname);

    return (
        <div className="user-module-root flex flex-col min-h-screen">
            <ScrollToTop />
            <div className={hideDesktopChrome ? 'hidden md:hidden' : ''}>
                <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            </div>
            <CartSidebar />
            <LocationModal />
            <FloatingCartStrip />
            <LoginModal />
            <SearchOverlay />

            <main className="flex-grow bg-white dark:!bg-black transition-colors duration-300 pb-20 md:pb-0">
                <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                </Suspense>
            </main>

            {/* Desktop Footer */}
            {!hideDesktopChrome && (
                <div className="hidden md:block">
                    <Footer />
                </div>
            )}

            {/* Mobile Navigation */}
            {!hideDesktopChrome && <MobileFooter setIsMenuOpen={setIsMenuOpen} />}
        </div>
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
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/security" element={<SecurityPage />} />
                    <Route path="/saved-addresses" element={<SavedAddressesPage />} />
                    <Route path="/add-address" element={<AddressFormPage />} />
                    <Route path="/edit-address/:id" element={<AddressFormPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailsPage />} />
                    <Route path="/orders/:id/cancel" element={<CancelOrderPage />} />
                    <Route path="/orders/:id/return" element={<ReturnOrderPage />} />
                    <Route path="/orders/:id/complaint" element={<RaiseComplaintPage />} />
                    <Route path="/orders/:id/support-chat" element={<SupportChatPage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/wallet/add-money" element={<AddMoneyPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/offer/:id" element={<OfferPage />} />

                    {/* Auth Pages matching UserLayout for standard feel */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/logout-confirmation" element={<LogoutConfirmationPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default UserRoutes;
