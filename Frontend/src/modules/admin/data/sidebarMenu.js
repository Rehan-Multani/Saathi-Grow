export const adminSidebarMenu = [
    {
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'LayoutDashboard',
    },
    {
        title: 'Orders',
        icon: 'ShoppingCart',
        submenu: [
            { title: 'All Orders', path: '/admin/orders' },
            { title: 'POS Orders', path: '/admin/orders/pos' },
            { title: 'Online Orders', path: '/admin/orders/online' },
            { title: 'Return Requests', path: '/admin/orders/returns' },
        ],
    },
    {
        title: 'Products',
        icon: 'Package',
        submenu: [
            { title: 'All Products', path: '/admin/products' },
            { title: 'Add Product', path: '/admin/products/add' },
            { title: 'Categories', path: '/admin/products/categories' },
        ],
    },
    {
        title: 'Post & Brands',
        icon: 'Tag',
        submenu: [
            { title: 'All Categories', path: '/admin/categories' },
            { title: 'Add Category', path: '/admin/categories/add' },
            { title: 'All Brands', path: '/admin/brands' },
            { title: 'Add Brand', path: '/admin/brands/add' },
        ],
    },
    {
        title: 'Customers',
        icon: 'Users',
        submenu: [
            { title: 'All Customers', path: '/admin/customers' },
            { title: 'Customer Orders', path: '/admin/customers/orders' },
        ],
    },
    {
        title: 'Stock Management',
        icon: 'Boxes',
        submenu: [
            { title: 'Stock Overview', path: '/admin/stock' },
            { title: 'Branch-wise Stock', path: '/admin/stock/branches' },
            { title: 'Stock Adjustments', path: '/admin/stock/adjustments' },
            { title: 'Low Stock Alerts', path: '/admin/stock/alerts' },
        ],
    },
    {
        title: 'Delivery Management',
        icon: 'Truck',
        submenu: [
            { title: 'Delivery Partners', path: '/admin/delivery/partners' },
            { title: 'Assign Deliveries', path: '/admin/delivery/assign' },
            { title: 'Delivery Tracking', path: '/admin/delivery/tracking' },
        ],
    },
    {
        title: 'Vendors',
        icon: 'Store',
        submenu: [
            { title: 'All Vendors', path: '/admin/vendors' },
            { title: 'Add Vendor', path: '/admin/vendors/add' },
            { title: 'Vendor Products', path: '/admin/vendors/products' },
            { title: 'Vendor Payouts', path: '/admin/vendors/payouts' },
        ],
    },
    {
        title: 'Locations',
        icon: 'MapPin',
        submenu: [
            { title: 'Branches', path: '/admin/locations/branches' },
            { title: 'Warehouses', path: '/admin/locations/warehouses' },
        ],
    },
    {
        title: 'Offers & Sliders',
        icon: 'Percent',
        submenu: [
            { title: 'Offers', path: '/admin/offers' },
            { title: 'Sliders', path: '/admin/sliders' },
            { title: 'Banners', path: '/admin/banners' },
        ],
    },
    {
        title: 'Promo Codes',
        icon: 'Ticket',
        submenu: [
            { title: 'All Promo Codes', path: '/admin/promocodes' },
            { title: 'Create Promo Code', path: '/admin/promocodes/create' },
        ],
    },
    {
        title: 'Notifications',
        icon: 'Bell',
        submenu: [
            { title: 'Push Notification', path: '/admin/notifications/push' }
        ]
    },
    {
        title: 'Support Desk',
        icon: 'Headphones',
        submenu: [
            { title: 'Tickets', path: '/admin/support/tickets' },
            { title: 'Live Chat', path: '/admin/support/chat' },
            { title: 'FAQs', path: '/admin/support/faqs' },
        ],
    },
    {
        title: 'Reports',
        icon: 'FileText',
        submenu: [
            { title: 'Sales Reports', path: '/admin/reports/sales' },
            { title: 'Inventory Reports', path: '/admin/reports/inventory' },
            { title: 'Vendor Reports', path: '/admin/reports/vendors' },
        ],
    },
    {
        title: 'Analytics & Finance',
        icon: 'BarChart3',
        submenu: [
            { title: 'Revenue Analytics', path: '/admin/analytics/revenue' },
            { title: 'POS Analytics', path: '/admin/analytics/pos' },
            { title: 'Vendor Earnings', path: '/admin/analytics/earnings' },
            { title: 'Tax & GST Reports', path: '/admin/analytics/tax' },
        ],
    },
    {
        title: 'Policies',
        icon: 'Shield',
        submenu: [
            { title: 'Privacy Policy', path: '/admin/policies/privacy' },
            { title: 'Refund Policy', path: '/admin/policies/refund' },
            { title: 'Terms & Conditions', path: '/admin/policies/terms' },
        ],
    },
    {
        title: 'Settings',
        icon: 'Settings',
        submenu: [
            { title: 'Admin Profile', path: '/admin/settings/profile' },
            { title: 'Roles & Permissions', path: '/admin/settings/roles' },
            { title: 'Tax & Billing Settings', path: '/admin/settings/billing' },
            { title: 'App Settings', path: '/admin/settings/app' },
            { title: 'Social Profile', path: '/admin/settings/social' },
        ],
    },
];
