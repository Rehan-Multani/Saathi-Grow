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
// import StoreSelector from '../components/location/StoreSelector';

import PullToRefresh from '../../../common/components/PullToRefresh';
import FirebaseNotificationHandler from '../../../common/components/FirebaseNotificationHandler';
import { useState } from 'react';
import OfferTicker from '../components/layout/OfferTicker';
import { motion, AnimatePresence } from 'framer-motion';

// Standard Imports for Order Flow (to prevent lazy loading white screen issues)
import OrdersPage from '../pages/profile/OrdersPage';
import OrderDetailsPage from '../pages/profile/OrderDetailsPage';
import TaggedOrdersPage from '../pages/profile/TaggedOrdersPage';
import CancelOrderPage from '../pages/profile/CancelOrderPage';
import ReturnOrderPage from '../pages/profile/ReturnOrderPage';
import RaiseComplaintPage from '../pages/profile/RaiseComplaintPage';
import SupportChatPage from '../pages/profile/SupportChatPage';
import OrderTrackingPage from '../pages/profile/OrderTrackingPage';
import ReorderPage from '../pages/profile/ReorderPage';
const MyComplaintsPage = lazy(() => import('../pages/profile/MyComplaintsPage'));

// Lazy Load Other Pages (Non-critical or large pages)
const LoginModal = lazy(() => import('../components/auth/LoginModal'));
const HomePage = lazy(() => import('../pages/home/HomePage'));
const OccasionPage = lazy(() => import('../pages/home/OccasionPage'));
const LowestPricesPage = lazy(() => import('../pages/home/LowestPricesPage'));
const CampaignProductsPage = lazy(() => import('../pages/home/CampaignProductsPage'));
const CategoryProductsPage = lazy(() => import('../pages/categories/CategoryPage'));
const CategoryLandingPage = lazy(() => import('../pages/categories/CategoryLandingPage'));
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
const ShopListingPage = lazy(() => import('../pages/shop/ShopListingPage'));

const LoadingFallback = () => (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-10">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-spin duration-[1.2s]">
                    <g transform="rotate(-90 50 50)">
                        <circle cx="50" cy="50" r="44" stroke="#1a1c24" strokeWidth="4.5" fill="transparent" />
                        <circle
                            cx="50" cy="50" r="44" stroke="#CCFF00" strokeWidth="4.5" fill="transparent"
                            strokeDasharray="276.46" strokeDashoffset={276.46 * 0.72} 
                        />
                    </g>
                </svg>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[18px] font-black tracking-[0.45em] text-[#CCFF00] uppercase">SAATHIGRO</span>
                <div className="w-24 h-[4.5px] bg-[#f2f4f7] mt-5 rounded-full overflow-hidden relative">
                    <motion.div 
                        className="absolute inset-0 bg-[#CCFF00]"
                        animate={{ x: [-96, 96] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    </div>
);

const UserLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const { isBottomSheetOpen } = useShop();
    const authNoChromePaths = ['/logout-confirmation', '/login', '/register', '/order-success'];
    const hideDesktopChrome = authNoChromePaths.includes(location.pathname);
    
    // Hide navbar on mobile for focused browsing/management pages
    const focusedPaths = [
        '/orders', 
        '/checkout', 
        '/profile', 
        '/wallet', 
        '/wishlist', 
        '/my-complaints', 
        '/settings', 
        '/help', 
        '/notifications', 
        '/saved-addresses', 
        '/add-address',
        '/support/raise-ticket',
        '/product',
        '/lowest-prices',
        '/occasion',
        '/campaign',
        '/brand',
        '/store'
    ];
    
    const isFocusedPath = focusedPaths.some(path => location.pathname.startsWith(path)) || 
                          location.pathname.startsWith('/legal/') ||
                          location.pathname.startsWith('/edit-address/') ||
                          (location.pathname.startsWith('/category/') && location.pathname !== '/category'); // Only hide on individual category pages, not the main list

    const hideNavbarMobile = isFocusedPath || hideDesktopChrome;

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
    // const { isStoreSelectorOpen, setIsStoreSelectorOpen } = useStore();

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

    // Theme Management: Apply .dark class ONLY when in user module
    React.useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        if (isDarkMode) {
            root.classList.add('dark');
            body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
        }

        // Cleanup: remove dark class when leaving user module or unmounting
        return () => {
            root.classList.remove('dark');
            body.classList.remove('dark');
        };
    }, [isDarkMode]);

    // Initial Loading State
    if (loading) return <LoadingFallback />;

    // APK Mandatory Login Logic
    if (isWebView && !token && !isAuthPath) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="user-module-root flex flex-col min-h-screen">
            <FirebaseNotificationHandler token={token} role="user" isApp={isWebView} />
            <ScrollToTop />

            <div className={`fixed top-0 left-0 right-0 z-[100] ${hideDesktopChrome ? 'hidden md:hidden' : ''} ${hideNavbarMobile && !hideDesktopChrome ? 'hidden md:block' : ''}`}>
                <OfferTicker />
                <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} customTheme={customTheme} />
            </div>
            {/* Spacer for fixed Navbar + Ticker */}
            {!hideDesktopChrome && (
                <div className={`h-[165px] md:h-28 flex-shrink-0 w-full ${hideNavbarMobile ? 'hidden md:block' : 'block'}`}></div>
            )}
            <CartSidebar />
            <LocationModal />
            <FloatingCartStrip />
            <LoginModal />
            <SearchOverlay />

            <main className={`flex-grow bg-white dark:!bg-black transition-colors duration-300 ${hideDesktopChrome ? '' : 'pb-20 md:pb-0'}`}>
                {hideDesktopChrome ? (
                     <Suspense fallback={<LoadingFallback />}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="w-full h-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </Suspense>
                ) : (
                    <PullToRefresh onRefresh={handleRefresh}>
                        <Suspense fallback={<LoadingFallback />}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="w-full h-full"
                                >
                                    <Outlet />
                                </motion.div>
                            </AnimatePresence>
                        </Suspense>
                    </PullToRefresh>
                )}
            </main>

            {/* Desktop Footer */}
            {!hideDesktopChrome && (
                <div className="hidden md:block">
                    <Footer customTheme={customTheme} />
                </div>
            )}

            {/* Mobile Navigation */}
            <MobileFooter setIsMenuOpen={setIsMenuOpen} isBottomSheetOpen={isBottomSheetOpen} />
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
                        <Route path="/category" element={<CategoryProductsPage />} />
                        <Route path="/category/:slug" element={<CategoryLandingPage />} />
                        <Route path="/category/:slug/products" element={<CategoryProductsPage />} />
                        <Route path="/brand/:brandName" element={<ShopListingPage type="brand" />} />
                        <Route path="/store/:storeId/:storeType" element={<ShopListingPage type="store" />} />
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
                        <Route path="/orders/tagged/:tag" element={<ProtectedRoute><TaggedOrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/reorder" element={<ProtectedRoute><ReorderPage /></ProtectedRoute>} />
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
