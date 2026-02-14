import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import AdminLogin from '../pages/auth/AdminLogin';
import AdminLayout from '../AdminLayout';
import Dashboard from '../pages/Dashboard';
import AllOrders from '../pages/orders/AllOrders';
import PosOrders from '../pages/orders/PosOrders';
import OnlineOrders from '../pages/orders/OnlineOrders';
import ReturnRequests from '../pages/orders/ReturnRequests';
import AllProducts from '../pages/products/AllProducts';
import AddProduct from '../pages/products/AddProduct';
import ProductCategories from '../pages/products/Categories';
import AllCategories from '../pages/categories/AllCategories';
import AddCategory from '../pages/categories/AddCategory';
import AllBrands from '../pages/brands/AllBrands';
import AddBrand from '../pages/brands/AddBrand';
import AllCustomers from '../pages/customers/AllCustomers';
import CustomerOrders from '../pages/customers/CustomerOrders';
import StockOverview from '../pages/stock/StockOverview';
import BranchStock from '../pages/stock/BranchStock';
import StockAdjustments from '../pages/stock/StockAdjustments';
import AddStockAdjustment from '../pages/stock/AddStockAdjustment';
import LowStockAlerts from '../pages/stock/LowStockAlerts';
import DeliveryPartners from '../pages/delivery/DeliveryPartners';
import AddDeliveryPartner from '../pages/delivery/AddDeliveryPartner';
import AssignDeliveries from '../pages/delivery/AssignDeliveries';
import DeliveryTracking from '../pages/delivery/DeliveryTracking';
import PartnerDetails from '../pages/delivery/PartnerDetails';
import AllVendors from '../pages/vendors/AllVendors';
import AddVendor from '../pages/vendors/AddVendor';
import VendorProducts from '../pages/vendors/VendorProducts';
import VendorDetails from '../pages/vendors/VendorDetails';
import VendorPayouts from '../pages/vendors/VendorPayouts';
import PayoutDetails from '../pages/vendors/PayoutDetails';
import Branches from '../pages/locations/Branches';
import AddBranch from '../pages/locations/AddBranch';
import EditBranch from '../pages/locations/EditBranch';
import Warehouses from '../pages/locations/Warehouses';
import AddWarehouse from '../pages/locations/AddWarehouse';
import Offers from '../pages/offers/Offers';
import CreateOffer from '../pages/offers/CreateOffer';
import Sliders from '../pages/offers/Sliders';
import AddSlider from '../pages/offers/AddSlider';
import Banners from '../pages/offers/Banners';
import AddBanner from '../pages/offers/AddBanner';
import AllPromoCodes from '../pages/promocodes/AllPromoCodes';
import CreatePromoCode from '../pages/promocodes/CreatePromoCode';
import PushNotifications from '../pages/notifications/PushNotifications';
import SupportTickets from '../pages/support/Tickets';
import LiveChat from '../pages/support/LiveChat';
import FAQs from '../pages/support/FAQs';
import SalesReports from '../pages/reports/SalesReports';
import InventoryReports from '../pages/reports/InventoryReports';
import VendorReports from '../pages/reports/VendorReports';
import RevenueAnalytics from '../pages/analytics/RevenueAnalytics';
import POSAnalytics from '../pages/analytics/POSAnalytics';
import VendorEarnings from '../pages/analytics/VendorEarnings';
import VendorEarningDetail from '../pages/analytics/VendorEarningDetail';
import TaxReports from '../pages/analytics/TaxReports';
import PrivacyPolicy from '../pages/policies/PrivacyPolicy';
import RefundPolicy from '../pages/policies/RefundPolicy';
import TermsConditions from '../pages/policies/TermsConditions';
import AdminProfile from '../pages/settings/AdminProfile';
import RolesAndPermissions from '../pages/settings/RolesAndPermissions';
import BillingSettings from '../pages/settings/BillingSettings';
import AppSettings from '../pages/settings/AppSettings';
import SocialProfile from '../pages/settings/SocialProfile';
import AllStaff from '../pages/staff/AllStaff';
import AddStaff from '../pages/staff/AddStaff';
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

const ProtectedAdminRoute = () => {
    const { adminUser } = useAdminAuth();
    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
};

const PublicAdminRoute = () => {
    const { adminUser } = useAdminAuth();
    if (adminUser) {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Outlet />;
};

const AdminRoutes = () => {
    return (
        <AdminAuthProvider>
            <Routes>
                {/* Public Admin Routes */}
                <Route element={<PublicAdminRoute />}>
                    <Route path="login" element={<AdminLogin />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedAdminRoute />}>
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
                        <Route path="products/categories" element={<ProductCategories />} />

                        {/* Categories */}
                        <Route path="categories" element={<AllCategories />} />
                        <Route path="categories/add" element={<AddCategory />} />

                        {/* Brands */}
                        <Route path="brands" element={<AllBrands />} />
                        <Route path="brands/add" element={<AddBrand />} />

                        {/* Customers */}
                        <Route path="customers" element={<AllCustomers />} />
                        <Route path="customers/orders" element={<CustomerOrders />} />

                        {/* Staff */}
                        <Route path="staff" element={<AllStaff />} />
                        <Route path="staff/add" element={<AddStaff />} />

                        {/* Stock Management */}
                        <Route path="stock" element={<StockOverview />} />
                        <Route path="stock/branches" element={<BranchStock />} />
                        <Route path="stock/adjustments" element={<StockAdjustments />} />
                        <Route path="stock/adjustments/add" element={<AddStockAdjustment />} />
                        <Route path="stock/alerts" element={<LowStockAlerts />} />


                        {/* Delivery Management */}
                        <Route path="delivery/partners" element={<DeliveryPartners />} />
                        <Route path="delivery/partners/:id" element={<PartnerDetails />} />
                        <Route path="delivery/partners/add" element={<AddDeliveryPartner />} />
                        <Route path="delivery/assign" element={<AssignDeliveries />} />
                        <Route path="delivery/tracking" element={<DeliveryTracking />} />

                        {/* Vendors */}
                        <Route path="vendors" element={<AllVendors />} />
                        <Route path="vendors/:id" element={<VendorDetails />} />
                        <Route path="vendors/add" element={<AddVendor />} />
                        <Route path="vendors/products" element={<VendorProducts />} />
                        <Route path="vendors/payouts" element={<VendorPayouts />} />
                        <Route path="vendors/payouts/:id" element={<PayoutDetails />} />

                        {/* Locations */}
                        <Route path="locations/branches" element={<Branches />} />
                        <Route path="locations/branches/add" element={<AddBranch />} />
                        <Route path="locations/branches/edit/:id" element={<EditBranch />} />
                        <Route path="locations/warehouses" element={<Warehouses />} />
                        <Route path="locations/warehouses/add" element={<AddWarehouse />} />

                        {/* Offers & Sliders */}
                        <Route path="offers" element={<Offers />} />
                        <Route path="offers/create" element={<CreateOffer />} />
                        <Route path="sliders" element={<Sliders />} />
                        <Route path="sliders/add" element={<AddSlider />} />
                        <Route path="banners" element={<Banners />} />
                        <Route path="banners/add" element={<AddBanner />} />

                        {/* Promo Codes */}
                        <Route path="promocodes" element={<AllPromoCodes />} />
                        <Route path="promocodes/create" element={<CreatePromoCode />} />

                        {/* Notifications */}
                        <Route path="notifications/push" element={<PushNotifications />} />

                        {/* Support Desk */}
                        <Route path="support/tickets" element={<SupportTickets />} />
                        <Route path="support/chat" element={<LiveChat />} />
                        <Route path="support/faqs" element={<FAQs />} />

                        {/* Reports */}
                        <Route path="reports/sales" element={<SalesReports />} />
                        <Route path="reports/inventory" element={<InventoryReports />} />
                        <Route path="reports/vendors" element={<VendorReports />} />

                        {/* Analytics & Finance */}
                        <Route path="analytics/revenue" element={<RevenueAnalytics />} />
                        <Route path="analytics/pos" element={<POSAnalytics />} />
                        <Route path="analytics/earnings" element={<VendorEarnings />} />
                        <Route path="analytics/earnings/:id" element={<VendorEarningDetail />} />
                        <Route path="analytics/tax" element={<TaxReports />} />

                        {/* Policies */}
                        <Route path="policies/privacy" element={<PrivacyPolicy />} />
                        <Route path="policies/refund" element={<RefundPolicy />} />
                        <Route path="policies/terms" element={<TermsConditions />} />

                        {/* Settings */}
                        <Route path="settings/profile" element={<AdminProfile />} />
                        <Route path="settings/roles" element={<RolesAndPermissions />} />
                        <Route path="settings/billing" element={<BillingSettings />} />
                        <Route path="settings/app" element={<AppSettings />} />
                        <Route path="settings/social" element={<SocialProfile />} />

                        {/* Fallback for all other sub-routes defined in sidebar */}
                        <Route path="*" element={<PlaceholderPage title="Page Not Found / Under Construction" />} />
                    </Route>
                </Route>
            </Routes>
        </AdminAuthProvider>
    );
};

export default AdminRoutes;
