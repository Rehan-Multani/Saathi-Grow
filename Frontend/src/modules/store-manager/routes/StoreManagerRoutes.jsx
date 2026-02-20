import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StoreManagerLayout from '../StoreManagerLayout';
import StoreManagerDashboard from '../StoreManagerDashboard';
import InventoryManagement from '../InventoryManagement';
import StockRequests from '../StockRequests';
import ReturnsApproval from '../ReturnsApproval';
import ReportsAnalytics from '../ReportsAnalytics';

const StoreManagerRoutes = () => {
    return (
        <Routes>
            <Route element={<StoreManagerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StoreManagerDashboard />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="stock-requests" element={<StockRequests />} />
                <Route path="returns" element={<ReturnsApproval />} />
                <Route path="reports" element={<ReportsAnalytics />} />
            </Route>
            {/* Catch all for store manager - redirect to dashboard */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
};

export default StoreManagerRoutes;
