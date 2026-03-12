import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet, useLocation, matchPath, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOccasionConfig } from '../data/occasions';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileRecommendations from '../components/layout/MobileRecommendations';
import CartSidebar from '../components/cart/CartSidebar';
import ScrollToTop from '../components/layout/ScrollToTop';
import LocationModal from '../components/location/LocationModal';
import FloatingCartStrip from '../components/cart/FloatingCartStrip';
import MobileFooter from '../components/layout/MobileFooter';
import SearchOverlay from '../components/search/SearchOverlay';
import { useTheme } from '../context/ThemeContext';
import { ShopProvider, useShop } from '../context/ShopContext';
import { useStore } from '../context/StoreContext';
import StoreSelector from '../components/location/StoreSelector';
import PullToRefresh from '../../../common/components/PullToRefresh';

// Standard Imports for Order Flow (to prevent lazy loading white screen issues)
import OrdersPage from '../pages/profile/OrdersPage';
import OrderDetailsPage from '../pages/profile/OrderDetailsPage';
import CancelOrderPage from '../pages/profile/CancelOrderPage';
import ReturnOrderPage from '../pages/profile/ReturnOrderPage';
import RaiseComplaintPage from '../pages/profile/RaiseComplaintPage';
import SupportChatPage from '../pages/profile/SupportChatPage';
import OrderTrackingPage from '../pages/profile/OrderTrackingPage';
const MyComplaintsPage = lazy(() => import('../pages/profile/MyComplaintsPage'));

// Lazy Load Other Pages (Non-critical or large pages)
const LoginModal = lazy(() => import('../components/auth/LoginModal'));
const HomePage = lazy(() => import('../pages/home/HomePage'));
const OccasionPage = lazy(() => import('../pages/home/OccasionPage'));
const LowestPricesPage = lazy(() => import('../pages/home/LowestPricesPage'));
const CampaignProductsPage = lazy(() => import('../pages/home/CampaignProductsPage'));
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
const SavedAddressesPage = lazy(() => import('../pages/profile/SavedAddressesPage'));
const AddressFormPage = lazy(() => import('../pages/profile/AddressFormPage'));
const WalletPage = lazy(() => import('../pages/profile/WalletPage'));
const AddMoneyPage = lazy(() => import('../pages/profile/AddMoneyPage'));
const WishlistPage = lazy(() => import('../pages/profile/WishlistPage'));
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'));
const OfferPage = lazy(() => import('../pages/offer/OfferPage'));
const LogoutConfirmationPage = lazy(() => import('../pages/auth/LogoutConfirmationPage'));
const LegalPage = lazy(() => import('../pages/support/LegalPage'));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--saathi-green)] rounded-full animate-spin"></div>
    </div>
);

const UserLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const authNoChromePaths = ['/logout-confirmation', '/login', '/register', '/order-success'];
    const hideDesktopChrome = authNoChromePaths.includes(location.pathname);
    const hideNavbarMobile = location.pathname === '/orders' || location.pathname === '/checkout' || hideDesktopChrome;

    // Determine Theme based on route (for Occasion Pages & Lowest Prices)
    const occasionMatch = matchPath("/occasion/:slug", location.pathname);
    const occasionSlug = occasionMatch?.params?.slug;
    const occasionConfig = occasionSlug ? getOccasionConfig(occasionSlug) : null;

    // Check for Lowest Prices Page
    const isLowestPricesPage = matchPath("/lowest-prices", location.pathname);

    let customTheme = null;
    if (!isDarkMode) {
        if (occasionConfig) {
            customTheme = { bgColor: occasionConfig.bgColor, themeColor: occasionConfig.themeColor };
        }
    }

    const { token, isWebView, loading, refreshProfile } = useAuth();
    const { refreshShopData } = useShop();
    const { isStoreSelectorOpen, setIsStoreSelectorOpen } = useStore();
    const isAuthPath = ['/login', '/register', '/logout-confirmation'].includes(location.pathname);

    const handleRefresh = async () => {
        try {
            // 1. Dispatch a custom event so the current child route can refresh its own data
            // This allows pages to only fetch what they specifically need ("sirf vahi")
            const refreshEvent = new CustomEvent('saathi_refresh');
            window.dispatchEvent(refreshEvent);

            // 2. Refresh global profile data (fast & essential)
            await refreshProfile();

            // 3. Wait for a bit so the animator stays visible/active for the user
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            console.error("Refresh failed:", error);
        }
    };

    // Initial Loading State
    if (loading) return <LoadingFallback />;

    // APK Mandatory Login Logic
    if (isWebView && !token && !isAuthPath) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="user-module-root flex flex-col min-h-screen">
            <ScrollToTop />
            <div className={`fixed top-0 left-0 right-0 z-[100] ${hideDesktopChrome ? 'hidden md:hidden' : ''} ${hideNavbarMobile && !hideDesktopChrome ? 'hidden md:block' : ''}`}>
                <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} customTheme={customTheme} />
            </div>
            {/* Spacer for fixed Navbar */}
            {!hideDesktopChrome && <div className={`h-[128px] md:h-20 ${hideNavbarMobile ? 'hidden md:block' : ''}`}></div>}
            <CartSidebar />
            <LocationModal />
            <StoreSelector isOpen={isStoreSelectorOpen} onClose={() => setIsStoreSelectorOpen(false)} />
            <FloatingCartStrip />
            <LoginModal />
            <SearchOverlay />

            <main className="flex-grow bg-white dark:!bg-black transition-colors duration-300 pb-20 md:pb-0">
                <PullToRefresh onRefresh={handleRefresh}>
                    <Suspense fallback={<LoadingFallback />}>
                        <Outlet />
                    </Suspense>
                </PullToRefresh>
            </main>

            {/* Desktop Footer */}
            {!hideDesktopChrome && (
                <div className="hidden md:block">
                    <Footer customTheme={customTheme} />
                </div>
            )}

            {/* Mobile Navigation */}
            {!hideDesktopChrome && <MobileFooter setIsMenuOpen={setIsMenuOpen} />}
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    const location = useLocation();

    if (loading) return <LoadingFallback />;

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

const UserRoutes = () => {
    return (
        <ShopProvider>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route element={<UserLayout />}>
                        {/* Home & Listing */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/occasion/:slug" element={<OccasionPage />} />
                        <Route path="/campaign/:campaignId" element={<CampaignProductsPage />} />
                        <Route path="/lowest-prices" element={<LowestPricesPage />} />
                        <Route path="/category" element={<CategoryPage />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />
                        <Route path="/product/:id" element={<ProductDetailsPage />} />

                        {/* Cart & Checkout */}
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />

                        {/* Address */}
                        <Route path="/address" element={<ProtectedRoute><AddressPage /></ProtectedRoute>} />
                        <Route path="/saved-addresses" element={<ProtectedRoute><SavedAddressesPage /></ProtectedRoute>} />
                        <Route path="/add-address" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
                        <Route path="/edit-address/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />

                        {/* Profile */}
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                        <Route path="/wallet/add-money" element={<ProtectedRoute><AddMoneyPage /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

                        {/* Orders */}
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/tracking" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/cancel" element={<ProtectedRoute><CancelOrderPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/return" element={<ProtectedRoute><ReturnOrderPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/complaint" element={<ProtectedRoute><RaiseComplaintPage /></ProtectedRoute>} />
                        <Route path="/support/raise-ticket" element={<ProtectedRoute><RaiseComplaintPage /></ProtectedRoute>} />
                        <Route path="/my-complaints" element={<ProtectedRoute><MyComplaintsPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/support-chat" element={<ProtectedRoute><SupportChatPage /></ProtectedRoute>} />

                        {/* Support */}
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/help" element={<HelpPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/legal/:slug" element={<LegalPage />} />

                        {/* Offers */}
                        <Route path="/offer/:id" element={<OfferPage />} />

                        {/* Auth */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/logout-confirmation" element={<LogoutConfirmationPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </ShopProvider>
    );
};

export default UserRoutes;
