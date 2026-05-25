import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeliveryLayout from '../hooks/components/DeliveryLayout';
import { NotificationProvider } from '../hooks/components/NotificationProvider';

const Dashboard = lazy(() => import('../pages/DeliveryDashboard'));
const Orders = lazy(() => import('../pages/OrderManagement'));
const Wallet = lazy(() => import('../pages/WalletPage'));
const History = lazy(() => import('../pages/DeliveryHistory'));
const Profile = lazy(() => import('../pages/ProfileSettings'));
const Tracking = lazy(() => import('../pages/LiveTracking'));
const RunDetail = lazy(() => import('../pages/RunDetail'));
const Login = lazy(() => import('../pages/DeliveryLogin'));
const Signup = lazy(() => import('../pages/DeliverySignup'));
const Legal = lazy(() => import('../pages/LegalDocuments'));
import useDeliveryStore from '../store/deliveryStore';
import FirebaseNotificationHandler from '../../../common/components/FirebaseNotificationHandler';
import { isWebView } from '../../../utils/deviceUtils';
import NewOrderDeliveryPopup from '../components/NewOrderDeliveryPopup';

const Loading = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-lime-100 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
);

const DeliveryGuard = ({ children }) => {
    const { token } = useDeliveryStore();
    if (!token) return <Navigate to="/delivery/login" replace />;
    return children;
};

const DeliveryRoutes = () => {
    const { token } = useDeliveryStore();
    return (
        <div className="delivery-module-root min-h-screen">
            <FirebaseNotificationHandler token={token} role="delivery" isApp={isWebView()} showToast={true} />
            {token && <NewOrderDeliveryPopup />}
            <NotificationProvider>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/login" element={token ? <Navigate to="/delivery/dashboard" replace /> : <Login />} />
                        <Route path="/signup" element={token ? <Navigate to="/delivery/dashboard" replace /> : <Signup />} />

                        <Route path="/*" element={
                            <DeliveryGuard>
                                <DeliveryLayout>
                                    <Routes>
                                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/orders" element={<Orders />} />
                                        <Route path="/wallet" element={<Wallet />} />
                                        <Route path="/history" element={<History />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/run/:id" element={<RunDetail />} />
                                        <Route path="/tracking/:id" element={<Tracking />} />
                                        <Route path="/legal" element={<Legal />} />
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                    </Routes>
                                </DeliveryLayout>
                            </DeliveryGuard>
                        } />
                    </Routes>
                </Suspense>
            </NotificationProvider>
        </div>
    );
};

export default DeliveryRoutes;

