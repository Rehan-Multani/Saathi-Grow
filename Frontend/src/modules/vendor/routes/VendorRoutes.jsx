import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import VendorHeader from '../components/VendorHeader';
import { VendorProvider } from '../contexts/VendorContext';

// Pages
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/Products/ProductList';
import AddProduct from '../pages/Products/AddProduct';
import EditProduct from '../pages/Products/EditProduct';
import DeleteProductPage from '../pages/Products/DeleteProductPage';
import Orders from '../pages/Orders';
import Earnings from '../pages/Earnings';
import ShopProfile from '../pages/ShopProfile';
import VendorRegister from '../pages/VendorRegister';
import VendorLogin from '../pages/VendorLogin';
import Analysis from '../pages/Analysis';
import Notifications from '../pages/Notifications';
import StockManagement from '../pages/StockManagement';

const VendorLayout = () => (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <VendorSidebar />
        <VendorHeader />
        <main className="md:ml-64 p-4 md:p-6 pb-24">
            <Outlet />
        </main>
    </div>
);

const VendorRoutes = () => {
    return (
        <VendorProvider>
            <Routes>
                {/* Default Route: Login */}
                <Route path="/" element={<VendorLogin />} />
                <Route path="login" element={<VendorLogin />} />
                <Route path="register" element={<VendorRegister />} />

                {/* Protected Routes */}
                <Route element={<VendorLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="analysis" element={<Analysis />} />
                    <Route path="stock" element={<StockManagement />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="products" element={<ProductList />}>
                        <Route path="edit/:productId" element={<EditProduct />} />
                        <Route path="delete/:productId" element={<DeleteProductPage />} />
                    </Route>
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="earnings" element={<Earnings />} />
                    <Route path="profile" element={<ShopProfile />} />

                    {/* Default Redirect */}
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                </Route>
            </Routes>
        </VendorProvider>
    );
};

export default VendorRoutes;
