'use strict';
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// ── 1. Fix dashboard.payment_status: string → object ─────────────────────────
// Components call t('dashboard.payment_status.paid'), t('dashboard.payment_status.pending') etc.
// But en.json has it as the plain string "Payment Status"
if (typeof en.dashboard.payment_status === 'string') {
  en.dashboard.payment_status_label = en.dashboard.payment_status; // keep label
  en.dashboard.payment_status = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded'
  };
  console.log('Fixed en.dashboard.payment_status string → object');
}

// ── 2. Add missing dashboard keys ─────────────────────────────────────────────
if (!en.dashboard.amount) {
  en.dashboard.amount = 'Amount';
  console.log('Added en.dashboard.amount');
}
if (!en.dashboard.branch_store) {
  en.dashboard.branch_store = 'Branch / Store';
}
if (!en.dashboard.branch_store_label) {
  en.dashboard.branch_store_label = 'Branch / Store';
}

// ── 3. Ensure top-level "orders" exists (matching hi.json structure) ─────────
if (!en.orders) {
  // Copy from dashboard.orders
  en.orders = JSON.parse(JSON.stringify(en.dashboard.orders || {}));
  console.log('Copied en.dashboard.orders → en.orders');
} else {
  console.log('en.orders already exists');
}

// ── 4. Ensure top-level "stock" exists (matching hi.json structure) ──────────
if (!en.stock) {
  en.stock = JSON.parse(JSON.stringify(en.dashboard.stock || {}));
  console.log('Copied en.dashboard.stock → en.stock');
} else {
  console.log('en.stock already exists');
}

// ── 5. Ensure stock.reports exists under top-level stock ─────────────────────
if (en.stock && !en.stock.reports) {
  const dsReports = en.dashboard && en.dashboard.stock && en.dashboard.stock.reports;
  if (dsReports) {
    en.stock.reports = JSON.parse(JSON.stringify(dsReports));
    console.log('Copied en.dashboard.stock.reports → en.stock.reports');
  }
}

// ── 6. Fix orders.returns.batch missing sub-keys ─────────────────────────────
if (en.orders && en.orders.returns && en.orders.returns.batch) {
  const b = en.orders.returns.batch;
  if (!b.select_rider) b.select_rider = 'Please select a rider';
  if (!b.no_selections) b.no_selections = 'No items selected for dispatch';
  if (!b.session_mismatch) b.session_mismatch = 'Session data mismatch. Please refresh.';
}

// Same for dashboard.orders.returns.batch
if (en.dashboard && en.dashboard.orders && en.dashboard.orders.returns && en.dashboard.orders.returns.batch) {
  const b = en.dashboard.orders.returns.batch;
  if (!b.select_rider) b.select_rider = 'Please select a rider';
  if (!b.no_selections) b.no_selections = 'No items selected for dispatch';
  if (!b.session_mismatch) b.session_mismatch = 'Session data mismatch. Please refresh.';
}

// ── 7. Fix FAQs modal.categories.statuses → modal.statuses (structural check) ─
// en.json has statuses nested inside categories object - keep as is per en.json structure
// But hi.json has statuses adjacent to categories - need to align both
// Checking en.json structure: dashboard.support.faqs.modal.categories.statuses
if (en.dashboard && en.dashboard.support && en.dashboard.support.faqs) {
  const faqModal = en.dashboard.support.faqs.modal;
  if (faqModal && faqModal.categories && faqModal.categories.statuses) {
    // Move statuses up to faqModal.statuses level so both files match
    if (!faqModal.statuses) {
      faqModal.statuses = faqModal.categories.statuses;
      delete faqModal.categories.statuses;
      console.log('Moved en.dashboard.support.faqs.modal.categories.statuses → modal.statuses');
    }
  }
}

// ── 8. Add payment category to en.json FAQs modal ─────────────────────────────
if (en.dashboard && en.dashboard.support && en.dashboard.support.faqs && en.dashboard.support.faqs.modal) {
  const cats = en.dashboard.support.faqs.modal.categories;
  if (cats && !cats.payment) {
    cats.payment = 'Payment';
    console.log('Added payment category to en FAQs');
  }
}

// ── Save ──────────────────────────────────────────────────────────────────────
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('✅ en.json saved successfully!');
console.log('Top-level keys:', Object.keys(en).join(', '));

// ── Validation check ──────────────────────────────────────────────────────────
const checkKeys = [
  'dashboard.payment_status.paid',
  'dashboard.payment_status.pending',
  'dashboard.payment_status.failed',
  'dashboard.payment_status.refunded',
  'dashboard.amount',
  'orders.online.title',
  'orders.online.stats.total_online',
  'orders.returns.title',
  'orders.pos.title',
  'stock.overview.title',
  'stock.low_stock.title',
  'stock.branch_stock.title',
  'stock.adjustments.title',
  'stock.requests.title',
];

console.log('\nKey validation:');
checkKeys.forEach(key => {
  const val = key.split('.').reduce((o, k) => o && o[k], en);
  console.log(`  ${val ? '✓' : '✗'} ${key}: ${val || 'MISSING'}`);
});
