import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeliveryLayout from '../components/DeliveryLayout';
import { NotificationProvider } from '../components/NotificationProvider';

const Dashboard = lazy(() => import('../pages/DeliveryDashboard'));
const Orders = lazy(() => import('../pages/OrderManagement'));
const Wallet = lazy(() => import('../pages/WalletPage'));
const History = lazy(() => import('../pages/DeliveryHistory'));
const Profile = lazy(() => import('../pages/ProfileSettings'));
const Tracking = lazy(() => import('../pages/LiveTracking'));

const Loading = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
);

const DeliveryRoutes = () => {
    return (
        <NotificationProvider>
            <DeliveryLayout>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/tracking/:id" element={<Tracking />} />
                        {/* Add a generic tracking page if ID is not needed for now */}
                        <Route path="/tracking" element={<Tracking />} />
                    </Routes>
                </Suspense>
            </DeliveryLayout>
        </NotificationProvider>
    );
};

export default DeliveryRoutes;
