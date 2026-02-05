import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './modules/user/context/AuthContext';
import { CartProvider } from './modules/user/context/CartContext';
import { LocationProvider } from './modules/user/context/LocationContext';
import { SearchProvider } from './modules/user/context/SearchContext';
import { ThemeProvider } from './modules/user/context/ThemeContext';
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Load Module Routes
const UserRoutes = lazy(() => import('./modules/user/routes/UserRoutes'));
const VendorRoutes = lazy(() => import('./modules/vendor/routes/VendorRoutes'));
const StaffRoutes = lazy(() => import('./modules/staff/routes/StaffRoutes'));
const AdminRoutes = lazy(() => import('./modules/admin/routes/AdminRoutes'));



const GlobalLoading = () => (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white dark:bg-[#000000]">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-[3px] border-gray-100 dark:border-white/5 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-[3px] border-t-[var(--saathi-green)] rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-black text-[var(--saathi-green)] tracking-[0.3em] uppercase ml-1">SaathiGro</span>
                <div className="w-12 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--saathi-green)] w-1/2 animate-shimmer"></div>
                </div>
            </div>
        </div>
    </div>
);



function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LocationProvider>
                    <SearchProvider>
                        <CartProvider>
                            <BrowserRouter>
                                <Suspense fallback={<GlobalLoading />}>
                                    <Routes>
                                        <Route path="/staff/*" element={<StaffRoutes />} />
                                        <Route path="/admin/*" element={<AdminRoutes />} />
                                        <Route path="/vendor/*" element={<VendorRoutes />} />
                                        <Route path="/*" element={<UserRoutes />} />
                                    </Routes>


                                    <ToastContainer
                                        position="bottom-center"
                                        autoClose={2000}
                                        hideProgressBar={false}
                                        newestOnTop={false}
                                        closeOnClick
                                        rtl={false}
                                        pauseOnFocusLoss
                                        draggable
                                        pauseOnHover
                                        theme="colored"
                                    />
                                </Suspense>
                            </BrowserRouter>
                        </CartProvider>
                    </SearchProvider>
                </LocationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
