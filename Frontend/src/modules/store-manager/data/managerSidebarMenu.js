export const managerSidebarMenu = [
  {
    title: 'Dashboard',
    path: '/store-manager/dashboard',
    icon: 'LayoutDashboard',
    permission: 'VIEW_DASHBOARD'
  },
  {
    title: 'Inventory',
    path: '/store-manager/inventory',
    icon: 'Package',
    permission: 'MANAGE_INVENTORY'
  },
  {
    title: 'Stock Requests',
    path: '/store-manager/stock-requests',
    icon: 'ClipboardList',
    permission: 'MANAGE_INVENTORY'
  },
  {
    title: 'Orders',
    icon: 'ShoppingCart',
    permission: 'VIEW_ORDERS',
    submenu: [
      { title: 'Manage Orders', path: '/store-manager/orders', permission: 'VIEW_ORDERS' },
      { title: 'Returns Approval', path: '/store-manager/returns', permission: 'MANAGE_REFUNDS_RETURNS' },
    ],
  },
  {
    title: 'Staff Management',
    path: '/store-manager/staff',
    icon: 'Users',
    permission: 'MANAGE_STAFF'
  },
  {
    title: 'Reports & Analytics',
    path: '/store-manager/reports',
    icon: 'BarChart3',
    permission: 'VIEW_DASHBOARD'
  }
];
