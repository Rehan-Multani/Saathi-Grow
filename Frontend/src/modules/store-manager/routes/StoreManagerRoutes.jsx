import React, { lazy, Suspense } from 'react';
import { Spinner } from 'react-bootstrap';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import ManagerProfile from '../pages/ManagerProfile';
import ManagerSupportTickets from '../ManagerSupportTickets';
import LegalPolicies from '../pages/LegalPolicies';
import ManagerPOS from '../pages/ManagerPOS';

const DeliveryPartners = lazy(() => import('../ManagerDeliveryPartners'));
const AssignDeliveries = lazy(() => import('../ManagerAssignDeliveries'));
const DeliveryTracking = lazy(() => import('../ManagerDeliveryTracking'));
const AllCustomers = lazy(() => import('../ManagerCustomers'));

import ManagerForgotPassword from '../pages/auth/ManagerForgotPassword';
import ManagerResetPassword from '../pages/auth/ManagerResetPassword';

const ProtectedStoreManagerRoute = () => {
    const { managerUser } = useStoreManagerAuth();
    if (!managerUser) {
        return <Navigate to="/store-manager/login" replace />;
    }
    // Only 'Branch Manager' role can access the /store-manager portal
    if (managerUser.role !== 'Branch Manager') {
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
            <Suspense fallback={<div className="p-5 d-flex justify-content-center"><Spinner animation="border" variant="primary" /></div>}>
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
                            <Route path="reports" element={<ReportsAnalytics />} />
                            {/* New Functional Modules */}
                            <Route path="delivery/partners" element={<DeliveryPartners />} />
                            <Route path="delivery/assign" element={<AssignDeliveries />} />
                            <Route path="delivery/tracking" element={<DeliveryTracking />} />
                            <Route path="customers" element={<AllCustomers />} />
                            <Route path="profile" element={<ManagerProfile />} />
                            <Route path="support" element={<ManagerSupportTickets />} />
                            <Route path="policies" element={<LegalPolicies />} />
                        </Route>
                    </Route>
                    {/* Catch all for store manager - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </Suspense>
        </StoreManagerAuthProvider>
    );
};

export default StoreManagerRoutes;
