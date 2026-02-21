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
        title: 'Support',
        path: '/staff/support',
        icon: 'MessageSquare',
        permission: 'VIEW_CUSTOMERS'
    }
];
