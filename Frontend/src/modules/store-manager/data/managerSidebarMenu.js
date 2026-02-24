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
    title: 'Delivery Management',
    icon: 'Truck',
    permission: 'MANAGE_DELIVERY',
    submenu: [
      { title: 'Delivery Partners', path: '/store-manager/delivery/partners', permission: 'MANAGE_DELIVERY' },
      { title: 'Assign Deliveries', path: '/store-manager/delivery/assign', permission: 'MANAGE_DELIVERY' },
      { title: 'Live Tracking', path: '/store-manager/delivery/tracking', permission: 'MANAGE_DELIVERY' },
    ],
  },
  {
    title: 'Customers',
    path: '/store-manager/customers',
    icon: 'UserCloud',
    permission: 'VIEW_CUSTOMERS'
  },
  {
    title: 'Reports & Analytics',
    path: '/store-manager/reports',
    icon: 'BarChart3',
    permission: 'VIEW_DASHBOARD'
  },
  {
    title: 'Branch Profile',
    path: '/store-manager/profile',
    icon: 'Store',
    permission: 'VIEW_DASHBOARD'
  }
];
