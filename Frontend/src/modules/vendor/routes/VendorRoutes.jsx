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
import BulkUpload from '../pages/Products/BulkUpload';
import TaxPricing from '../pages/Products/TaxPricing';
import ProductAttributes from '../pages/Products/ProductAttributes';
import AllOrders from '../pages/Orders/AllOrders';
import OrderDetail from '../pages/Orders/OrderDetail';
import OrderTracking from '../pages/Orders/OrderTracking';
import Earnings from '../pages/Earnings';
import ShopProfile from '../pages/ShopProfile';
import VendorRegister from '../pages/VendorRegister';
import VendorLogin from '../pages/VendorLogin';
import Analysis from '../pages/Analysis';
import Notifications from '../pages/Notifications';
import StockManagement from '../pages/StockManagement';
import InventoryReports from '../pages/InventoryReports';
import SupportTickets from '../pages/SupportTickets';
import Customers from '../pages/Customers';
import ShippingManagement from '../pages/ShippingManagement';
import Promotions from '../pages/Promotions';
import WalletHistory from '../pages/WalletHistory';
import ProductReviews from '../pages/ProductReviews';
import ReturnRequests from '../pages/ReturnRequests';

import { useLocation } from 'react-router-dom';

const VendorLayout = () => {
    const location = useLocation();
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <VendorSidebar />
            <VendorHeader />
            <main
                key={location.pathname}
                className="md:ml-64 p-4 md:p-6 pb-24 animate-page-entry"
            >
                <Outlet />
            </main>
        </div>
    );
};

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
                    <Route path="products" element={<ProductList />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/edit/:productId" element={<EditProduct />} />
                    <Route path="products/delete/:productId" element={<DeleteProductPage />} />
                    <Route path="products/bulk" element={<BulkUpload />} />
                    <Route path="products/tax-pricing" element={<TaxPricing />} />
                    <Route path="products/attributes" element={<ProductAttributes />} />
                    <Route path="orders" element={<AllOrders />} />
                    <Route path="orders/:orderId" element={<OrderDetail />} />
                    <Route path="orders/tracking" element={<OrderTracking />} />
                    <Route path="inventory-reports" element={<InventoryReports />} />
                    <Route path="support-tickets" element={<SupportTickets />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="shipping" element={<ShippingManagement />} />
                    <Route path="promotions" element={<Promotions />} />
                    <Route path="wallet-history" element={<WalletHistory />} />
                    <Route path="product-reviews" element={<ProductReviews />} />
                    <Route path="return-requests" element={<ReturnRequests />} />
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
