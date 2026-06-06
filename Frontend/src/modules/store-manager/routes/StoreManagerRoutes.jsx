import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import StoreManagerLayout from '../StoreManagerLayout';
import StoreManagerDashboard from '../StoreManagerDashboard';
import InventoryManagement from '../InventoryManagement';
import ReturnsApproval from '../ReturnsApproval';
import ReportsAnalytics from '../ReportsAnalytics';
import ManagerOrders from '../ManagerOrders';
import StaffManagement from '../StaffManagement';
import { StoreManagerAuthProvider, useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import StoreManagerLogin from '../pages/auth/StoreManagerLogin';
import ManagerProducts from '../pages/ManagerProducts';
import AddProduct from '../pages/AddProduct';
import ManagerProfile from '../pages/ManagerProfile';
import ManagerSupportTickets from '../ManagerSupportTickets';
import ManagerNotifications from '../pages/ManagerNotifications';
import LegalPolicies from '../pages/LegalPolicies';
import ManagerPOS from '../pages/ManagerPOS';

const DeliveryPartners = lazy(() => import('../ManagerDeliveryPartners'));
const AssignDeliveries = lazy(() => import('../ManagerAssignDeliveries'));
const DeliveryTracking = lazy(() => import('../ManagerDeliveryTracking'));
const AllCustomers = lazy(() => import('../ManagerCustomers'));

import ManagerForgotPassword from '../pages/auth/ManagerForgotPassword';
import ManagerResetPassword from '../pages/auth/ManagerResetPassword';
import ManagerVyaparReport from '../pages/reports/ManagerVyaparReport';

const ProtectedStoreManagerRoute = () => {
    const { managerUser } = useStoreManagerAuth();
    if (!managerUser) {
        return <Navigate to="/store-manager/login" replace />;
    }
    // Allow Branch Manager and any staff role that has been authenticated via this portal
    const allowedRoles = ['Staff', 'Admin', 'Store Manager'];
    if (!allowedRoles.includes(managerUser.role)) {
        return <Navigate to="/store-manager/login" replace />;
    }
    return <Outlet />;
};

const ManagerPOSWrapper = () => {
    return <ManagerPOS />;
};

const StoreManagerRoutes = () => {
    return (
        <StoreManagerAuthProvider>
            <Suspense fallback={<div className="p-10 flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
                <Routes>
                    {/* Public Store Manager Routes */}
                    <Route path="login" element={<StoreManagerLogin />} />
                    <Route path="forgot-password" element={<ManagerForgotPassword />} />
                    <Route path="reset-password/:token" element={<ManagerResetPassword />} />

                    {/* Protected Store Manager Routes */}
                    <Route element={<ProtectedStoreManagerRoute />}>
                        <Route element={<StoreManagerLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<StoreManagerDashboard />} />
                            <Route path="pos-billing" element={<ManagerPOSWrapper />} />
                            <Route path="inventory" element={<InventoryManagement />} />
                            <Route path="orders" element={<ManagerOrders />} />
                            <Route path="staff" element={<StaffManagement />} />
                            <Route path="returns" element={<ReturnsApproval />} />
                            <Route path="products" element={<ManagerProducts />} />
                            <Route path="products/add" element={<AddProduct />} />
                            <Route path="reports" element={<ReportsAnalytics />} />
                            <Route path="reports/vyapar" element={<ManagerVyaparReport />} />
                            {/* New Functional Modules */}
                            <Route path="delivery/partners" element={<DeliveryPartners />} />
                            <Route path="delivery/assign" element={<AssignDeliveries />} />
                            <Route path="delivery/tracking" element={<DeliveryTracking />} />
                            <Route path="customers" element={<AllCustomers />} />
                            <Route path="profile" element={<ManagerProfile />} />
                            <Route path="support" element={<ManagerSupportTickets />} />
                            <Route path="policies" element={<LegalPolicies />} />
                            <Route path="notifications" element={<ManagerNotifications />} />
                            <Route path="settings" element={<ManagerProfile />} />
                            {/* Catch-all inside protected routes */}
                            <Route path="*" element={<Navigate to="/store-manager/dashboard" replace />} />
                        </Route>
                    </Route>
                    {/* Catch all outside protected - redirect to login */}
                    <Route path="*" element={<Navigate to="/store-manager/login" replace />} />
                </Routes>
            </Suspense>
        </StoreManagerAuthProvider>
    );
};

export default StoreManagerRoutes;
