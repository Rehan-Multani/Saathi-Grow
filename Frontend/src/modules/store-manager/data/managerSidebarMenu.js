export const managerSidebarMenu = [
  {
    title: 'Dashboard',
    path: '/store-manager/dashboard',
    icon: 'LayoutDashboard',
    permission: null
  },
  {
    title: 'POS Billing',
    path: '/store-manager/pos-billing',
    icon: 'Zap',
    permission: 'MANAGE_POS_BILLING'
  },
  {
    title: 'Inventory',
    path: '/store-manager/inventory',
    icon: 'Package',
    permission: 'MANAGE_INVENTORY'
  },
  {
    title: 'Products',
    path: '/store-manager/products',
    icon: 'ShoppingBag',
    permission: 'VIEW_PRODUCTS'
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
    permission: null
  },
  {
    title: 'Customers',
    path: '/store-manager/customers',
    icon: 'Users',
    permission: 'VIEW_CUSTOMERS'
  },
  {
    title: 'Reports & Analytics',
    icon: 'BarChart3',
    permission: null,
    submenu: [
      { title: 'General Reports', path: '/store-manager/reports', permission: null },
      { title: 'Vyapar Report', path: '/store-manager/reports/vyapar', permission: null },
    ],
  },
  {
    title: 'Support Tickets',
    path: '/store-manager/support',
    icon: 'Headphones',
    permission: null
  },
  {
    title: 'Branch Profile',
    path: '/store-manager/profile',
    icon: 'Store',
    permission: null
  },
  {
    title: 'Legal & Policies',
    path: '/store-manager/policies',
    icon: 'Shield',
    permission: null
  }
];
