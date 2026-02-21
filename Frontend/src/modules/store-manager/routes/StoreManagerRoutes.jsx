import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import StoreManagerLayout from '../StoreManagerLayout';
import StoreManagerDashboard from '../StoreManagerDashboard';
import InventoryManagement from '../InventoryManagement';
import StockRequests from '../StockRequests';
import ReturnsApproval from '../ReturnsApproval';
import ReportsAnalytics from '../ReportsAnalytics';
import ManagerOrders from '../ManagerOrders';
import StaffManagement from '../StaffManagement';
import { StoreManagerAuthProvider, useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import StoreManagerLogin from '../pages/auth/StoreManagerLogin';

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

const StoreManagerRoutes = () => {
    return (
        <StoreManagerAuthProvider>
            <Routes>
                {/* Public Store Manager Routes */}
                <Route path="login" element={<StoreManagerLogin />} />

                {/* Protected Store Manager Routes */}
                <Route element={<ProtectedStoreManagerRoute />}>
                    <Route element={<StoreManagerLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<StoreManagerDashboard />} />
                        <Route path="inventory" element={<InventoryManagement />} />
                        <Route path="orders" element={<ManagerOrders />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="stock-requests" element={<StockRequests />} />
                        <Route path="returns" element={<ReturnsApproval />} />
                        <Route path="reports" element={<ReportsAnalytics />} />
                    </Route>
                </Route>
                {/* Catch all for store manager - redirect to dashboard */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </StoreManagerAuthProvider>
    );
};

export default StoreManagerRoutes;
