export const staffSidebarMenu = [
    {
        title: 'Dashboard',
        path: '/staff/dashboard',
        icon: 'LayoutDashboard',
        permission: 'VIEW_DASHBOARD'
    },
    {
        title: 'Billing',
        path: '/staff/pos-billing',
        icon: 'Zap',
        permission: 'MANAGE_POS_BILLING'
    },
    {
        title: 'Orders',
        icon: 'ShoppingCart',
        permission: 'VIEW_ORDERS',
        submenu: [
            { title: 'Active Orders', path: '/staff/orders/active', permission: 'VIEW_ORDERS' },
            { title: 'Return Requests', path: '/staff/orders/returns', permission: 'MANAGE_REFUNDS_RETURNS' },
        ],
    },
    {
        title: 'Inventory',
        path: '/staff/inventory',
        icon: 'Package',
        permission: 'MANAGE_INVENTORY'
    },
    {
        title: 'Products',
        path: '/staff/products',
        icon: 'ShoppingBag',
        permission: 'MANAGE_PRODUCTS'
    },
    {
        title: 'Customers',
        path: '/staff/customers',
        icon: 'Users',
        permission: 'VIEW_CUSTOMERS'
    },
    {
        title: 'Reports',
        icon: 'BarChart3',
        permission: 'VIEW_REPORTS',
        submenu: [
            { title: 'Analytics', path: '/staff/reports', permission: 'VIEW_REPORTS' },
            { title: 'Vyapar Report', path: '/staff/reports/vyapar', permission: 'VIEW_REPORTS' }
        ]
    },
    {
        title: 'Support',
        path: '/staff/support',
        icon: 'MessageSquare',
        permission: null
    },
    {
        title: 'Notifications',
        path: '/staff/notifications',
        icon: 'Bell',
        permission: null
    },
    {
        title: 'Manage Staff',
        path: '/staff/staff',
        icon: 'UserPlus',
        permission: 'MANAGE_STAFF'
    },
    {
        title: 'Policies & Legal',
        path: '/staff/legal',
        icon: 'Shield',
        permission: null
    }
];
