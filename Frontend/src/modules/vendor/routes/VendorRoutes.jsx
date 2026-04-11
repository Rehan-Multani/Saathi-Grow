import React from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import VendorHeader from '../components/VendorHeader';
import { VendorProvider } from '../contexts/VendorContext';
import FirebaseNotificationHandler from '../../../common/components/FirebaseNotificationHandler';


// Pages
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/Products/ProductList';
import AddProduct from '../pages/Products/AddProduct';
import EditProduct from '../pages/Products/EditProduct';
import DeleteProductPage from '../pages/Products/DeleteProductPage';
import BulkUpload from '../pages/Products/BulkUpload';
import AllBrands from '../pages/Brands/AllBrands';
import AddBrand from '../pages/Brands/AddBrand';
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
import LegalPolicies from '../pages/LegalPolicies';
import VendorAllOffers from '../pages/offers/VendorAllOffers';
import VendorManageOffer from '../pages/offers/VendorManageOffer';
import VendorPOS from '../pages/VendorPOS';
import VendorLocations from '../pages/VendorLocations';
import { useVendor } from '../contexts/VendorContext';

const VendorLayout = () => {
    const location = useLocation();
    const vendorToken = localStorage.getItem('sathiGro_vendor_token');
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 vendor-portal-root animate-page-entry">
            <FirebaseNotificationHandler token={vendorToken} role="vendor" />
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

const VendorPOSWrapper = () => {
    return <VendorPOS />;
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
                    <Route path="products/locations" element={<VendorLocations />} />
                    <Route path="products/bulk" element={<BulkUpload />} />
                    <Route path="brands" element={<AllBrands />} />
                    <Route path="brands/add" element={<AddBrand />} />
                    <Route path="orders" element={<AllOrders />} />
                    <Route path="pos-billing" element={<VendorPOSWrapper />} />
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
                    <Route path="policies" element={<LegalPolicies />} />
                    <Route path="offers" element={<VendorAllOffers />} />
                    <Route path="offers/create" element={<VendorManageOffer />} />
                    <Route path="offers/edit/:id" element={<VendorManageOffer />} />

                    {/* Default Redirect */}
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                </Route>
            </Routes>
        </VendorProvider>
    );
};

export default VendorRoutes;
