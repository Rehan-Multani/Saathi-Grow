'use strict';
const fs = require('fs');
const path = require('path');

const files = ['en.json', 'hi.json'];

files.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const isHi = filename === 'hi.json';

  // Helper to ensure nested object structure
  const ensure = (obj, p) => {
    let curr = obj;
    p.split('.').forEach(k => {
      if (!curr[k]) curr[k] = {};
      curr = curr[k];
    });
    return curr;
  };

  const setKey = (p, enVal, hiVal) => {
    const parts = p.split('.');
    const last = parts.pop();
    const obj = ensure(data, parts.join('.'));
    obj[last] = isHi ? hiVal : enVal;
  };

  // --- Common Keys ---
  setKey('common.welcome_back', 'Welcome back', 'वापस स्वागत है');
  setKey('common.cancel', 'Cancel', 'रद्द करें');
  setKey('common.save', 'Save', 'सहेजें');
  setKey('common.add', 'Add', 'जोड़ें');
  setKey('common.error', 'Error', 'त्रुटि');
  setKey('common.vendors', 'Vendors', 'विक्रेता');

  // --- Dashboard Section ---
  setKey('dashboard.monitoring_global_operations', 'Monitoring Global Operations', 'वैश्विक संचालन की निगरानी');
  setKey('dashboard.assigned_branch', 'Assigned Branch', 'निर्धारित शाखा');
  setKey('dashboard.booting_intelligence', 'Booting Intelligence...', 'इंटेलिजेंस बूट हो रहा है...');
  setKey('dashboard.revenue_30d', 'Revenue (30d)', 'राजस्व (30 दिन)');
  setKey('dashboard.order_flow', 'Order Flow', 'ऑर्डर फ्लो');
  setKey('dashboard.processing', 'Processing', 'प्रोसेसिंग');
  setKey('dashboard.active_market', 'Active Market', 'सक्रिय बाजार');
  setKey('dashboard.gross_volume_after_discounts', 'Gross volume after discounts', 'छूट के बाद कुल वॉल्यूम');
  setKey('dashboard.live_transaction_throughput', 'Live transaction throughput', 'लाइव लेनदेन थ्रूपुट');
  setKey('dashboard.high_workload', 'High Workload', 'उच्च कार्यभार');
  setKey('dashboard.normal_volume', 'Normal Volume', 'सामान्य वॉल्यूम');
  setKey('dashboard.registered_customers', 'Registered Customers', 'पंजीकृत ग्राहक');
  setKey('dashboard.available_inventory', 'Available Inventory', 'उपलब्ध इन्वेंट्री');
  setKey('dashboard.performance_trajectory', 'Performance Trajectory', 'प्रदर्शन प्रक्षेपवक्र');
  setKey('dashboard.revenue_and_transaction_volume', 'Revenue and Transaction Volume', 'राजस्व और लेनदेन की मात्रा');
  setKey('dashboard.channel_split', 'Channel Split', 'चैनल वितरण');
  setKey('dashboard.source_of_orders', 'Source of Orders', 'ऑर्डर का स्रोत');
  setKey('dashboard.inventory_health', 'Inventory Health', 'इन्वेंट्री स्वास्थ्य');
  setKey('dashboard.actionable_stock_intelligence', 'Actionable Stock Intelligence', 'एक्शन योग्य स्टॉक इंटेलिजेंस');
  setKey('dashboard.skus_below_threshold', 'SKUs BELOW THRESHOLD', 'थ्रेशोल्ड से नीचे SKU');
  setKey('dashboard.manage_procurement', 'Manage Procurement', 'खरीद प्रबंधित करें');
  setKey('dashboard.support_pulse', 'Support Pulse', 'सपोर्ट पल्स');
  setKey('dashboard.pending_store_escalations', 'Pending store escalations', 'लंबित स्टोर एस्केलेशन');
  setKey('dashboard.urgent', 'Urgent', 'जरूरी');
  setKey('dashboard.resolve_tickets', 'Resolve Tickets', 'टिकट हल करें');
  setKey('dashboard.rider_hub', 'Rider Hub', 'राइडर हब');
  setKey('dashboard.live', 'LIVE', 'लाइव');
  setKey('dashboard.partners_ready', 'Partners Ready', 'पार्टनर तैयार');
  setKey('dashboard.radius_msg', 'within operating radius', 'ऑपरेटिंग रेडियस के भीतर');
  setKey('dashboard.manage_fleet', 'Manage Fleet', 'बेड़े का प्रबंधन करें');
  setKey('dashboard.instant_actions', 'Instant Actions', 'त्वरित कार्रवाइयां');
  setKey('dashboard.recent_transactions', 'Recent Transactions', 'हाल के लेनदेन');
  setKey('dashboard.live_order_stream', 'Live Order Stream', 'लाइव ऑर्डर स्ट्रीम');
  setKey('dashboard.view_all_history', 'View All History', 'सारा इतिहास देखें');

  // Dashboard Table Keys
  setKey('dashboard.transaction_id', 'Transaction ID', 'लेनदेन आईडी');
  setKey('dashboard.customer_entity', 'Customer Entity', 'ग्राहक इकाई');
  setKey('dashboard.invoice_value', 'Invoice Value', 'चालान मूल्य');
  setKey('dashboard.status', 'Status', 'स्थिति');
  setKey('dashboard.protocol', 'Protocol', 'प्रोटोकॉल');
  setKey('dashboard.guest', 'Guest', 'अतिथि');
  setKey('dashboard.global', 'Global', 'ग्लोबल');

  // Order Statuses
  const orderStatuses = {
    pending: ['Pending', 'लंबित'],
    confirmed: ['Confirmed', 'पुष्टि की गई'],
    preparing: ['Preparing', 'तैयार किया जा रहा है'],
    packing: ['Packing', 'पैकिंग'],
    ready_for_pickup: ['Ready for Pickup', 'पिकअप के लिए तैयार'],
    out_for_delivery: ['Out for Delivery', 'डिलीवरी के लिए निकला'],
    delivered: ['Delivered', 'डिलिवर किया गया'],
    cancelled: ['Cancelled', 'रद्द किया गया'],
    return_requested: ['Return Requested', 'वापसी का अनुरोध किया गया'],
    returned: ['Returned', 'वापस कर दिया गया'],
    paid: ['Paid', 'भुगतान किया गया'],
    failed: ['Failed', 'विफल'],
    refunded: ['Refunded', 'रिफंड किया गया']
  };
  Object.entries(orderStatuses).forEach(([k, [en, hi]]) => {
    setKey(`dashboard.order_status.${k}`, en, hi);
  });

  // --- Products Section (AddProduct.jsx) ---
  setKey('products.add_title', 'Add New Product', 'नया उत्पाद जोड़ें');
  setKey('products.sections.general', 'General Information', 'सामान्य जानकारी');
  setKey('products.sections.pricing', 'Pricing & Units', 'मूल्य निर्धारण और इकाइयां');
  setKey('products.sections.branch_availability', 'Branch Availability & Stock', 'शाखा उपलब्धता और स्टॉक');
  setKey('products.sections.vendor_inventory', 'Vendor Inventory Control', 'विक्रेता इन्वेंट्री नियंत्रण');
  setKey('products.sections.organization', 'Organization', 'संगठन');
  setKey('products.sections.image', 'Product Display Image', 'उत्पाद की मुख्य छवि');
  setKey('products.sections.gallery', 'Visual Gallery', 'विज़ुअल गैलरी');
  
  setKey('products.form.name', 'Product Name', 'उत्पाद का नाम');
  setKey('products.form.description', 'Technical Description', 'तकनीकी विवरण');
  setKey('products.form.tags', 'Search Metadata (Tags)', 'खोज मेटाडेटा (टैग)');
  setKey('products.form.base_price', 'Base Price (INR)', 'आधार मूल्य (INR)');
  setKey('products.form.mrp', 'Maximum Retail Price', 'अधिकतम खुदरा मूल्य (MRP)');
  setKey('products.form.unit_type', 'Measurement Unit', 'मापन इकाई');
  setKey('products.form.food_type', 'Dietary Classification', 'आहार वर्गीकरण');
  setKey('products.form.physical_location', 'Storage Location', 'भंडारण स्थान');
  setKey('products.form.unit_amount', 'Unit Volume/Weight', 'इकाई मात्रा/वजन');
  setKey('products.form.available_in', 'Global Logic Matrix', 'ग्लोबल लॉजिक मैट्रिक्स');
  setKey('products.form.initial_stock_concentration', 'Initial Inventory Concentration', 'प्रारंभिक इन्वेंट्री एकाग्रता');
  setKey('products.form.low_stock_warning', 'Critical Depletion Level', 'गंभीर कमी स्तर');
  setKey('products.form.category', 'Primary Classification', 'प्राथमिक वर्गीकरण');
  setKey('products.form.brand', 'Production Brand', 'उत्पादन ब्रांड');
  setKey('products.form.assign_vendor', 'Managed Partner Assignee', 'प्रबंधित भागीदार असाइनी');
  setKey('products.form.saathi_priority', 'Saathi-Grow Prime Selection', 'साथी-ग्रो प्राइम चयन');
  setKey('products.form.saathi_priority_desc', 'Prioritize this asset in global search and recommendation engines.', 'वैश्विक खोज और अनुशंसा इंजनों में इस संपत्ति को प्राथमिकता दें।');
  setKey('products.form.sku', 'Unique Supply Key (SKU)', 'अद्वितीय आपूर्ति कुंजी (SKU)');
  setKey('products.form.qr_preview', 'Supply Protocol Visualization', 'आपूर्ति प्रोटोकॉल विज़ुअलाइज़ेशन');
  setKey('products.form.gallery_help', 'Add up to 10 visual perspectives for comprehensive analysis.', 'व्यापक विश्लेषण के लिए 10 विज़ुअल दृश्य जोड़ें।');

  setKey('products.form.placeholder.name', 'Enter product label...', 'उत्पाद लेबल दर्ज करें...');
  setKey('products.form.placeholder.description', 'Enter technical specifications...', 'तकनीकी विनिर्देश दर्ज करें...');
  setKey('products.form.placeholder.tag_input', 'Add logic tag', 'लॉजिक टैग जोड़ें');
  setKey('products.form.placeholder.price', '0.00', '0.00');
  setKey('products.form.placeholder.location', 'e.g. Aisle 4, Shelf B', 'जैसे: गलियारा 4, शेल्फ बी');
  setKey('products.form.placeholder.unit', '1', '1');
  setKey('products.form.placeholder.low_stock', '10', '10');
  setKey('products.form.placeholder.category', 'Select Category', 'श्रेणी चुनें');
  setKey('products.form.placeholder.brand', 'Select Brand', 'ब्रांड चुनें');
  setKey('products.form.placeholder.brand_no_cat', 'Please select a category first', 'कृपया पहले एक श्रेणी चुनें');

  setKey('products.dietary.veg', 'PURE VEGETARIAN', 'शुद्ध शाकाहारी');
  setKey('products.dietary.non_veg', 'NON-VEGETARIAN', 'मांसाहारी');
  setKey('products.status.active', 'Operational', 'परिचालन');
  setKey('products.edit_modal.admin_inhouse', 'Admin (In-House Inventory)', 'प्रशासक (इन-हाउस इन्वेंट्री)');
  setKey('products.edit_modal.ai_write', 'AI Context Synthesis', 'AI संदर्भ संश्लेषण');
  setKey('products.edit_modal.ai_tags', 'AI Tag Analysis', 'AI टैग विश्लेषण');
  setKey('products.edit_modal.update_image', 'Upload Protocol Matrix', 'अपलोड प्रोटोकॉल मैट्रिक्स');

  setKey('products.alerts.name_required', 'Product label is essential for synthesis.', 'संश्लेषण के लिए उत्पाद लेबल आवश्यक है।');
  setKey('products.alerts.description_gen', 'Context synthesized successfully.', 'संदर्भ सफलतापूर्वक संश्लेषित किया गया।');
  setKey('products.alerts.tags_gen', 'Metadata tags analyzed and indexed.', 'मेटाडेटा टैग का विश्लेषण और अनुक्रमण किया गया।');
  setKey('products.alerts.fill_required', 'Required operational parameters missing.', 'आवश्यक परिचालन पैरामीटर गायब हैं।');
  setKey('products.alerts.select_branch', 'Strategic branch assignment required.', 'रणनीतिक शाखा असाइनमेंट आवश्यक है।');
  setKey('products.alerts.create_success', 'Asset initialized into global registry.', 'संपत्ति वैश्विक रजिस्ट्री में शुरू की गई।');

  // --- Locations / Branches Section (Branches.jsx) ---
  setKey('locations.branches.title', 'Operational Nodes', 'परिचालन नोड्स');
  setKey('locations.branches.subtitle', 'Monitor and manage physical infrastructure entry points.', 'भौतिक बुनियादी ढांचे के प्रवेश बिंदुओं की निगरानी और प्रबंधन करें।');
  setKey('locations.branches.search_placeholder', 'Query node or code...', 'नोड या कोड खोजें...');
  setKey('locations.branches.add_new', 'Add Node', 'नोड जोड़ें');
  setKey('locations.branches.loading', 'Synchronizing nodes...', 'नोड्स सिंक्रनाइज़ हो रहे हैं...');
  setKey('locations.branches.table.details', 'Node Identity', 'नोड पहचान');
  setKey('locations.branches.table.code', 'Protocol Code', 'प्रोटोकॉल कोड');
  setKey('locations.branches.table.phone', 'Direct Link', 'सीधी लिंक');
  setKey('locations.branches.table.status', 'State', 'अवस्था');
  setKey('locations.branches.table.actions', 'Commands', 'कमांड');
  setKey('locations.branches.status.active', 'Stabilized', 'स्थिर');
  setKey('locations.branches.status.inactive', 'Offline', 'ऑफलाइन');
  setKey('locations.branches.view_details', 'Inspect Node', 'नोड का निरीक्षण करें');
  setKey('locations.branches.edit', 'Modify Config', 'कॉन्फ़िगरेशन बदलें');
  setKey('locations.branches.delete', 'Decommission Node', 'नोड को बंद करें');
  setKey('locations.branches.no_branches', 'No operational nodes detected.', 'कोई परिचालन नोड नहीं मिला।');

  // --- Staff Section (AllStaff.jsx) ---
  setKey('staff.errors.fetch_failed', 'Protocol link error (Staff fetch failed)', 'प्रोटोकॉल लिंक त्रुटि (स्टाफ प्राप्त करने में विफल)');
  setKey('staff.alerts.remove_title', 'Decommission Staff Member?', 'स्टाफ सदस्य को हटा दें?');
  setKey('staff.alerts.remove_text', 'Are you sure you want to remove {{name}} from the operational matrix?', 'क्या आप निश्चित रूप से {{name}} को परिचालन मैट्रिक्स से हटाना चाहते हैं?');
  setKey('staff.alerts.removed_title', 'Asset Decommissioned', 'संपत्ति हटाई गई');
  setKey('staff.alerts.removed_text', 'Staff member has been successfully removed.', 'स्टाफ सदस्य को सफलतापूर्वक हटा दिया गया है।');
  setKey('staff.errors.remove_failed', 'Decommissioning protocol failure', 'हटाने का प्रोटोकॉल विफल');
  setKey('staff.alerts.update_success', 'Node identity updated successfully', 'नोड पहचान सफलतापूर्वक अपडेट की गई');
  setKey('staff.errors.update_failed', 'Identity update synchronization failure', 'पहचान अपडेट सिंक्रनाइज़ेशन विफलता');

  // --- Customers Section (AllCustomers.jsx) ---
  setKey('customers.all.errors.fetch_failed', 'Entity stream error (Customer fetch failed)', 'इकाई स्ट्रीम त्रुटि (ग्राहक प्राप्त करने में विफल)');
  setKey('customers.all.errors.fetch_profile', 'Failed to retrieve entity profile', 'इकाई प्रोफ़ाइल प्राप्त करने में विफल');
  setKey('customers.all.alerts.block_success', 'Entity restricted successfully', 'इकाई सफलतापूर्वक प्रतिबंधित');
  setKey('customers.all.alerts.unblock_success', 'Entity restriction lifted', 'इकाई प्रतिबंध हटा दिया गया');
  setKey('customers.all.alerts.sent_success', '{{type}} dispatched successfully', '{{type}} सफलतापूर्वक भेजा गया');
  setKey('customers.all.alerts.delivered_success', '{{type}} delivered to {{name}} junction', '{{type}} {{name}} जंक्शन पर डिलीवर किया गया');
  setKey('customers.all.errors.update_failed', 'Entity state update failure', 'इकाई स्थिति अपडेट विफलता');

  // --- Vendors Section (AllVendors.jsx) ---
  setKey('vendors.loading_failed', 'Partner registry unavailable', 'पार्टनर रजिस्ट्री अनुपलब्ध');
  setKey('vendors.delete_confirm_title', 'Sever Partner Connection?', 'पार्टनर कनेक्शन तोड़ें?');
  setKey('vendors.delete_confirm_text', 'Confirm disconnection of {{name}} from the supply chain.', 'आपूर्ति श्रृंखला से {{name}} के विच्छेद की पुष्टि करें।');

  // --- Vendors Section (AllVendors.jsx) ---
  setKey('vendors.loading_failed', 'Partner registry unavailable', 'पार्टनर रजिस्ट्री अनुपलब्ध');
  setKey('vendors.delete_confirm_title', 'Sever Partner Connection?', 'पार्टनर कनेक्शन तोड़ें?');
  setKey('vendors.delete_confirm_text', 'Confirm disconnection of {{name}} from the supply chain.', 'आपूर्ति श्रृंखला से {{name}} के विच्छेद की पुष्टि करें।');

  // --- Analytics Section ---
  setKey('analytics.revenue.title', 'Revenue Analytics', 'राजस्व विश्लेषण');
  setKey('analytics.revenue.subtitle', 'Track your financial performance and growth metrics.', 'अपने वित्तीय प्रदर्शन और विकास मेट्रिक्स को ट्रैक करें।');
  setKey('analytics.revenue.period.week', 'Current Week', 'वर्तमान सप्ताह');
  setKey('analytics.revenue.period.month', 'Current Month', 'वर्तमान महीना');
  setKey('analytics.revenue.period.last_month', 'Last Month', 'पिछले महीने');
  setKey('analytics.revenue.period.ytd', 'Year to Date', 'वर्ष से आज तक');
  setKey('analytics.revenue.export', 'Export Data', 'डेटा निर्यात करें');
  setKey('analytics.revenue.cards.net_sales', 'Total Net Sales', 'कुल शुद्ध बिक्री');
  setKey('analytics.revenue.cards.refunds', 'Total Refunds', 'कुल रिफंड');
  setKey('analytics.revenue.cards.vendor_payouts', 'Vendor Payouts', 'विक्रेता भुगतान');
  setKey('analytics.revenue.cards.net_profit', 'Net Profit', 'शुद्ध लाभ');
  setKey('analytics.revenue.table.date', 'Date', 'तारीख');
  setKey('analytics.revenue.table.orders', 'Delivered Orders', 'डिलिवर किए गए ऑर्डर');
  setKey('analytics.revenue.table.gross_sales', 'Gross Sales', 'कुल बिक्री');
  setKey('analytics.revenue.table.net_sales', 'Net Sales', 'शुद्ध बिक्री');
  
  setKey('analytics.vendors.title', 'Vendor Earnings', 'विक्रेता की कमाई');
  setKey('analytics.vendors.subtitle', 'Manage vendor payouts, commissions, and settlement history.', 'विक्रेता भुगतान, कमीशन और निपटान इतिहास प्रबंधित करें।');
  setKey('analytics.vendors.stats.paid_out', 'Total Paid Out', 'कुल भुगतान किया गया');
  setKey('analytics.vendors.stats.pending', 'Pending Due', 'लंबित देय');
  setKey('analytics.vendors.stats.commission', 'Commission Earned', 'अर्जित कमीशन');
  setKey('analytics.vendors.table.payout_id', 'Payout ID', 'भुगतान आईडी');
  setKey('analytics.vendors.table.requested_date', 'Requested Date', 'अनुरोध की तिथि');
  setKey('analytics.vendors.table.net_payout', 'Net Payout', 'शुद्ध भुगतान');
  setKey('analytics.vendors.table.vendor', 'Vendor', 'विक्रेता');
  setKey('analytics.vendors.table.method', 'Settlement Path', 'निपटान पथ');
  setKey('analytics.vendors.table.recent_payouts', 'Recent Payout Settlements', 'हाल के भुगतान निपटान');
  setKey('analytics.vendors.filters.all', 'All Vendors', 'सभी विक्रेता');
  setKey('analytics.vendors.filters.pending', 'Pending Payouts', 'लंबित भुगतान');
  setKey('analytics.vendors.filters.completed', 'Completed Payouts', 'पूरे हुए भुगतान');
  setKey('analytics.vendors.export_statement', 'Export Statement', 'विवरण निर्यात करें');

  setKey('analytics.demand.title', 'Demand Analytics & Lost Sales', 'मांग विश्लेषण और खोई हुई बिक्री');
  setKey('analytics.demand.subtitle', "Understand what your users want that you don't have.", "समझें कि आपके उपयोगकर्ता क्या चाहते हैं जो आपके पास नहीं है।");
  setKey('analytics.demand.views.list', 'List View', 'सूची दृश्य');
  setKey('analytics.demand.views.heatmap', 'Heatmap', 'हीटमैप');
  setKey('analytics.demand.stats.active_notify', 'Active Notify Requests', 'सक्रिय सूचना अनुरोध');
  setKey('analytics.demand.stats.area_expansion', 'Area Expansion Requests', 'क्षेत्र विस्तार अनुरोध');
  setKey('analytics.demand.filters.title', 'Filter Insights', 'फिल्टर अंतर्दृष्टि');
  setKey('analytics.demand.filters.all', 'All Demands', 'सभी मांगें');
  setKey('analytics.demand.filters.oos', 'Out of Stock Only', 'केवल आउट ऑफ स्टॉक');
  setKey('analytics.demand.filters.ozz', 'Out of Zone Only', 'केवल आउट ऑफ ज़ोन');
  setKey('analytics.demand.top_products.title', 'Highly Demanded Products', 'अत्यधिक मांग वाले उत्पाद');
  setKey('analytics.demand.top_products.subtitle', 'Top 10 Potential Revenue', 'शीर्ष 10 संभावित राजस्व');
  setKey('analytics.demand.top_products.requests', 'Requests', 'अनुरोध');
  setKey('analytics.demand.distribution.title', 'Demand Distribution', 'मांग वितरण');
  setKey('analytics.demand.map.loading', 'Loading Satellite Maps...', 'सैटेलाइट मैप लोड हो रहे हैं...');
  setKey('analytics.demand.map.keys', 'Map Keys', 'मैप कीज़');
  setKey('analytics.demand.map.oos_label', 'Out of Stock Request', 'आउट ऑफ स्टॉक अनुरोध');
  setKey('analytics.demand.map.ozz_label', 'New Area Demand', 'नया क्षेत्र मांग');
  setKey('analytics.demand.table.title', 'Recent Lost Intent Records', 'हाल के खोए हुए इरादे के रिकॉर्ड');
  setKey('analytics.demand.table.status', 'Status', 'स्थिति');
  setKey('analytics.demand.table.product', 'Product', 'उत्पाद');
  setKey('analytics.demand.table.type', 'Type', 'प्रकार');
  setKey('analytics.demand.table.branch', 'Branch/Store', 'शाखा/स्टोर');
  setKey('analytics.demand.table.address', 'Address', 'पता');
  setKey('analytics.demand.table.date', 'Date', 'दिनांक');
  setKey('analytics.demand.table.oos', 'Out of Stock', 'स्टॉक से बाहर');
  setKey('analytics.demand.table.ozz', 'Out of Zone', 'ज़ोन से बाहर');

  setKey('analytics.pos.title', 'POS Analytics', 'पॉइंट ऑफ सेल विश्लेषण');
  setKey('analytics.pos.terminals', 'Active Terminals', 'सक्रिय टर्मिनल');
  setKey('analytics.pos.txns_today', "Today's Transactions", 'आज के लेनदेन');
  setKey('analytics.pos.best_branch', 'Best Performing Branch', 'सर्वश्रेष्ठ प्रदर्शन करने वाली शाखा');
  setKey('analytics.pos.live_feed', 'Live Transaction Feed', 'लाइव लेनदेन फीड');

  // --- Campaigns & Offers ---
  setKey('campaigns.title', 'Festive Campaigns', 'उत्सव अभियान');
  setKey('campaigns.add_new', 'Create Special Festive Section', 'विशेष उत्सव अनुभाग बनाएं');
  setKey('campaigns.edit', 'Edit Festive Section', 'उत्सव अनुभाग संपादित करें');
  setKey('campaigns.form.ui_customization', 'UI Customization', 'UI अनुकूलन');
  setKey('campaigns.form.display_type', 'Section Display Type', 'अनुभाग प्रदर्शन प्रकार');
  setKey('campaigns.form.festive_type', 'Festive Section', 'उत्सव अनुभाग');
  setKey('campaigns.form.lowest_price_type', 'Lowest Prices', 'सबसे कम कीमतें');
  setKey('campaigns.form.pill_text', 'Highlight Pill Text', 'हाइलाइट पिल टेक्स्ट');
  setKey('campaigns.form.placeholder.title', 'e.g. Valentine\'s Week Special', 'जैसे: वेलेंटाइन वीक स्पेशल');
  setKey('campaigns.form.placeholder.subtitle', 'e.g. Gifts for your loved ones', 'जैसे: आपके प्रियजनों के लिए उपहार');
  setKey('campaigns.form.bg_color', 'Background Color', 'पृष्ठभूमि का रंग');
  setKey('campaigns.form.text_color', 'Text Color', 'टेक्स्ट का रंग');
  setKey('campaigns.form.accent_color', 'Accent Color (Buttons)', 'एक्सेन्ट कलर (बटन)');
  setKey('campaigns.form.visible_front', 'Visible on App Front', 'ऐप फ्रंट पर दृश्यमान');
  setKey('campaigns.table.manage_selection', 'Manage Selection & Deal Pricing', 'चयन और डील मूल्य निर्धारण प्रबंधित करें');
  setKey('campaigns.table.browse_add', 'Browse & Add Products', 'उत्पादों को ब्राउज़ करें और जोड़ें');
  setKey('campaigns.table.browse_help', 'Search, filter by category and pick multiple products at once', 'सर्च करें, श्रेणी के अनुसार फ़िल्टर करें और एक साथ कई उत्पाद चुनें');
  setKey('campaigns.table.product_details', 'Product Details', 'उत्पाद विवरण');
  setKey('campaigns.table.savings', 'Savings', 'बचत');
  setKey('campaigns.form.publish', 'Publish Section', 'अनुभाग प्रकाशित करें');
  setKey('campaigns.form.update', 'Update Campaign Section', 'अभियान अनुभाग अपडेट करें');

  setKey('offers.title', 'Offers & Banners', 'ऑफर और बैनर');
  setKey('offers.add_new', 'Add New Offer', 'नया ऑफर जोड़ें');
  setKey('offers.manage_selection', 'Manage Selection & Deal Pricing', 'चयन और डील मूल्य निर्धारण प्रबंधित करें');

  // --- Promo Codes ---
  setKey('promocodes.title', 'Promo Codes', 'प्रोमो कोड');
  setKey('promocodes.add_new', 'Create New Code', 'नया कोड बनाएं');
  setKey('promocodes.table.code', 'Logistics Code', 'लॉजिस्टिक कोड');
  setKey('promocodes.table.usage', 'Usage Logic', 'उपयोग लॉजिक');
  setKey('promocodes.table.validity', 'Validity Node', 'वैधता नोड');

  // --- Notifications ---
  setKey('notifications.push.title', 'Push Notifications', 'पुश नोटिफिकेशन');
  setKey('notifications.push.send_new', 'Initialize Broadcast', 'प्रसारण शुरू करें');
  setKey('notifications.push.target_audience', 'Strategic Audience', 'रणनीतिक दर्शक');
  setKey('notifications.push.notification_title', 'Signal Title', 'सिग्नल शीर्षक');
  setKey('notifications.push.message_body', 'Protocol Message', 'प्रोटोकॉल संदेश');
  setKey('notifications.push.title_placeholder', 'Enter catchy title...', 'आकर्षक शीर्षक दर्ज करें...');
  setKey('notifications.push.message_placeholder', 'Enter detailed message body...', 'विस्तृत संदेश मुख्य भाग दर्ज करें...');
  setKey('notifications.push.send_btn', 'Dispatch Signal', 'सिग्नल भेजें');
  setKey('notifications.push.sending_msg', 'Sending notification to {{target}}: {{title}}', '{{target}} को नोटिफिकेशन भेजा जा रहा है: {{title}}');
  setKey('notifications.push.message_preview', 'This is how your message will appear on the device.', 'इस तरह आपका संदेश डिवाइस पर दिखाई देगा।');
  setKey('notifications.push.audiences.all', 'All Nodes (Global)', 'सभी नोड्स (ग्लोबल)');
  setKey('notifications.push.audiences.specific', 'Targeted Entity (SID)', 'लक्षित इकाई (SID)');
  setKey('notifications.push.audiences.active_30', 'Active Cycles (30d)', 'सक्रिय चक्र (30 दिन)');
  setKey('notifications.push.audiences.abandoners', 'Incomplete Chains', 'अधूरे चैन');

  setKey('notifications.push.quick_stats', 'Quick Delivery Analysis', 'त्वरित वितरण विश्लेषण');
  setKey('notifications.push.total_sent', 'Total Dispatched', 'कुल भेजे गए');
  setKey('notifications.push.open_rate', 'Interaction Rate', 'इंटरैक्शन दर');
  setKey('notifications.push.failed_delivery', 'Signal Dropouts', 'सिग्नल ड्रॉपआउट');
  setKey('notifications.push.history', 'Broadcast History', 'प्रसारण इतिहास');
  setKey('notifications.push.table.content', 'Signal Content', 'सिग्नल सामग्री');
  setKey('notifications.push.table.audience', 'Target Entity', 'लक्षित इकाई');
  setKey('notifications.push.table.sent_at', 'Dispatch Time', 'भेजने का समय');
  setKey('notifications.push.table.status', 'Protocol State', 'प्रोटोकॉल अवस्था');
  setKey('notifications.push.table.actions', 'CMD', 'CMD');
  setKey('notifications.push.resend', 'Re-Dispatch', 'पुनः भेजें');

  // --- Settings ---
  setKey('settings.app.title', 'Application Control Center', 'एप्लिकेशन कंट्रोल सेंटर');
  setKey('settings.app.general', 'General Configuration', 'सामान्य कॉन्फ़िगरेशन');
  setKey('settings.app.system', 'System Logic Matrix', 'सिस्टम लॉजिक मैट्रिक्स');
  setKey('settings.app.maintenance', 'Maintenance Protocol', 'रखरखाव प्रोटोकॉल');
  setKey('settings.app.maintenance_desc', 'Maintenance Mode (Close Store for public)', 'रखरखाव मोड (जनता के लिए स्टोर बंद करें)');
  setKey('settings.app.save_all', 'Commit All Protocols', 'सभी प्रोटोकॉल प्रतिबद्ध करें');
  setKey('settings.app.name', 'App Name', 'ऐप का नाम');
  setKey('settings.app.slogan', 'Store Slogan', 'स्टोर स्लोगन');
  setKey('settings.app.support_email', 'Support Email', 'सपोर्ट ईमेल');
  setKey('settings.app.contact', 'Contact Number', 'संपर्क नंबर');
  setKey('settings.app.address', 'Physical Address', 'भौतिक पता');
  setKey('settings.app.currency', 'Default Currency', 'डिफ़ॉल्ट मुद्रा');
  setKey('settings.app.timezone', 'Time Zone', 'समय क्षेत्र');
  setKey('settings.app.feature_toggles', 'Feature Toggles', 'फीचर टॉगल');

  // --- Orders Sections (OnlineOrders.jsx, AllOrders.jsx, ReturnRequests.jsx) ---
  setKey('orders.online.title', 'Online Inflow', 'ऑनलाइन प्रवाह');
  setKey('orders.online.subtitle', 'Live stream of digital commerce transactions.', 'डिजिटल वाणिज्य लेनदेन की लाइव स्ट्रीम।');
  setKey('orders.online.stats.total_online', 'Digital Total', 'डिजिटल कुल');
  setKey('orders.online.stats.paid_orders', 'Revenue Locked', 'राजस्व लॉक');
  setKey('orders.online.stats.pending_payment', 'Awaiting Ledger', 'लेज़र की प्रतीक्षा');
  setKey('orders.online.stats.total_revenue', 'Settled Inflow', 'निपटान प्रवाह');
  setKey('orders.online.search_placeholder', 'Query Order ID...', 'ऑर्डर आईडी खोजें...');
  setKey('orders.online.filters.btn', 'Apply Logic', 'लॉजिक लागू करें');
  setKey('orders.online.filters.title', 'Strategic Filters', 'रणनीतिक फिल्टर');
  setKey('orders.online.filters.all_status', 'All States', 'सभी अवस्थाएं');
  setKey('orders.online.filters.all_payment_status', 'Any Ledger State', 'कोई भी लेज़र अवस्था');
  
  // Return Requests
  setKey('orders.returns.title', 'Reclamation Control', 'पुनर्प्राप्ति नियंत्रण');
  setKey('orders.returns.logistics_control', 'STRATEGIC LOGISTICS COMMAND', 'रणनीतिक रसद कमान');
  setKey('orders.returns.active_requests', '{{count}} Active reclaimed cycles', '{{count}} सक्रिय पुनर्प्राप्ति चक्र');
  setKey('orders.returns.search_placeholder', 'Identify ID or Reason...', 'आईडी या कारण पहचानें...');
  setKey('orders.returns.syncing', 'Synchronizing reclamations...', 'पुनर्प्राप्ति सिंक्रनाइज़ हो रही है...');
  setKey('orders.returns.quiet_moment', 'Operational Silence', 'परिचालन मौन');
  setKey('orders.returns.no_returns', 'No reclaimed assets detected.', 'कोई पुनर्प्राप्त संपत्ति नहीं मिली।');
  setKey('orders.returns.table.return_id', 'RECLAMATION ID', 'पुनर्प्राप्ति आईडी');
  setKey('orders.returns.table.source_client', 'SOURCE ENTITY', 'स्रोत इकाई');
  setKey('orders.returns.table.context', 'CONTEXT/REASON', 'संदर्भ/कारण');
  setKey('orders.returns.table.value', 'ASSET VALUE', 'संपत्ति का मूल्य');
  setKey('orders.returns.table.condition', 'PROTOCOL STATE', 'प्रोटोकॉल अवस्था');
  setKey('orders.returns.table.action', 'CMD', 'CMD');
  setKey('orders.returns.tabs.pending', 'Assessment', 'मूल्यांकन');
  setKey('orders.returns.tabs.accepted', 'Staging', 'स्टेजिंग');
  setKey('orders.returns.tabs.scheduled', 'Transit', 'पारगमन');
  setKey('orders.returns.tabs.history', 'Archived', 'संग्रहीत');
  setKey('orders.returns.details.title', 'Reclamation Logic', 'पुनर्प्राप्ति लॉजिक');
  
  // Batch Reorder logic
  setKey('orders.returns.batch.title', 'Dispatch Optimization', 'डिलीवरी अनुकूलन');
  setKey('orders.returns.batch.items_for_pickup', '{{count}} units for return cycle', 'अवापसी चक्र के लिए {{count}} इकाइयां');
  setKey('orders.returns.batch.available_fleet', 'Available Logistics Fleet', 'उपलब्ध रसद बेड़ा');
  setKey('orders.returns.batch.no_riders', 'No logistics units online.', 'कोई रसद इकाई ऑनलाइन नहीं है।');
  setKey('orders.returns.batch.confirm_btn', 'Initialize Pickup Cycle', 'पिकअप चक्र शुरू करें');

  // Final Save
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ [${filename}] Comprehensive Patch Applied`);
});
