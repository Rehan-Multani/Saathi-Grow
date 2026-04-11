import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Common
import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';

// Admin Modules (English)
import enAdminLogin from './locales/en/admin/login.json';
import enAdminDashboard from './locales/en/admin/dashboard.json';
import enAdminOrders from './locales/en/admin/orders.json';
import enAdminSidebar from './locales/en/admin/sidebar.json';
import enAdminProducts from './locales/en/admin/products.json';
import enAdminCategories from './locales/en/admin/categories.json';
import enAdminCustomers from './locales/en/admin/customers.json';
import enAdminStaff from './locales/en/admin/staff.json';
import enAdminStock from './locales/en/admin/stock.json';
import enAdminDelivery from './locales/en/admin/delivery.json';
import enAdminVendors from './locales/en/admin/vendors.json';
import enAdminLocations from './locales/en/admin/locations.json';
import enAdminOffers from './locales/en/admin/offers.json';
import enAdminCampaigns from './locales/en/admin/campaigns.json';
import enAdminNotifications from './locales/en/admin/notifications.json';
import enAdminSupport from './locales/en/admin/support.json';
import enAdminReports from './locales/en/admin/reports.json';
import enAdminAnalytics from './locales/en/admin/analytics.json';
import enAdminPolicies from './locales/en/admin/policies.json';
import enAdminSettings from './locales/en/admin/settings.json';


// Admin Modules (Hindi)
import hiAdminLogin from './locales/hi/admin/login.json';
import hiAdminDashboard from './locales/hi/admin/dashboard.json';
import hiAdminOrders from './locales/hi/admin/orders.json';
import hiAdminSidebar from './locales/hi/admin/sidebar.json';
import hiAdminProducts from './locales/hi/admin/products.json';
import hiAdminCategories from './locales/hi/admin/categories.json';
import hiAdminCustomers from './locales/hi/admin/customers.json';
import hiAdminStaff from './locales/hi/admin/staff.json';
import hiAdminStock from './locales/hi/admin/stock.json';
import hiAdminDelivery from './locales/hi/admin/delivery.json';
import hiAdminVendors from './locales/hi/admin/vendors.json';
import hiAdminLocations from './locales/hi/admin/locations.json';
import hiAdminOffers from './locales/hi/admin/offers.json';
import hiAdminCampaigns from './locales/hi/admin/campaigns.json';
import hiAdminNotifications from './locales/hi/admin/notifications.json';
import hiAdminSupport from './locales/hi/admin/support.json';
import hiAdminReports from './locales/hi/admin/reports.json';
import hiAdminAnalytics from './locales/hi/admin/analytics.json';
import hiAdminPolicies from './locales/hi/admin/policies.json';
import hiAdminSettings from './locales/hi/admin/settings.json';


const resources = {
  en: {
    common: enCommon,
    admin_login: enAdminLogin,
    admin_dashboard: enAdminDashboard,
    admin_orders: enAdminOrders,
    admin_sidebar: enAdminSidebar,
    admin_products: enAdminProducts,
    admin_categories: enAdminCategories,
    admin_customers: enAdminCustomers,
    admin_staff: enAdminStaff,
    admin_stock: enAdminStock,
    admin_delivery: enAdminDelivery,
    admin_vendors: enAdminVendors,
    admin_locations: enAdminLocations,
    admin_offers: enAdminOffers,
    admin_campaigns: enAdminCampaigns,
    admin_notifications: enAdminNotifications,
    admin_support: enAdminSupport,
    admin_reports: enAdminReports,
    admin_analytics: enAdminAnalytics,
    admin_policies: enAdminPolicies,
    admin_settings: enAdminSettings
  },

  hi: {
    common: hiCommon,
    admin_login: hiAdminLogin,
    admin_dashboard: hiAdminDashboard,
    admin_orders: hiAdminOrders,
    admin_sidebar: hiAdminSidebar,
    admin_products: hiAdminProducts,
    admin_categories: hiAdminCategories,
    admin_customers: hiAdminCustomers,
    admin_staff: hiAdminStaff,
    admin_stock: hiAdminStock,
    admin_delivery: hiAdminDelivery,
    admin_vendors: hiAdminVendors,
    admin_locations: hiAdminLocations,
    admin_offers: hiAdminOffers,
    admin_campaigns: hiAdminCampaigns,
    admin_notifications: hiAdminNotifications,
    admin_support: hiAdminSupport,
    admin_reports: hiAdminReports,
    admin_analytics: hiAdminAnalytics,
    admin_policies: hiAdminPolicies,
    admin_settings: hiAdminSettings
  },

};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'admin_login', 'admin_dashboard', 'admin_orders', 'admin_sidebar', 'admin_products', 'admin_categories', 'admin_customers', 'admin_staff', 'admin_stock', 'admin_delivery', 'admin_vendors', 'admin_locations', 'admin_offers', 'admin_campaigns', 'admin_notifications', 'admin_support', 'admin_reports', 'admin_analytics', 'admin_policies', 'admin_settings'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
