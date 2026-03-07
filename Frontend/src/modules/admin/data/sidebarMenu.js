export const adminSidebarMenu = [
    {
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'LayoutDashboard',
        permission: 'VIEW_DASHBOARD'
    },
    {
        title: 'Orders',
        icon: 'ShoppingCart',
        permission: 'VIEW_ORDERS',
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
        permission: 'VIEW_PRODUCTS',
        submenu: [
            { title: 'All Products', path: '/admin/products' },
            { title: 'Add Product', path: '/admin/products/add' },
        ],
    },
    {
        title: 'Categories & Brands',
        icon: 'Tag',
        permission: 'MANAGE_CATEGORIES_BRANDS',
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
        permission: 'VIEW_CUSTOMERS',
        submenu: [
            { title: 'All Customers', path: '/admin/customers' },
            { title: 'Customer Orders', path: '/admin/customers/orders' },
        ],
    },
    {
        title: 'Staff Management',
        icon: 'Briefcase',
        permission: 'MANAGE_STAFF',
        submenu: [
            { title: 'All Staff', path: '/admin/staff' },
            { title: 'Add Staff', path: '/admin/staff/add' },
        ],
    },
    {
        title: 'Stock Management',
        icon: 'Boxes',
        permission: 'MANAGE_INVENTORY',
        submenu: [
            { title: 'Stock Overview', path: '/admin/stock' },
            { title: 'Branch-wise Stock', path: '/admin/stock/branches' },
            { title: 'Stock Adjustments', path: '/admin/stock/adjustments' },
            { title: 'Low Stock Alerts', path: '/admin/stock/alerts' },
            { title: 'Inventory Requests', path: '/admin/stock/requests' },
        ],
    },
    {
        title: 'Delivery Management',
        icon: 'Truck',
        permission: 'MANAGE_DELIVERY_BOYS',
        submenu: [
            { title: 'Delivery Partners', path: '/admin/delivery/partners' },
            { title: 'Assign Deliveries', path: '/admin/delivery/assign' },
            { title: 'Delivery Tracking', path: '/admin/delivery/tracking' },
            { title: 'Delivery Slots', path: '/admin/delivery/slots' },
            { title: 'Cash Settlement', path: '/admin/delivery/settlement' },
        ],
    },
    {
        title: 'Vendors',
        icon: 'Store',
        permission: 'MANAGE_VENDORS',
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
        permission: 'MANAGE_BRANCHES',
        submenu: [
            { title: 'Branches', path: '/admin/locations/branches' },
            { title: 'Add Branch', path: '/admin/locations/branches/add' },
        ],
    },
    {
        title: 'Offers & Sliders',
        icon: 'Percent',
        permission: 'MANAGE_CAMPAIGNS',
        submenu: [
            { title: 'Banner Deals', path: '/admin/offers/deals' },
            { title: 'Festive Campaigns', path: '/admin/campaigns' },
        ],
    },
    {
        title: 'Promo Codes',
        icon: 'Ticket',
        permission: 'MANAGE_CAMPAIGNS',
        submenu: [
            { title: 'All Promo Codes', path: '/admin/promocodes' },
            { title: 'Create Promo Code', path: '/admin/promocodes/create' },
        ],
    },
    {
        title: 'Notifications',
        icon: 'Bell',
        permission: 'MANAGE_SETTINGS',
        submenu: [
            { title: 'Push Notification', path: '/admin/notifications/push' }
        ]
    },
    {
        title: 'Support Desk',
        icon: 'Headphones',
        permission: 'VIEW_CUSTOMERS',
        submenu: [
            { title: 'Tickets', path: '/admin/support/tickets' },

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

            { title: 'Vendor Earnings', path: '/admin/analytics/earnings' },

        ],
    },
    {
        title: 'Legal & Policies',
        path: '/admin/policies',
        icon: 'Shield',
        permission: 'MANAGE_SETTINGS'
    },
    {
        title: 'Settings',
        icon: 'Settings',
        submenu: [
            { title: 'Admin Profile', path: '/admin/settings/profile' },

            { title: 'Tax & Billing Settings', path: '/admin/settings/billing' },
            { title: 'App Settings', path: '/admin/settings/app' },
            { title: 'Social Profile', path: '/admin/settings/social' },
        ],
    },
];
