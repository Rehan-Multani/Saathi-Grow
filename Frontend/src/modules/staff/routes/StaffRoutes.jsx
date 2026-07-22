import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { StaffAuthProvider, useStaffAuth } from '../context/StaffAuthContext';
import StaffLogin from '../pages/auth/StaffLogin';
import StaffForgotPassword from '../pages/auth/StaffForgotPassword';
import StaffResetPassword from '../pages/auth/StaffResetPassword';
import StaffLayout from '../StaffLayout';
import StaffDashboard from '../pages/Dashboard';
import StaffOrders from '../pages/orders/StaffOrders';
import StaffReturns from '../pages/orders/StaffReturns';
import StaffInventory from '../pages/inventory/StaffInventory';
import StaffTickets from '../pages/support/StaffTickets';
import StaffCustomers from '../pages/customers/StaffCustomers';
import StaffManagement from '../pages/StaffManagement';
import StaffProducts from '../pages/products/StaffProducts';
import StaffProfile from '../pages/StaffProfile';
import LegalSupport from '../pages/LegalSupport';
import StaffPOS from '../pages/StaffPOS';
import Notifications from '../pages/Notifications';
import StaffReports from '../pages/reports/StaffReports';
import StaffVyaparReport from '../pages/reports/StaffVyaparReport';
import { hasStaffPermission } from '../utils/staffPermissions';

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
    // Only 'Staff' role can access the /staff portal
    if (staffUser.role !== 'Staff') {
        return <Navigate to="/staff/login" replace />;
    }
    return <Outlet />;
};

const ProtectedStaffModuleRoute = ({ permission, children }) => {
    const { staffUser } = useStaffAuth();
    const permissions = Array.isArray(staffUser?.permissions) ? staffUser.permissions : [];
    if (!hasStaffPermission(permissions, permission)) {
        return <Navigate to="/staff/dashboard" replace />;
    }
    return children;
};

const StaffRoutes = () => {
    return (
        <StaffAuthProvider>
            <Routes>
                {/* Public Staff Routes */}
                <Route path="login" element={<StaffLogin />} />
                <Route path="forgot-password" element={<StaffForgotPassword />} />
                <Route path="reset-password/:token" element={<StaffResetPassword />} />

                {/* Protected Staff Routes */}
                <Route element={<ProtectedStaffRoute />}>
                    <Route element={<StaffLayout />}>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<StaffDashboard />} />
                        <Route path="pos-billing" element={
                            <ProtectedStaffModuleRoute permission="MANAGE_POS_BILLING">
                                <StaffPOS />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="orders/active" element={
                            <ProtectedStaffModuleRoute permission="VIEW_ORDERS">
                                <StaffOrders />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="orders/returns" element={
                            <ProtectedStaffModuleRoute permission="MANAGE_REFUNDS_RETURNS">
                                <StaffReturns />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="inventory" element={
                            <ProtectedStaffModuleRoute permission="MANAGE_INVENTORY">
                                <StaffInventory />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="products" element={
                            <ProtectedStaffModuleRoute permission="MANAGE_PRODUCTS">
                                <StaffProducts />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="customers" element={
                            <ProtectedStaffModuleRoute permission="VIEW_CUSTOMERS">
                                <StaffCustomers />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="reports" element={
                            <ProtectedStaffModuleRoute permission="VIEW_REPORTS">
                                <StaffReports />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="reports/vyapar" element={
                            <ProtectedStaffModuleRoute permission="VIEW_REPORTS">
                                <StaffVyaparReport />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="staff" element={
                            <ProtectedStaffModuleRoute permission="MANAGE_STAFF">
                                <StaffManagement />
                            </ProtectedStaffModuleRoute>
                        } />
                        <Route path="support" element={<StaffTickets />} />
                        <Route path="profile" element={<StaffProfile />} />
                        <Route path="legal" element={<LegalSupport />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="*" element={<PlaceholderPage title="Page Not Found / Under Construction" />} />
                    </Route>
                </Route>
            </Routes>
        </StaffAuthProvider>
    );
};

export default StaffRoutes;
