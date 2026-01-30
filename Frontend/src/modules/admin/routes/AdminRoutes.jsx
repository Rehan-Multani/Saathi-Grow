import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import Dashboard from '../pages/Dashboard';
import AllOrders from '../pages/orders/AllOrders';
import PosOrders from '../pages/orders/PosOrders';
import OnlineOrders from '../pages/orders/OnlineOrders';
import ReturnRequests from '../pages/orders/ReturnRequests';
import AllProducts from '../pages/products/AllProducts';
import AddProduct from '../pages/products/AddProduct';
import AllCategories from '../pages/categories/AllCategories';
import AddCategory from '../pages/categories/AddCategory';
import AllBrands from '../pages/brands/AllBrands';
import AddBrand from '../pages/brands/AddBrand';
import AllCustomers from '../pages/customers/AllCustomers';
import CustomerOrders from '../pages/customers/CustomerOrders';
import StockOverview from '../pages/stock/StockOverview';
import BranchStock from '../pages/stock/BranchStock';
import StockAdjustments from '../pages/stock/StockAdjustments';
import LowStockAlerts from '../pages/stock/LowStockAlerts';
import DeliveryPartners from '../pages/delivery/DeliveryPartners';
import AssignDeliveries from '../pages/delivery/AssignDeliveries';
import DeliveryTracking from '../pages/delivery/DeliveryTracking';
import AllVendors from '../pages/vendors/AllVendors';
import AddVendor from '../pages/vendors/AddVendor';
import VendorProducts from '../pages/vendors/VendorProducts';
import VendorPayouts from '../pages/vendors/VendorPayouts';
import Branches from '../pages/locations/Branches';
import Warehouses from '../pages/locations/Warehouses';

// Placeholder components for the demo to work without 50 separate files initially
// Placeholder components for the demo
const PlaceholderPage = ({ title }) => (
    <div className="p-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="mb-3 bg-light rounded-circle p-4">
            <span style={{ fontSize: '3rem' }}>🚧</span>
        </div>
        <h2 className="fw-bold text-dark">{title}</h2>
        <p className="text-muted lead mb-4">This module is currently under active development.</p>
        <div className="d-flex gap-2">
            <button className="btn btn-primary">Go to Dashboard</button>
            <button className="btn btn-outline-secondary">Contact Support</button>
        </div>
    </div>
);

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Orders */}
                <Route path="orders" element={<AllOrders />} />
                <Route path="orders/pos" element={<PosOrders />} />
                <Route path="orders/online" element={<OnlineOrders />} />
                <Route path="orders/returns" element={<ReturnRequests />} />

                <Route path="products" element={<AllProducts />} />
                <Route path="products/add" element={<AddProduct />} />

                {/* Categories */}
                <Route path="categories" element={<AllCategories />} />
                <Route path="categories/add" element={<AddCategory />} />

                {/* Brands */}
                <Route path="brands" element={<AllBrands />} />
                <Route path="brands/add" element={<AddBrand />} />

                {/* Customers */}
                <Route path="customers" element={<AllCustomers />} />
                <Route path="customers/orders" element={<CustomerOrders />} />

                {/* Stock Management */}
                <Route path="stock" element={<StockOverview />} />
                <Route path="stock/branches" element={<BranchStock />} />
                <Route path="stock/adjustments" element={<StockAdjustments />} />
                <Route path="stock/alerts" element={<LowStockAlerts />} />

                {/* Delivery Management */}
                <Route path="delivery/partners" element={<DeliveryPartners />} />
                <Route path="delivery/assign" element={<AssignDeliveries />} />
                <Route path="delivery/tracking" element={<DeliveryTracking />} />

                {/* Vendors */}
                <Route path="vendors" element={<AllVendors />} />
                <Route path="vendors/add" element={<AddVendor />} />
                <Route path="vendors/products" element={<VendorProducts />} />
                <Route path="vendors/payouts" element={<VendorPayouts />} />

                {/* Locations */}
                <Route path="locations/branches" element={<Branches />} />
                <Route path="locations/warehouses" element={<Warehouses />} />

                {/* Fallback for all other sub-routes defined in sidebar */}
                <Route path="*" element={<PlaceholderPage title="Page Not Found / Under Construction" />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
