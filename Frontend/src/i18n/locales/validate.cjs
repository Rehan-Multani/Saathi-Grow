'use strict';
const fs = require('fs');

const en = JSON.parse(fs.readFileSync('en.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('hi.json', 'utf8'));

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

// All keys that admin pages actually reference (from code analysis)
const keysToCheck = [
  // common
  'common.dashboard', 'common.delete', 'common.save', 'common.cancel', 'common.loading', 'common.actions',
  // sidebar
  'sidebar.all_orders', 'sidebar.pos_history', 'sidebar.online_orders', 'sidebar.return_requests',
  'sidebar.all_products', 'sidebar.add_product', 'sidebar.low_stock_alerts', 'sidebar.vendor_earnings',
  // dashboard core
  'dashboard.monitoring_global_operations', 'dashboard.revenue', 'dashboard.order_flow',
  'dashboard.recent_transactions', 'dashboard.live_order_stream',
  // dashboard orders/filters - used in AllOrders, OnlineOrders
  'dashboard.order_id', 'dashboard.customer', 'dashboard.date', 'dashboard.payment',
  'dashboard.amount', 'dashboard.status', 'dashboard.actions',
  'dashboard.branch_store', 'dashboard.branch_store_label',
  'dashboard.order_status_label', 'dashboard.update_order_status', 'dashboard.select_status_placeholder',
  'dashboard.view_details_label', 'dashboard.update_status_label', 'dashboard.delete_order_label',
  'dashboard.failed_to_update_status', 'dashboard.delete_order_warning',
  'dashboard.yes_delete_it', 'dashboard.order_deleted_success', 'dashboard.failed_to_delete_order',
  'dashboard.loading_orders', 'dashboard.no_matching_orders',
  'dashboard.filters', 'dashboard.advanced_filters', 'dashboard.clear_all', 'dashboard.apply_filters',
  'dashboard.all_status', 'dashboard.payment_method', 'dashboard.all_methods',
  'dashboard.payment_status', 'dashboard.payment_status_label',
  'dashboard.payment_status.paid', 'dashboard.payment_status.pending',
  'dashboard.payment_status.failed', 'dashboard.payment_status.refunded',
  'dashboard.all_payment_status', 'dashboard.start_date', 'dashboard.end_date',
  'dashboard.order_source', 'dashboard.all_sources', 'dashboard.immediate_delivery',
  'dashboard.guest', 'dashboard.global',
  // dashboard.order_status
  'dashboard.order_status.pending', 'dashboard.order_status.confirmed',
  'dashboard.order_status.preparing', 'dashboard.order_status.out_for_delivery',
  'dashboard.order_status.delivered', 'dashboard.order_status.cancelled',
  'dashboard.order_status.return_requested', 'dashboard.order_status.returned',
  'dashboard.order_status.paid', 'dashboard.order_status.failed', 'dashboard.order_status.refunded',
  // dashboard.products
  'dashboard.products.title', 'dashboard.products.search_placeholder', 'dashboard.products.loading',
  'dashboard.products.no_products', 'dashboard.products.table.product',
  // dashboard.categories
  'dashboard.categories.title', 'dashboard.categories.search_placeholder',
  // dashboard.brands
  'dashboard.brands.title', 'dashboard.brands.search_placeholder',
  // dashboard.vendors
  'dashboard.vendors.title', 'dashboard.vendors.search_placeholder',
  // dashboard.customers.all
  'dashboard.customers.all.title', 'dashboard.customers.all.search_placeholder',
  // dashboard.staff
  'dashboard.staff.title', 'dashboard.staff.search_placeholder',
  // dashboard.locations.branches
  'dashboard.locations.branches.title',
  // orders top-level (used by pages directly)
  'orders.online.title', 'orders.online.subtitle', 'orders.online.order_count',
  'orders.online.stats.total_online', 'orders.online.stats.paid_orders',
  'orders.online.stats.pending_payment', 'orders.online.stats.total_revenue',
  'orders.online.search_placeholder',
  'orders.online.filters.title', 'orders.online.filters.btn', 'orders.online.filters.all_status',
  'orders.online.filters.all_payment_status', 'orders.online.filters.from_date',
  'orders.online.filters.to_date', 'orders.online.filters.apply',
  'orders.online.table.razorpay',
  'orders.online.empty.no_orders', 'orders.online.empty.adjust_filters', 'orders.online.empty.razorpay_msg',
  'orders.online.alerts.load_failed', 'orders.online.alerts.status_updated',
  // returns
  'orders.returns.title', 'orders.returns.search_placeholder', 'orders.returns.syncing',
  'orders.returns.tabs.pending', 'orders.returns.tabs.accepted',
  'orders.returns.table.return_id', 'orders.returns.details.title',
  'orders.returns.batch.title', 'orders.returns.batch.select_rider',
  'orders.returns.pagination.showing', 'orders.returns.pagination.of',
  // pos
  'orders.pos.title', 'orders.pos.billing.title', 'orders.pos.terminal.title',
  'orders.pos.alerts.cart_empty', 'orders.pos.alerts.success_title',
  // stock top-level
  'stock.overview.title', 'stock.overview.syncing',
  'stock.low_stock.scanning', 'stock.low_stock.critical_shortages',
  'stock.low_stock.table.item', 'stock.low_stock.restock',
  'stock.branch_stock.title', 'stock.branch_stock.search_placeholder',
  'stock.adjustments.title', 'stock.adjustments.table.id',
  'stock.add_adjustment.title', 'stock.add_adjustment.step1', 'stock.add_adjustment.step2',
  'stock.requests.title', 'stock.requests.table.product',
  'stock.reports.inventory.title', 'stock.reports.sales.title', 'stock.reports.vendors.title',
  // delivery
  'dashboard.delivery.partners.title', 'dashboard.delivery.assign_deliveries.title',
  'dashboard.delivery.tracking.title', 'dashboard.delivery.slots.title',
  // notifications
  'dashboard.notifications.push.title',
  // support
  'dashboard.support.tickets.title', 'dashboard.support.faqs.title',
  // staff add_new
  'dashboard.staff.add_new.title',
];

let missingEn = 0, missingHi = 0;
const enMissing = [], hiMissing = [];

keysToCheck.forEach(key => {
  const enVal = get(en, key);
  const hiVal = get(hi, key);
  if (!enVal) { enMissing.push(key); missingEn++; }
  if (!hiVal) { hiMissing.push(key); missingHi++; }
});

console.log(`\n=== VALIDATION RESULTS ===`);
console.log(`en.json missing: ${missingEn}`);
enMissing.forEach(k => console.log(`  ✗ EN: ${k}`));
console.log(`\nhi.json missing: ${missingHi}`);
hiMissing.forEach(k => console.log(`  ✗ HI: ${k}`));
console.log(`\nTotal keys checked: ${keysToCheck.length}`);
console.log(`en.json OK: ${keysToCheck.length - missingEn}/${keysToCheck.length}`);
console.log(`hi.json OK: ${keysToCheck.length - missingHi}/${keysToCheck.length}`);
