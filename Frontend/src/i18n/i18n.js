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
    admin_stock: enAdminStock
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
    admin_stock: hiAdminStock
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'admin_login', 'admin_dashboard', 'admin_orders', 'admin_sidebar', 'admin_products', 'admin_categories', 'admin_customers', 'admin_staff', 'admin_stock'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
