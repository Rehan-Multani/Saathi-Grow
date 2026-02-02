export const staffSidebarMenu = [
    {
        title: 'Dashboard',
        path: '/staff/dashboard',
        icon: 'LayoutDashboard',
    },
    {
        title: 'Orders',
        icon: 'ShoppingCart',
        submenu: [
            { title: 'Active Orders', path: '/staff/orders/active' },
            { title: 'Return Requests', path: '/staff/orders/returns' },
        ],
    },
    {
        title: 'Inventory',
        path: '/staff/inventory',
        icon: 'Package',
    },
    {
        title: 'Support',
        path: '/staff/support',
        icon: 'MessageSquare',
    }
];
