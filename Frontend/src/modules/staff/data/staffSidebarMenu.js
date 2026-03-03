export const staffSidebarMenu = [
    {
        title: 'Dashboard',
        path: '/staff/dashboard',
        icon: 'LayoutDashboard',
        permission: 'VIEW_DASHBOARD'
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
        permission: 'VIEW_PRODUCTS'
    },
    {
        title: 'Customers',
        path: '/staff/customers',
        icon: 'Users',
        permission: 'VIEW_CUSTOMERS'
    },
    {
        title: 'Support',
        path: '/staff/support',
        icon: 'MessageSquare',
        permission: 'VIEW_CUSTOMERS'
    },
    {
        title: 'Staff Management',
        path: '/staff/staff',
        icon: 'UserPlus',
        permission: 'MANAGE_STAFF'
    },
    {
        title: 'Policies & Legal',
        path: '/staff/legal',
        icon: 'Shield',
        permission: 'VIEW_DASHBOARD'
    }
];
