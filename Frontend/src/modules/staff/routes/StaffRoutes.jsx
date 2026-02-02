import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { StaffAuthProvider, useStaffAuth } from '../context/StaffAuthContext';
import StaffLogin from '../pages/auth/StaffLogin';
import StaffLayout from '../StaffLayout';
import StaffDashboard from '../pages/Dashboard';
import StaffOrders from '../pages/orders/StaffOrders';
import StaffReturns from '../pages/orders/StaffReturns';
import StaffInventory from '../pages/inventory/StaffInventory';
import StaffTickets from '../pages/support/StaffTickets';

const PlaceholderPage = ({ title }) => (
    <div className="p-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="mb-3 bg-light rounded-circle p-4">
            <span style={{ fontSize: '3rem' }}>🚧</span>
        </div>
        <h2 className="fw-bold text-dark">{title}</h2>
        <p className="text-muted lead mb-4">This module is currently under active development.</p>
        <div className="d-flex gap-2">
            <Link to="/staff/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            <button className="btn btn-outline-secondary">Contact Admin</button>
        </div>
    </div>
);

const ProtectedStaffRoute = () => {
    const { staffUser } = useStaffAuth();
    if (!staffUser) {
        return <Navigate to="/staff/login" replace />;
    }
    return <Outlet />;
};

const StaffRoutes = () => {
    return (
        <StaffAuthProvider>
            <Routes>
                {/* Public Staff Routes */}
                <Route path="login" element={<StaffLogin />} />

                {/* Protected Staff Routes */}
                <Route element={<ProtectedStaffRoute />}>
                    <Route element={<StaffLayout />}>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<StaffDashboard />} />

                        {/* New Modules */}
                        <Route path="orders/active" element={<StaffOrders />} />
                        <Route path="orders/returns" element={<StaffReturns />} />
                        <Route path="inventory" element={<StaffInventory />} />
                        <Route path="support" element={<StaffTickets />} />

                        <Route path="*" element={<PlaceholderPage title="Page Not Found / Under Construction" />} />
                    </Route>
                </Route>
            </Routes>
        </StaffAuthProvider>
    );
};

export default StaffRoutes;
