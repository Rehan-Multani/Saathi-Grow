'use strict';
const fs = require('fs');
const path = require('path');

const hiPath = path.join(__dirname, 'hi.json');
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// ── 1. dashboard: add missing keys ──────────────────────────────────────────
hi.dashboard.payment_status = {
  paid: 'भुगतान किया गया',
  pending: 'लंबित',
  failed: 'विफल',
  refunded: 'वापस किया गया'
};
hi.dashboard.payment_status_label    = 'भुगतान की स्थिति';
hi.dashboard.amount                  = 'राशि';
hi.dashboard.branch_store            = 'शाखा / स्टोर';
hi.dashboard.branch_store_label      = 'शाखा / स्टोर';
hi.dashboard.update_order_status     = 'ऑर्डर की स्थिति अपडेट करें';
hi.dashboard.select_status_placeholder = 'एक स्थिति चुनें';
hi.dashboard.failed_to_update_status = 'स्थिति अपडेट करने में विफल';
hi.dashboard.delete_order_warning    = 'आप इसे वापस नहीं ले पाएंगे! ऑर्डर ऑब्जेक्ट हटा दिया जाएगा।';
hi.dashboard.yes_delete_it           = 'हाँ, इसे हटा दें!';
hi.dashboard.order_deleted_success   = 'ऑर्डर सफलतापूर्वक हटा दिया गया';
hi.dashboard.failed_to_delete_order  = 'ऑर्डर हटाने में विफल';
hi.dashboard.view_details_label      = 'विवरण देखें';
hi.dashboard.update_status_label     = 'स्थिति अपडेट करें';
hi.dashboard.delete_order_label      = 'ऑर्डर हटाएं';

// ── 2. Remove wrongly-nested support.stock ──────────────────────────────────
if (hi.dashboard && hi.dashboard.support && hi.dashboard.support.stock) {
  delete hi.dashboard.support.stock;
  console.log('Removed hi.dashboard.support.stock');
}

// ── 3. Ensure top-level "orders" section ─────────────────────────────────────
// Pages reference t('orders.online.*'), t('orders.returns.*'), t('orders.pos.*')
// Copy from hi.dashboard.orders if it exists
if (!hi.orders) {
  const src = (hi.dashboard && hi.dashboard.orders) || {};
  hi.orders = {
    returns: src.returns || {
      title: 'वापसी प्रबंधन',
      logistics_control: 'लॉजिस्टिक्स नियंत्रण',
      active_requests: '{{count}} सक्रिय अनुरोध',
      search_placeholder: 'आईडी या ग्राहक द्वारा खोजें...',
      syncing: 'लॉजिस्टिक्स सिंक हो रहा है...',
      no_returns: 'इस फ़िल्टर में कोई वापसी नहीं मिली।',
      quiet_moment: 'शांत समय',
      store_denied: 'स्टोर ने मना किया',
      dispatch_picks: '{{count}} पिक को डिस्पैच करें',
      tabs: { pending: 'पेंडिंग', accepted: 'स्वीकार किया गया', scheduled: 'निर्धारित', history: 'इतिहास' },
      table: { return_id: 'वापसी आईडी', source_client: 'स्रोत और ग्राहक', context: 'संदर्भ', value: 'मूल्य', condition: 'स्थिति', action: 'कार्रवाई' },
      details: { title: 'वापसी का विवरण', visual_evidence: 'दृश्य प्रमाण', line_items: 'आइटम की जानकारी', issue_claimed: 'दावा की गई समस्या', system_notice: 'सिस्टम सूचना: स्टोर ने अस्वीकार किया', approve: 'स्वीकार करें', reject: 'अस्वीकार करें', overrule_yes: 'ओवररूल करें और हाँ', final_deny: 'अंतिम अस्वीकृति', pending_logistics: 'लॉजिस्टिक्स बैचिंग लंबित है', verification_key: 'सत्यापन कुंजी' },
      batch: { title: 'लॉजिस्टिक्स सौंपें', items_for_pickup: 'पिकअप के लिए {{count}} आइटम', available_fleet: 'उपलब्ध राइडर्स', no_riders: 'आस-पास कोई सक्रिय राइडर नहीं है।', confirm_btn: 'डिलीवरी असाइनमेंट की पुष्टि करें', initializing: 'प्रारंभ किया जा रहा है...', select_rider: 'कृपया एक राइडर चुनें', no_selections: 'डिस्पैच के लिए कोई आइटम नहीं चुना गया', session_mismatch: 'सत्र डेटा बेमेल है। कृपया रिफ्रेश करें।' },
      alerts: { load_failed: 'वापसी लोड करने में विफल', update_failed: 'अपडेट विफल', record_success: 'वापसी {{action}} दर्ज की गई', batch_success: 'रिटर्न डिलीवरी रन शुरू किया गया!' },
      swal: { reject_title: 'वापसी अनुरोध अस्वीकार करें', reason_label: 'कारण', reason_required: 'कारण आवश्यक है', approve_title: 'वापसी स्वीकार करें?', approve_text: 'डिस्पैच कतार में ले जाया जा रहा है।', mixed_dest_title: 'मिश्रित गंतव्य', mixed_dest_text: 'आपने विभिन्न शाखाओं/विक्रेताओं के लिए आइटम चुने हैं। क्या आप मिश्रित बैच के साथ जारी रखना चाहते हैं?' },
      pagination: { showing: 'दिखाया जा रहा है', to: 'से', of: 'का', page_of: 'पृष्ठ {{current}} / {{total}}' }
    },
    online: src.online || {
      title: 'ऑनलाइन ऑर्डर',
      subtitle: 'केवल रेजरपे (Razorpay) भुगतान',
      order_count: '{{count}} ऑर्डर',
      stats: { total_online: 'कुल ऑनलाइन ऑर्डर', paid_orders: 'भुगतान किए गए ऑर्डर', pending_payment: 'लंबित भुगतान', total_revenue: 'कुल राजस्व' },
      search_placeholder: 'ऑर्डर आईडी, ग्राहक, फोन खोजें...',
      filters: { title: 'उन्नत फिल्टर', btn: 'फिल्टर', all_status: 'सभी स्थिति', all_payment_status: 'सभी भुगतान स्थिति', from_date: 'आरंभ तिथि', to_date: 'अंतिम तिथि', apply: 'फिल्टर लागू करें' },
      table: { razorpay: 'रेजरपे' },
      empty: { no_orders: 'कोई ऑनलाइन ऑर्डर नहीं मिला', adjust_filters: 'अपने फिल्टर को बदलने का प्रयास करें।', razorpay_msg: 'ग्राहकों द्वारा ऑनलाइन भुगतान करने के बाद रेजरपे ऑर्डर यहां दिखाई देंगे।' },
      alerts: { load_failed: 'ऑनलाइन ऑर्डर लोड नहीं किए जा सके', status_updated: 'स्थिति अपडेट की गई!' }
    },
    pos: src.pos || {
      title: 'पीओएस बिलिंग',
      store_id: 'स्टोर आईडी',
      search_placeholder: 'बारकोड स्कैन करें या उत्पाद खोजें...',
      stock: 'स्टॉक',
      billing: { title: 'वर्तमान बिल', item_count: 'आइटम संख्या', empty_cart: 'कार्ट खाली है' },
      customer: { walk_in: 'वॉक-इन ग्राहक', email_placeholder: 'ग्राहक ईमेल (चालान के लिए)', phone_placeholder: 'ग्राहक फोन (वैकल्पिक)' },
      totals: { subtotal: 'उप-योग', tax: 'कर (Tax)', total: 'कुल', cash_only: 'केवल नकद' },
      buttons: { complete: 'ऑर्डर पूरा करें', complete_sale: 'बिक्री पूरी करें' },
      terminal: { title: 'पीओएस टर्मिनल', print: 'प्रिंट', low_stock: 'कम स्टॉक', cart_preview: 'कार्ट पूर्वावलोकन', reset: 'रीसेट', empty: 'खाली', payable: 'देय राशि' },
      alerts: { cart_empty: 'कार्ट खाली है', no_email_confirm: 'कोई ग्राहक ईमेल नहीं दिया गया। क्या चालान बाद में भेजें?', success_title: 'ऑर्डर पूरा हुआ!', success_msg: 'स्टॉक घटा दिया गया है और ग्राहक को चालान भेज दिया गया है।', load_products_failed: 'उत्पाद लोड करने में विफल', order_failed: 'पीओएस ऑर्डर पूरा करने में विफल', out_of_stock: 'उत्पाद स्टॉक में नहीं है', exceeds_stock: 'उपलब्ध स्टॉक से अधिक नहीं जोड़ा जा सकता', exceeds_stock_toast: 'उपलब्ध स्टॉक से अधिक है', complete_order_confirm: 'ऑर्डर पूरा करें?', complete_order_text: '{{method}} के माध्यम से ₹{{amount}} भुगतान की पुष्टि करें', complete_order_btn: 'हाँ, बिलिंग पूरी करें' }
    }
  };
  console.log('Added top-level orders section');
} else {
  // Patch missing sub-keys in existing orders
  if (!hi.orders.returns) hi.orders.returns = {};
  if (!hi.orders.online) hi.orders.online = {};
  if (!hi.orders.pos) hi.orders.pos = {};
}

// ── 4. Ensure top-level "stock" section ──────────────────────────────────────
// Pages reference t('stock.overview.*'), t('stock.low_stock.*'), etc.
if (!hi.stock) {
  const src = (hi.dashboard && hi.dashboard.stock) || {};
  hi.stock = JSON.parse(JSON.stringify(src));
  // Make sure reports exists at stock.reports too
  console.log('Copied hi.dashboard.stock → hi.stock');
} else {
  console.log('hi.stock already exists');
}

// Add reports under top-level stock if not there
if (hi.stock && !hi.stock.reports) {
  const dsReports = hi.dashboard && hi.dashboard.stock && hi.dashboard.stock.reports;
  if (dsReports) {
    hi.stock.reports = JSON.parse(JSON.stringify(dsReports));
  } else {
    hi.stock.reports = {
      inventory: {
        title: 'इन्वेंट्री रिपोर्ट्स',
        subtitle: 'एकीकृत क्रॉस-स्टोर स्टॉक निगरानी और पुनःपूर्ति एनालिटिक्स।',
        out_of_stock_btn: 'स्टॉक में नहीं ({{count}})',
        low_stock_btn: 'कम स्टॉक ({{count}})',
        export_report: 'रिपोर्ट निर्यात करें',
        exporting: 'निर्यात हो रहा है...',
        table_title: 'वर्तमान स्टॉक स्तर',
        search_placeholder: 'उत्पाद का नाम या SKU द्वारा खोजें...',
        filter: 'फ़िल्टर',
        filter_menu: { title: 'फ़िल्टर रिपोर्ट्स', category_label: 'श्रेणी द्वारा', all_categories: 'सभी श्रेणियां', source_label: 'स्रोत (शाखा/विक्रेता)', all_sources: 'सभी स्रोत (वैश्विक)', branches_group: 'शाखाएं', vendors_group: 'विक्रेता', status_label: 'स्टॉक स्थिति', all_items: 'सभी आइटम', in_stock: 'स्टॉक में', low_stock_only: 'केवल कम स्टॉक', out_of_stock: 'स्टॉक में नहीं', clear_filters: 'सभी फ़िल्टर हटाएँ' },
        statuses: { in_stock: 'स्टॉक में', low_stock: 'कम स्टॉक', out_of_stock: 'स्टॉक में नहीं' },
        table: { product: 'उत्पाद', vendor_source: 'विक्रेता/स्रोत', category: 'श्रेणी', stock_level: 'स्टॉक स्तर', reorder_point: 'रीऑर्डर पॉइंट', status: 'स्थिति', units: 'इकाइयाँ', no_data: 'आपके मानदंडों से मेल खाने वाला कोई इन्वेंट्री डेटा नहीं मिला।' },
        pagination: { showing: 'दिखा रहा है', to: 'से', of: 'का', products: 'उत्पाद' },
        alerts: { export_success: 'इन्वेंट्री रिपोर्ट निर्यात की गई', export_error: 'रिपोर्ट निर्यात करने में विफल' }
      },
      sales: {
        title: 'बिक्री रिपोर्ट्स',
        period: { last_30_days: 'पिछले 30 दिन', this_month: 'इस महीने', last_month: 'पिछले महीने', this_year: 'इस साल' },
        export_csv: 'CSV निर्यात करें', exporting: 'निर्यात हो रहा है...', export_short: 'निर्यात',
        stats: { total_revenue: 'कुल राजस्व', total_orders: 'कुल ऑर्डर', avg_order_value: 'औसत ऑर्डर मूल्य', period_sales: 'अवधि की बिक्री', growth_suffix: 'पिछली अवधि से', standard_avg: 'मानक अवधि औसत', currently_viewing: 'वर्तमान में {{period}} देख रहे हैं' },
        table: { title: 'हाल के लेनदेन', order_id: 'ऑर्डर आईडी', date: 'तारीख', customer: 'ग्राहक', items: 'आइटम', items_count: '{{count}} आइटम', payment: 'भुगतान', status: 'स्थिति', amount: 'राशि', no_transactions: 'चयनित अवधि के लिए कोई लेनदेन नहीं मिला।' },
        pagination: { showing: 'दिखा रहा है', to: 'से', of: 'का', orders: 'ऑर्डर' },
        alerts: { export_success: 'बिक्री रिपोर्ट सफलतापूर्वक निर्यात की गई', export_error: 'बिक्री रिपोर्ट निर्यात करने में विफल', load_error: 'बिक्री रिपोर्ट लोड करने में विफल' }
      },
      vendors: {
        title: 'विक्रेता प्रदर्शन रिपोर्ट्स',
        subtitle: 'इन्वेंट्री और बिक्री मेट्रिक्स के आधार पर अपने विक्रेता भागीदारों का मूल्यांकन करें।',
        export_report: 'रिपोर्ट निर्यात करें', exporting: 'निर्यात हो रहा है...',
        table: { title: 'विक्रेता प्रदर्शन निर्देशिका', search_placeholder: 'विक्रेता स्टोर के नाम से खोजें...', vendor_store: 'विक्रेता स्टोर', contact_details: 'संपर्क विवरण', products: 'उत्पाद', total_sales: 'कुल बिक्री', member_since: 'सदस्यता की तारीख', status: 'स्थिति', actions: 'कार्रवाई', items_count: '{{count}} आइटम', orders_count: '{{count}} ऑर्डर', view_stats: 'आँकड़े देखें', no_data: 'कोई विक्रेता प्रदर्शन डेटा नहीं मिला।' },
        statuses: { active: 'सक्रिय', pending: 'लंबित', inactive: 'निष्क्रिय' },
        performance_modal: { id: 'आईडी', lifetime_sales: 'जीवनकाल की बिक्री', catalog_size: 'कैटलॉग आकार', items: 'आइटम', admin_details: 'प्रशासनिक विवरण', store_owner: 'स्टोर के मालिक', onboarded_on: 'ऑनबोर्ड किया गया', phone_number: 'फोन नंबर', total_orders: 'कुल ऑर्डर', status_msg: 'यह विक्रेता खाता वर्तमान में SaathiGrow नेटवर्क में {{status}} है।', close: 'बंद करें', refresh_stats: 'आँकड़े ताज़ा करें' },
        pagination: { showing: 'दिखा रहा है', to: 'से', of: 'का', vendors: 'विक्रेता' },
        alerts: { fetch_error: 'विक्रेता रिपोर्ट प्राप्त करने में विफल', export_success: 'विक्रेता रिपोर्ट सफलतापूर्वक निर्यात की गई', export_error: 'रिपोर्ट निर्यात करने में विफल' }
      }
    };
    console.log('Added hi.stock.reports');
  }
}

// ── 5. Add FAQs payment category that hi.json has but en.json modal.categories doesn't ──
// en.json faqs.modal.categories has "statuses" nested inside "categories" - fix
if (hi.dashboard && hi.dashboard.support && hi.dashboard.support.faqs) {
  const faqs = hi.dashboard.support.faqs;
  if (faqs.modal && faqs.modal.statuses && !faqs.modal.categories.statuses) {
    // statuses is correctly at modal.statuses level in hi.json, that's fine
  }
}

// ── 6. Fix staff.loading_failed missing from hi.json ──────────────────────────
if (hi.dashboard && hi.dashboard.staff && !hi.dashboard.staff.loading_failed) {
  hi.dashboard.staff.loading_failed = 'स्टाफ सूची लोड करने में विफल';
}

// ── 7. Fix dashboard.orders.returns.batch missing sub-keys ────────────────────
if (hi.dashboard && hi.dashboard.orders && hi.dashboard.orders.returns && hi.dashboard.orders.returns.batch) {
  const b = hi.dashboard.orders.returns.batch;
  if (!b.select_rider) b.select_rider = 'कृपया एक राइडर चुनें';
  if (!b.no_selections) b.no_selections = 'डिस्पैच के लिए कोई आइटम नहीं चुना गया';
  if (!b.session_mismatch) b.session_mismatch = 'सत्र डेटा बेमेल है। कृपया रिफ्रेश करें।';
}

// ── Save ──────────────────────────────────────────────────────────────────────
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
console.log('✅ hi.json saved successfully!');
console.log('Top-level keys:', Object.keys(hi).join(', '));
