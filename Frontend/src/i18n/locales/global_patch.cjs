'use strict';
const fs = require('fs');
const path = require('path');

const files = ['en.json', 'hi.json'];

files.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const isHi = filename === 'hi.json';

  // Helper to ensure path exists
  const ensure = (obj, p) => {
    let curr = obj;
    p.split('.').forEach(k => {
      if (!curr[k]) curr[k] = {};
      curr = curr[k];
    });
    return curr;
  };

  // 1. Ensure Top-Level Sections exist (mirroring dashboard sections for code compatibility)
  const sections = ['customers', 'staff', 'vendors', 'products', 'categories', 'brands', 'locations', 'delivery', 'notifications', 'support'];
  
  sections.forEach(sec => {
    if (!data[sec]) {
      data[sec] = JSON.parse(JSON.stringify(data.dashboard[sec] || {}));
      console.log(`[${filename}] Created top-level ${sec}`);
    }
  });

  // 2. Fix Customers Pagination & Alerts (AllCustomers.jsx)
  const cust = ensure(data, 'customers.all');
  if (!cust.pagination) cust.pagination = {
    showing: isHi ? 'दिखाया जा रहा है' : 'Showing',
    to: isHi ? 'से' : 'to',
    of: isHi ? 'का' : 'of'
  };
  if (!cust.alerts) cust.alerts = {
    block_success: isHi ? 'उपयोगकर्ता को सफलतापूर्वक ब्लॉक किया गया' : 'User blocked successfully',
    unblock_success: isHi ? 'उपयोगकर्ता को सफलतापूर्वक अनब्लॉक किया गया' : 'User unblocked successfully',
    sent_success: isHi ? '{{type}} सफलतापूर्वक भेजा गया' : '{{type}} sent successfully',
    delivered_success: isHi ? '{{type}} {{name}} को भेज दिया गया है' : '{{type}} has been delivered to {{name}}'
  };
  if (!cust.status) cust.status = {
    active: isHi ? 'सक्रिय' : 'Active',
    blocked: isHi ? 'ब्लॉक' : 'Blocked'
  };
  if (!cust.table) cust.table = {
    customer: isHi ? 'ग्राहक' : 'Customer',
    contact: isHi ? 'संपर्क' : 'Contact',
    location: isHi ? 'स्थान' : 'Location',
    wallet: isHi ? 'वॉलेट' : 'Wallet',
    status: isHi ? 'स्थिति' : 'Status',
    actions: isHi ? 'कार्रवाई' : 'Actions'
  };
  if (!cust.actions) cust.actions = {
    view_profile: isHi ? 'प्रोफ़ाइल देखें' : 'View Profile',
    send_email: isHi ? 'ईमेल भेजें' : 'Send Email',
    send_message: isHi ? 'संदेश भेजें' : 'Send Message',
    block_user: isHi ? 'ब्लॉक करें' : 'Block User',
    unblock_user: isHi ? 'अनब्लॉक करें' : 'Unblock User'
  };
  cust.anonymous = isHi ? 'अनाम' : 'Anonymous';
  cust.no_customers = isHi ? 'कोई ग्राहक नहीं मिला' : 'No customers found';

  // 3. Fix Staff Permissions & Pagination (AllStaff.jsx)
  const st = data.staff;
  if (!st.pagination) st.pagination = {
    showing: isHi ? 'दिखाया जा रहा है' : 'Showing',
    to: isHi ? 'से' : 'to',
    of: isHi ? 'का' : 'of',
    staff_members: isHi ? 'कर्मचारी' : 'staff members'
  };
  if (!st.table) st.table = {
    profile: isHi ? 'प्रोफ़ाइल' : 'Profile',
    role: isHi ? 'भूमिका' : 'Role',
    branch: isHi ? 'शाखा' : 'Branch',
    status: isHi ? 'स्थिति' : 'Status',
    actions: isHi ? 'कार्रवाई' : 'Actions'
  };
  if (!st.status) st.status = {
    active: isHi ? 'सक्रिय' : 'Active',
    inactive: isHi ? 'निष्क्रिय' : 'Inactive'
  };
  if (!st.actions) st.actions = {
    manage_permissions: isHi ? 'अनुमतियां प्रबंधित करें' : 'Manage Permissions',
    edit_staff: isHi ? 'कर्मचारी संपादित करें' : 'Edit Staff',
    remove_staff: isHi ? 'कर्मचारी हटाएं' : 'Remove Staff'
  };
  if (!st.alerts) st.alerts = {
    remove_title: isHi ? 'कर्मचारी हटाएं?' : 'Delete Staff Member?',
    remove_text: isHi ? 'क्या आप वाकई {{name}} को हटाना चाहते हैं?' : 'Are you sure you want to remove {{name}}?',
    removed_title: isHi ? 'हटा दिया गया!' : 'Removed!',
    removed_text: isHi ? 'कर्मचारी को सफलतापूर्वक हटा दिया गया है।' : 'Staff member has been removed successfully.',
    update_success: isHi ? 'कर्मचारी अपडेट सफल' : 'Staff updated successfully',
    permissions_updated: isHi ? 'अनुमतियां अपडेट की गईं' : 'Permissions updated successfully'
  };
  if (!st.permission_labels) st.permission_labels = {
    VIEW_DASHBOARD: isHi ? 'डैशबोर्ड देखें' : 'View Dashboard',
    VIEW_ORDERS: isHi ? 'ऑर्डर देखें' : 'View Orders',
    MANAGE_ORDERS: isHi ? 'ऑर्डर प्रबंधित करें' : 'Manage Orders',
    MANAGE_REFUNDS_RETURNS: isHi ? 'रिफंड और वापसी प्रबंधित करें' : 'Manage Refunds & Returns',
    VIEW_PRODUCTS: isHi ? 'उत्पाद देखें' : 'View Products',
    MANAGE_PRODUCTS: isHi ? 'उत्पाद प्रबंधित करें' : 'Manage Products',
    MANAGE_CATEGORIES_BRANDS: isHi ? 'श्रेणियां और ब्रांड प्रबंधित करें' : 'Manage Categories & Brands',
    MANAGE_INVENTORY: isHi ? 'इन्वेंट्री प्रबंधित करें' : 'Manage Inventory',
    MANAGE_DELIVERY: isHi ? 'डिलीवरी प्रबंधित करें' : 'Manage Delivery',
    VIEW_CUSTOMERS: isHi ? 'ग्राहक देखें' : 'View Customers',
    MANAGE_CUSTOMERS: isHi ? 'ग्राहक प्रबंधित करें' : 'Manage Customers',
    MANAGE_STAFF: isHi ? 'कर्मचारी प्रबंधित करें' : 'Manage Staff',
    MANAGE_BRANCHES: isHi ? 'शाखाएं प्रबंधित करें' : 'Manage Branches',
    MANAGE_VENDORS: isHi ? 'विक्रेता प्रबंधित करें' : 'Manage Vendors',
    MANAGE_POS_BILLING: isHi ? 'पीओएस बिलिंग प्रबंधित करें' : 'Manage POS Billing',
    MANAGE_SETTINGS: isHi ? 'सेटिंग्स प्रबंधित करें' : 'Manage Settings'
  };
  st.permissions_modal = {
    title: isHi ? 'कर्मचारी अनुमतियां' : 'Staff Permissions',
    access_control: isHi ? 'एक्सेस कंट्रोल' : 'Access Control'
  };
  st.no_staff = isHi ? 'कोई कर्मचारी नहीं मिला' : 'No staff found';
  st.add_short = isHi ? 'जोड़ें' : 'Add';

  // 4. Fix Vendors Section (AllVendors.jsx)
  const vn = data.vendors;
  if (!vn.pagination) vn.pagination = {
    showing: isHi ? 'दिखाया जा रहा है' : 'Showing',
    to: isHi ? 'से' : 'to',
    of: isHi ? 'का' : 'of'
  };
  if (!vn.table) vn.table = {
    name: isHi ? 'स्टोर का नाम' : 'Store Name',
    contact: isHi ? 'संपर्क' : 'Contact',
    products: isHi ? 'उत्पाद' : 'Products',
    rating: isHi ? 'रेटिंग' : 'Rating',
    status: isHi ? 'स्थिति' : 'Status',
    actions: isHi ? 'कार्रवाई' : 'Actions'
  };
  if (!vn.status) vn.status = {
    active: isHi ? 'सक्रिय' : 'Active',
    pending: isHi ? 'लंबित' : 'Pending',
    inactive: isHi ? 'निष्क्रिय' : 'Inactive'
  };
  vn.delete_confirm_title = isHi ? 'विक्रेता हटाएं?' : 'Delete Vendor?';
  vn.delete_confirm_text = isHi ? 'क्या आप वाकई {{name}} को हटाना चाहते हैं?' : 'Are you sure you want to remove {{name}}?';
  vn.new_rating = isHi ? 'नया' : 'New';
  vn.view_info = isHi ? 'जानकारी देखें' : 'View Info';
  vn.approve = isHi ? 'स्वीकार करें' : 'Approve';
  vn.block = isHi ? 'ब्लॉक करें' : 'Block';
  vn.no_vendors = isHi ? 'कोई विक्रेता नहीं मिला' : 'No vendors found';

  // 5. Fix Analytics Section (RevenueAnalytics.jsx)
  if (!data.analytics) data.analytics = {};
  const an = data.analytics;
  an.revenue = {
    title: isHi ? 'राजस्व एनालिटिक्स' : 'Revenue Analytics',
    subtitle: isHi ? 'अपने वित्तीय प्रदर्शन और विकास मेट्रिक्स को ट्रैक करें।' : 'Track your financial performance and growth metrics.',
    export_data: isHi ? 'डेटा निर्यात करें' : 'Export Data',
    export_short: isHi ? 'निर्यात' : 'Export',
    periods: {
      this_week: isHi ? 'इस सप्ताह' : 'Current Week',
      this_month: isHi ? 'इस महीने' : 'Current Month',
      last_month: isHi ? 'पिछले महीने' : 'Last Month',
      year_to_date: isHi ? 'इस साल अब तक' : 'Year to Date'
    },
    cards: {
      net_sales: isHi ? 'कुल शुद्ध बिक्री' : 'Total Net Sales',
      refunds: isHi ? 'कुल रिफंड' : 'Total Refunds',
      payouts: isHi ? 'विक्रेता भुगतान' : 'Vendor Payouts',
      net_profit: isHi ? 'शुद्ध लाभ' : 'Net Profit',
      vs_prev: isHi ? 'पिछले काल की तुलना में' : 'vs prev period',
      growth: isHi ? 'विकास' : 'growth',
      refund_desc: isHi ? 'वापस किए गए ऑर्डर का मूल्य' : 'Value of returned orders',
      payout_desc: isHi ? 'सेटलमेंट प्रोसेस किए गए' : 'Settlements processed'
    },
    chart: {
      title: isHi ? 'राजस्व विकास अवलोकन' : 'Revenue Growth Overview',
      subtitle: isHi ? 'डिलिवर किए गए ऑर्डर के आधार पर शुद्ध बिक्री प्रदर्शन' : 'Net sales performance based on delivered orders',
      live_update: isHi ? 'लाइव अपडेट' : 'Live Update',
      no_data: isHi ? 'चयनित अवधि के लिए कोई डेटा उपलब्ध नहीं है' : 'No data available for the selected period'
    },
    table: {
      title: isHi ? 'दैनिक विवरण' : 'Daily Breakdown',
      last_days: isHi ? 'पिछले {{count}} सक्रिय दिन' : 'Last {{count}} Active Days',
      date: isHi ? 'तारीख' : 'Date',
      orders: isHi ? 'डिलिवर किए गए ऑर्डर' : 'Delivered Orders',
      gross: isHi ? 'सकल बिक्री' : 'Gross Sales',
      refunds: isHi ? 'रिफंड' : 'Refunds',
      net: isHi ? 'शुद्ध बिक्री' : 'Net Sales',
      no_records: isHi ? 'इस अवधि के लिए कोई वित्तीय रिकॉर्ड नहीं मिला।' : 'No financial records found for this period.'
    }
  };

  // 6. Fix Global Dashboard Payment Source missing keys
  data.dashboard.source_of_orders = isHi ? 'ऑर्डर का स्रोत' : 'Source of Orders';
  data.dashboard.payment_methods = {
    cash: isHi ? 'नकद' : 'Cash',
    online: isHi ? 'ऑनलाइन' : 'Online',
    wallet: isHi ? 'वॉलेट' : 'Wallet'
  };

  // Sync back to dashboard nested versions
  sections.forEach(sec => {
    data.dashboard[sec] = JSON.parse(JSON.stringify(data[sec]));
  });

  // Final Save
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ [${filename}] Global Patch Applied`);
});
