/**
 * Fix Translation Files Script
 * Run: node fix_translations.js
 * 
 * Issues found:
 * 1. hi.json has wrong structure: lines after "support.faqs" are nested under "support.stock"
 *    but should be at "dashboard.stock.reports" and top-level "orders"/"stock"
 * 2. hi.json is missing several keys present in en.json:
 *    - dashboard.payment_status (as object with paid/pending/failed/refunded)
 *    - dashboard.amount
 *    - dashboard.branch_store, dashboard.branch_store_label
 *    - dashboard.status_updated_success
 *    - dashboard.delete_order_warning, dashboard.yes_delete_it
 *    - dashboard.failed_to_delete_order, dashboard.order_deleted_success
 *    - dashboard.failed_to_update_status
 * 3. Both files have duplicate top-level sections (orders.* and stock.*) mirroring dashboard.orders.* and dashboard.stock.*
 *    This is by design (components use orders.* directly), so hi.json needs them too.
 * 4. hi.json support section has misplaced/extra stock/reports content
 */

const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'en.json');
const hiPath = path.join(__dirname, 'hi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
let hi = JSON.parse(fs.readFileSync(hiPath, 'utf-8'));

// Helper to deeply set a value in object
function deepSet(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

// Helper to deeply get a value from object
function deepGet(obj, keyPath) {
  return keyPath.split('.').reduce((cur, k) => cur && cur[k], obj);
}

// -------------------------------------------------------
// FIX 1: Add missing keys to hi.json dashboard section
// -------------------------------------------------------

// dashboard.payment_status object (used as dashboard.payment_status.paid etc.)
hi.dashboard.payment_status = {
  paid: "भुगतान किया गया",
  pending: "लंबित",
  failed: "विफल",
  refunded: "वापस किया गया (Refunded)"
};

// dashboard.amount (used in OnlineOrders table header)
hi.dashboard.amount = "राशि";

// dashboard.branch_store and branch_store_label
hi.dashboard.branch_store = "शाखा / स्टोर";
hi.dashboard.branch_store_label = "शाखा / स्टोर";

// dashboard.status_updated_success (used in AllOrders)
hi.dashboard.status_updated_success = "स्थिति सफलतापूर्वक अपडेट की गई";

// dashboard.delete_order_warning, yes_delete_it, order_deleted_success, failed_to_delete_order
hi.dashboard.delete_order_warning = "आप इसे वापस नहीं ले पाएंगे! सभी संबंधित लेनदेन बने रहेंगे लेकिन ऑर्डर ऑब्जेक्ट हटा दिया जाएगा।";
hi.dashboard.yes_delete_it = "हाँ, इसे हटा दें!";
hi.dashboard.order_deleted_success = "ऑर्डर सफलतापूर्वक हटा दिया गया";
hi.dashboard.failed_to_delete_order = "ऑर्डर हटाने में विफल";
hi.dashboard.failed_to_update_status = "स्थिति अपडेट करने में विफल";
hi.dashboard.update_order_status = "ऑर्डर की स्थिति अपडेट करें";
hi.dashboard.select_status_placeholder = "एक स्थिति चुनें";

// dashboard.view_details_label, update_status_label, delete_order_label
if (!hi.dashboard.view_details_label) hi.dashboard.view_details_label = "विवरण देखें";
if (!hi.dashboard.update_status_label) hi.dashboard.update_status_label = "स्थिति अपडेट करें";
if (!hi.dashboard.delete_order_label) hi.dashboard.delete_order_label = "ऑर्डर हटाएं";

// -------------------------------------------------------
// FIX 2: Remove wrongly nested support.stock section in hi.json
// Remove reports from support (support should only have tickets and faqs)
// -------------------------------------------------------
if (hi.dashboard && hi.dashboard.support && hi.dashboard.support.stock) {
  delete hi.dashboard.support.stock;
  console.log('Removed wrongly nested hi.dashboard.support.stock');
}

// Also fix top-level support if it exists
if (hi.support && hi.support.stock) {
  delete hi.support.stock;
  console.log('Removed wrongly nested hi.support.stock');
}

// -------------------------------------------------------
// FIX 3: Ensure top-level "orders" section exists in hi.json
// (Pages use t('orders.online.title') etc., not t('dashboard.orders.online.title'))
// -------------------------------------------------------
if (!hi.orders) {
  hi.orders = {
    returns: {
      title: "वापसी प्रबंधन",
      logistics_control: "लॉजिस्टिक्स नियंत्रण",
      active_requests: "{{count}} सक्रिय अनुरोध",
      search_placeholder: "आईडी या ग्राहक द्वारा खोजें...",
      syncing: "लॉजिस्टिक्स सिंक हो रहा है...",
      no_returns: "इस फ़िल्टर में कोई वापसी नहीं मिली।",
      quiet_moment: "शांत समय",
      store_denied: "स्टोर ने मना किया",
      dispatch_picks: "{{count}} पिक को डिस्पैच करें",
      tabs: {
        pending: "पेंडिंग",
        accepted: "स्वीकार किया गया",
        scheduled: "निर्धारित",
        history: "इतिहास"
      },
      table: {
        return_id: "वापसी आईडी",
        source_client: "स्रोत और ग्राहक",
        context: "संदर्भ",
        value: "मूल्य",
        condition: "स्थिति",
        action: "कार्रवाई"
      },
      details: {
        title: "वापसी का विवरण",
        visual_evidence: "दृश्य प्रमाण",
        line_items: "आइटम की जानकारी",
        issue_claimed: "दावा की गई समस्या",
        system_notice: "सिस्टम सूचना: स्टोर ने अस्वीकार किया",
        approve: "स्वीकार करें",
        reject: "अस्वीकार करें",
        overrule_yes: "ओवररूल करें और हाँ",
        final_deny: "अंतिम अस्वीकृति",
        pending_logistics: "लॉजिस्टिक्स बैचिंग लंबित है",
        verification_key: "सत्यापन कुंजी"
      },
      batch: {
        title: "लॉजिस्टिक्स सौंपें",
        items_for_pickup: "पिकअप के लिए {{count}} आइटम",
        available_fleet: "उपलब्ध राइडर्स",
        no_riders: "आस-पास कोई सक्रिय राइडर नहीं है।",
        confirm_btn: "डिलीवरी असाइनमेंट की पुष्टि करें",
        initializing: "प्रारंभ किया जा रहा है...",
        select_rider: "कृपया एक राइडर चुनें",
        no_selections: "डिस्पैच के लिए कोई आइटम नहीं चुना गया",
        session_mismatch: "सत्र डेटा बेमेल है। कृपया रिफ्रेश करें।"
      },
      alerts: {
        load_failed: "वापसी लोड करने में विफल",
        update_failed: "अपडेट विफल",
        record_success: "वापसी {{action}} दर्ज की गई",
        batch_success: "रिटर्न डिलीवरी रन शुरू किया गया!"
      },
      swal: {
        reject_title: "वापसी अनुरोध अस्वीकार करें",
        reason_label: "कारण",
        reason_required: "कारण आवश्यक है",
        approve_title: "वापसी स्वीकार करें?",
        approve_text: "डिस्पैच कतार में ले जाया जा रहा है।",
        mixed_dest_title: "मिश्रित गंतव्य",
        mixed_dest_text: "आपने विभिन्न शाखाओं/विक्रेताओं के लिए आइटम चुने हैं। क्या आप मिश्रित बैच के साथ जारी रखना चाहते हैं?"
      },
      pagination: {
        showing: "दिखाया जा रहा है",
        to: "से",
        of: "का",
        page_of: "पृष्ठ {{current}} / {{total}}"
      }
    },
    online: {
      title: "ऑनलाइन ऑर्डर",
      subtitle: "केवल रेजरपे (Razorpay) भुगतान",
      order_count: "{{count}} ऑर्डर",
      stats: {
        total_online: "कुल ऑनलाइन ऑर्डर",
        paid_orders: "भुगतान किए गए ऑर्डर",
        pending_payment: "लंबित भुगतान",
        total_revenue: "कुल राजस्व"
      },
      search_placeholder: "ऑर्डर आईडी, ग्राहक, फोन खोजें...",
      filters: {
        title: "उन्नत फिल्टर",
        btn: "फिल्टर",
        all_status: "सभी स्थिति",
        all_payment_status: "सभी भुगतान स्थिति",
        from_date: "आरंभ तिथि",
        to_date: "अंतिम तिथि",
        apply: "फिल्टर लागू करें"
      },
      table: {
        razorpay: "रेजरपे"
      },
      empty: {
        no_orders: "कोई ऑनलाइन ऑर्डर नहीं मिला",
        adjust_filters: "अपने फिल्टर को बदलने का प्रयास करें।",
        razorpay_msg: "ग्राहकों द्वारा ऑनलाइन भुगतान करने के बाद रेजरपे ऑर्डर यहां दिखाई देंगे।"
      },
      alerts: {
        load_failed: "ऑनलाइन ऑर्डर लोड नहीं किए जा सके",
        status_updated: "स्थिति अपडेट की गई!"
      }
    },
    pos: {
      title: "पीओएस बिलिंग",
      store_id: "स्टोर आईडी",
      search_placeholder: "बारकोड स्कैन करें या उत्पाद खोजें...",
      stock: "स्टॉक",
      billing: {
        title: "वर्तमान बिल",
        item_count: "आइटम संख्या",
        empty_cart: "कार्ट खाली है"
      },
      customer: {
        walk_in: "वॉक-इन ग्राहक",
        email_placeholder: "ग्राहक ईमेल (चालान के लिए)",
        phone_placeholder: "ग्राहक फोन (वैकल्पिक)"
      },
      totals: {
        subtotal: "उप-योग",
        tax: "कर (Tax)",
        total: "कुल",
        cash_only: "केवल नकद (CASH ONLY)"
      },
      buttons: {
        complete: "ऑर्डर पूरा करें",
        complete_sale: "बिक्री पूरी करें"
      },
      terminal: {
        title: "पीओएस टर्मिनल",
        print: "प्रिंट",
        low_stock: "कम स्टॉक",
        cart_preview: "कार्ट पूर्वावलोकन",
        reset: "रीसेट",
        empty: "खाली",
        payable: "देय राशि"
      },
      alerts: {
        cart_empty: "कार्ट खाली है",
        no_email_confirm: "कोई ग्राहक ईमेल नहीं दिया गया। क्या चालान बाद में भेजें?",
        success_title: "ऑर्डर पूरा हुआ!",
        success_msg: "स्टॉक घटा दिया गया है और ग्राहक को चालान भेज दिया गया है।",
        load_products_failed: "उत्पाद लोड करने में विफल",
        order_failed: "पीओएस ऑर्डर पूरा करने में विफल",
        out_of_stock: "उत्पाद स्टॉक में नहीं है",
        exceeds_stock: "उपलब्ध स्टॉक से अधिक नहीं जोड़ा जा सकता",
        exceeds_stock_toast: "उपलब्ध स्टॉक से अधिक है",
        complete_order_confirm: "ऑर्डर पूरा करें?",
        complete_order_text: "{{method}} के माध्यम से ₹{{amount}} भुगतान की पुष्टि करें",
        complete_order_btn: "हाँ, बिलिंग पूरी करें"
      }
    }
  };
  console.log('Added top-level orders section to hi.json');
} else {
  // Make sure all sub-keys are present
  if (!hi.orders.returns) hi.orders.returns = hi.dashboard && hi.dashboard.orders && hi.dashboard.orders.returns ? hi.dashboard.orders.returns : {};
  if (!hi.orders.online) hi.orders.online = hi.dashboard && hi.dashboard.orders && hi.dashboard.orders.online ? hi.dashboard.orders.online : {};
  if (!hi.orders.pos) hi.orders.pos = hi.dashboard && hi.dashboard.orders && hi.dashboard.orders.pos ? hi.dashboard.orders.pos : {};
}

// -------------------------------------------------------
// FIX 4: Ensure top-level "stock" section exists in hi.json
// (Pages use t('stock.overview.title') etc.)
// -------------------------------------------------------
if (!hi.stock) {
  // Copy from dashboard.stock
  if (hi.dashboard && hi.dashboard.stock) {
    hi.stock = JSON.parse(JSON.stringify(hi.dashboard.stock));
    console.log('Added top-level stock section from dashboard.stock in hi.json');
  } else {
    hi.stock = {
      overview: {
        title: "इन्वेंट्री नियंत्रण केंद्र",
        live_status_all: "सभी स्थानों पर लाइव स्थिति",
        live_status_branch: "आपकी शाखा की लाइव स्थिति",
        global_all_branches: "ग्लोबल (सभी शाखाएं)",
        total_stock_units: "कुल स्टॉक यूनिट्स",
        global_assets: "वैश्विक संपत्ति",
        inventory_worth: "इन्वेंट्री मूल्य",
        market_value: "बाजार मूल्य (MRP)",
        under_threshold: "थ्रेसहोल्ड के नीचे",
        needs_fast_restock: "तेजी से रीस्टॉक की आवश्यकता",
        zero_stock: "शून्य स्टॉक",
        unavailable_items: "अनुपलब्ध आइटम",
        regional_health_heatmap: "क्षेत्रीय इन्वेंट्री स्वास्थ्य हीटमैप",
        total_items: "कुल आइटम",
        low_out_of_stock: "कम/स्टॉक खत्म",
        manage_branch: "शाखा प्रबंधित करें",
        urgent_restock_list: "तत्काल रीस्टॉक कार्रवाई सूची",
        view_all_alerts: "सभी अलर्ट देखें",
        table: { product: "उत्पाद", branch: "शाखा", current: "वर्तमान", status: "स्थिति", action: "कार्रवाई" },
        status: { empty: "खाली", low: "कम" },
        all_systems_clear: "सभी सिस्टम स्पष्ट हैं। कोई गंभीर स्टॉक अलर्ट नहीं!",
        stock_density_category: "श्रेणी के अनुसार स्टॉक घनत्व",
        syncing: "इन्वेंट्री स्ट्रीम को सिंक्रोनाइज़ किया जा रहा है...",
        error_sync: "इन्वेंट्री डेटा सिंक करने में विफल"
      },
      low_stock: {
        title: "लो स्टॉक अलर्ट",
        scanning: "इन्वेंट्री स्कैन हो रही है...",
        critical_shortages: "{{count}} गंभीर कमी",
        high_priority: "गहन प्राथमिकता वाली पुनः आपूर्ति आवश्यक",
        sync_data: "डेटा सिंक करें",
        search_placeholder: "SKU, नाम या शाखा खोजें...",
        severity_all: "सभी गंभीरता स्तर",
        severity_critical: "गंभीर (Critical)",
        severity_warning: "चेतावनी (Warning)",
        infrastructure_global: "इन्फ्रास्ट्रक्चर: ग्लोबल",
        vendor_managed_only: "केवल विक्रेता द्वारा प्रबंधित",
        external_partner: "बाहरी भागीदार",
        branch_store: "शाखा स्टोर",
        units_left: "{{count}} इकाइयाँ शेष",
        threshold: "सीमा (Threshold)",
        vendor_managed: "विक्रेता द्वारा प्रबंधित",
        restock: "स्टॉक भरें (Restock)",
        system_healthy: "सिस्टम स्वस्थ है",
        no_alerts: "इन्वेंट्री के सभी स्तर वर्तमान में गंभीर सीमा से ऊपर हैं।",
        analyzed_records: "{{range}} विश्लेषण किया गया, कुल {{total}} रिकॉर्ड",
        page_of: "पृष्ठ {{current}} का {{total}}",
        restock_success: "स्टॉक रिफिल सफलतापूर्वक दर्ज किया गया",
        loading_failed: "इन्वेंट्री अलर्ट लोड करने में विफल",
        vendor_restriction: "विक्रेता द्वारा प्रबंधित उत्पादों को यहाँ से पुनः स्टॉक नहीं किया जा सकता।",
        table: { item: "आइटम/SKU", deployment: "तैनाती (Deployment)", health: "स्टॉक स्वास्थ्य", severity: "गंभीरता", command: "कमांड" }
      },
      branch_stock: {
        title: "शाखा-वार स्टॉक निगरानी",
        logistics_control: "लॉजिस्टिक्स कंट्रोल",
        active_records: "{{count}} सक्रिय रिकॉर्ड",
        refresh: "ताज़ा करें",
        search_placeholder: "SKU, उत्पाद या शाखा द्वारा खोजें...",
        filters: { status_all: "स्थिति: सभी", in_stock: "स्टॉक में", critically_low: "गंभीर रूप से कम", out_of_stock: "स्टॉक खत्म", branch_global: "शाखा: ग्लोबल व्यू" },
        table: { item: "इन्वेंट्री आइटम", deployment: "तैनाती बिंदु", level: "वर्तमान स्तर", status: "परिचालन स्थिति", command: "कमांड", units: "इकाइयां", alert_at: "अलर्ट @", decrypting: "स्टॉक डेटा लोड हो रहा है..." },
        quiet_moment: "शांत पल",
        no_data: "इस फिल्टर में कोई स्टॉक डेटा नहीं मिला।",
        pagination: { showing: "दिखाया जा रहा है", of: "कुल", page: "पृष्ठ" },
        error_load: "स्टॉक डेटा लोड करने में विफल"
      },
      adjustments: {
        title: "स्टॉक समायोजन इतिहास",
        new_adjustment: "नया समायोजन",
        loading: "लॉग लोड हो रहे हैं...",
        error_load: "ऑडिट ट्रेल लोड करने में विफल",
        unknown_product: "अज्ञात उत्पाद",
        system_user: "सिस्टम",
        no_logs: "कोई स्टॉक समायोजन नहीं मिला।",
        table: { id: "समायोजन आईडी", date: "तिथि", product: "उत्पाद", branch: "शाखा", type: "प्रकार", changed: "बदलाव", quantity: "मात्रा", reason: "कारण", user: "उपयोगकर्ता" },
        types: { addition: "जोड़ना", deduction: "मैन्युअल कटौती", damage: "नुकसान", return: "वापसी", audit: "ऑडिट (सटीक सेट)", adjustment: "सामान्य" },
        pagination: { showing: "दिखाया जा रहा है", to: "से", of: "कुल", adjustments: "समायोजन" }
      },
      add_adjustment: {
        title: "नया स्टॉक समायोजन",
        subtitle: "शाखाओं में स्टॉक स्तर प्रबंधित करें",
        preparing: "समायोजन फॉर्म तैयार किया जा रहा है...",
        step1: "1. उत्पाद चुनें",
        step2: "2. समायोजन विवरण",
        search_placeholder: "नाम या SKU द्वारा उत्पाद खोजें...",
        selected_items: "चयनित आइटम ({{count}})",
        set_common_qty: "सामान्य मात्रा सेट करें:",
        qty_placeholder: "मात्रा",
        target_branch: "लक्ष्य शाखा",
        select_branch: "शाखा चुनें...",
        adjustment_type: "समायोजन प्रकार",
        reason: "कारण",
        select_reason: "कारण चुनें...",
        notes: "नोट्स (वैकल्पिक)",
        notes_placeholder: "आंतरिक संदर्भ...",
        submit_btn: "समायोजन जमा करें ({{count}})",
        processing: "प्रक्रिया जारी है...",
        cancel: "रद्द करें",
        reasons: { arrival: "नया स्टॉक आगमन", damaged: "क्षतिग्रस्त सामान", correction: "इन्वेंट्री सुधार", return: "वापसी", loss: "चोरी/हानि", audit: "ऑडिट", other: "अन्य" },
        table: { product: "उत्पाद", quantity: "मात्रा", remove: "हटाएं" },
        alerts: { validation: "कृपया उत्पाद, शाखा और कारण चुनें", qty_required: "कृपया सभी उत्पादों के लिए मात्रा प्रदान करें", success: "इन्वेंट्री सफलतापूर्वक समायोजित की गई", error: "स्टॉक समायोजित करने में विफल", load_error: "उत्पाद और शाखाएं लोड करने में विफल" }
      },
      requests: {
        title: "शाखा इन्वेंट्री अनुरोध",
        subtitle: "स्टोर प्रबंधकों से स्टॉक समायोजन की समीक्षा और अनुमोदन करें",
        search_placeholder: "उत्पाद या शाखा द्वारा खोजें...",
        refresh: "ताज़ा करें",
        loading: "अनुरोध लोड हो रहे हैं...",
        no_requests: "कोई लंबित स्टॉक अनुरोध नहीं मिला।",
        table: { product: "उत्पाद विवरण", branch: "शाखा और अनुरोधकर्ता", adjustment: "समायोजन", status: "स्थिति", actions: "कार्रवाई", sku: "SKU", by: "द्वारा", reviewed_by: "समीक्षा की गई" },
        alerts: { approve_success: "अनुरोध सफलतापूर्वक स्वीकृत", reject_success: "अनुरोध अस्वीकार कर दिया गया", fetch_error: "इन्वेंट्री अनुरोध प्राप्त करने में विफल", approve_error: "अनुरोध प्रबंधन में त्रुटि", reject_error: "स्टॉक अपडेट अस्वीकार करने में विफल", reject_confirm: "क्या आप वाकई इस अपडेट अनुरोध को अस्वीकार करना चाहते हैं?" }
      }
    };
    console.log('Added top-level stock section to hi.json');
  }
}

// -------------------------------------------------------
// FIX 5: Add missing reports section to hi.json
// (Pages use t('dashboard.reports.inventory.title') or t('stock.reports.inventory.title'))
// Looking at en.json it's nested under dashboard.stock.reports
// -------------------------------------------------------
if (hi.dashboard && hi.dashboard.stock && !hi.dashboard.stock.reports) {
  hi.dashboard.stock.reports = {
    inventory: {
      title: "इन्वेंट्री रिपोर्ट्स",
      subtitle: "एकीकृत क्रॉस-स्टोर स्टॉक निगरानी और पुनःपूर्ति एनालिटिक्स।",
      out_of_stock_btn: "स्टॉक में नहीं ({{count}})",
      low_stock_btn: "कम स्टॉक ({{count}})",
      export_report: "रिपोर्ट निर्यात करें",
      exporting: "निर्यात हो रहा है...",
      table_title: "वर्तमान स्टॉक स्तर",
      search_placeholder: "उत्पाद का नाम या SKU द्वारा खोजें...",
      filter: "फ़िल्टर",
      filter_menu: {
        title: "फ़िल्टर रिपोर्ट्स",
        category_label: "श्रेणी द्वारा",
        all_categories: "सभी श्रेणियां",
        source_label: "स्रोत (शाखा/विक्रेता)",
        all_sources: "सभी स्रोत (वैश्विक)",
        branches_group: "शाखाएं",
        vendors_group: "विक्रेता",
        status_label: "स्टॉक स्थिति",
        all_items: "सभी आइटम",
        in_stock: "स्टॉक में",
        low_stock_only: "केवल कम स्टॉक",
        out_of_stock: "स्टॉक में नहीं",
        clear_filters: "सभी फ़िल्टर हटाएँ"
      },
      statuses: { in_stock: "स्टॉक में", low_stock: "कम स्टॉक", out_of_stock: "स्टॉक में नहीं" },
      table: { product: "उत्पाद", vendor_source: "विक्रेता/स्रोत", category: "श्रेणी", stock_level: "स्टॉक स्तर", reorder_point: "रीऑर्डर पॉइंट", status: "स्थिति", units: "इकाइयाँ", no_data: "आपके मानदंडों से मेल खाने वाला कोई इन्वेंट्री डेटा नहीं मिला।" },
      pagination: { showing: "दिखा रहा है", to: "से", of: "का", products: "उत्पाद" },
      alerts: { export_success: "इन्वेंट्री रिपोर्ट निर्यात की गई", export_error: "रिपोर्ट निर्यात करने में विफल" }
    },
    sales: {
      title: "बिक्री रिपोर्ट्स",
      period: { last_30_days: "पिछले 30 दिन", this_month: "इस महीने", last_month: "पिछले महीने", this_year: "इस साल" },
      export_csv: "CSV निर्यात करें",
      exporting: "निर्यात हो रहा है...",
      export_short: "निर्यात",
      stats: { total_revenue: "कुल राजस्व", total_orders: "कुल ऑर्डर", avg_order_value: "औसत ऑर्डर मूल्य", period_sales: "अवधि की बिक्री", growth_suffix: "पिछली अवधि से", standard_avg: "मानक अवधि औसत", currently_viewing: "वर्तमान में {{period}} देख रहे हैं" },
      table: { title: "हाल के लेनदेन", order_id: "ऑर्डर आईडी", date: "तारीख", customer: "ग्राहक", items: "आइटम", items_count: "{{count}} आइटम", payment: "भुगतान", status: "स्थिति", amount: "राशि", no_transactions: "चयनित अवधि के लिए कोई लेनदेन नहीं मिला।" },
      pagination: { showing: "दिखा रहा है", to: "से", of: "का", orders: "ऑर्डर" },
      alerts: { export_success: "बिक्री रिपोर्ट सफलतापूर्वक निर्यात की गई", export_error: "बिक्री रिपोर्ट निर्यात करने में विफल", load_error: "बिक्री रिपोर्ट लोड करने में विफल" }
    },
    vendors: {
      title: "विक्रेता प्रदर्शन रिपोर्ट्स",
      subtitle: "इन्वेंट्री और बिक्री मेट्रिक्स के आधार पर अपने विक्रेता भागीदारों का मूल्यांकन करें।",
      export_report: "रिपोर्ट निर्यात करें",
      exporting: "निर्यात हो रहा है...",
      table: { title: "विक्रेता प्रदर्शन निर्देशिका", search_placeholder: "विक्रेता स्टोर के नाम से खोजें...", vendor_store: "विक्रेता स्टोर", contact_details: "संपर्क विवरण", products: "उत्पाद", total_sales: "कुल बिक्री", member_since: "सदस्यता की तारीख", status: "स्थिति", actions: "कार्रवाई", items_count: "{{count}} आइटम", orders_count: "{{count}} ऑर्डर", view_stats: "आँकड़े देखें", no_data: "कोई विक्रेता प्रदर्शन डेटा नहीं मिला।" },
      statuses: { active: "सक्रिय", pending: "लंबित", inactive: "निष्क्रिय" },
      performance_modal: { id: "आईडी", lifetime_sales: "जीवनकाल की बिक्री", catalog_size: "कैटलॉग आकार", items: "आइटम", admin_details: "प्रशासनिक विवरण", store_owner: "स्टोर के मालिक", onboarded_on: "ऑनबोर्ड किया गया", phone_number: "फोन नंबर", total_orders: "कुल ऑर्डर", status_msg: "यह विक्रेता खाता वर्तमान में SaathiGrow नेटवर्क में {{status}} है।", close: "बंद करें", refresh_stats: "आँकड़े ताज़ा करें" },
      pagination: { showing: "दिखा रहा है", to: "से", of: "का", vendors: "विक्रेता" },
      alerts: { fetch_error: "विक्रेता रिपोर्ट प्राप्त करने में विफल", export_success: "विक्रेता रिपोर्ट सफलतापूर्वक निर्यात की गई", export_error: "रिपोर्ट निर्यात करने में विफल" }
    }
  };
  console.log('Added hi.dashboard.stock.reports');
}

// Also add top-level stock.reports
if (hi.stock && !hi.stock.reports) {
  hi.stock.reports = hi.dashboard && hi.dashboard.stock && hi.dashboard.stock.reports
    ? JSON.parse(JSON.stringify(hi.dashboard.stock.reports))
    : {};
  console.log('Added hi.stock.reports');
}

// -------------------------------------------------------
// FIX 6: Add missing analytics section to hi.json
// -------------------------------------------------------
if (!hi.analytics) {
  hi.analytics = {
    revenue: {
      title: "राजस्व एनालिटिक्स",
      subtitle: "विस्तृत वित्तीय अंतर्दृष्टि और राजस्व रुझान",
      loading: "एनालिटिक्स डेटा लोड हो रहा है...",
      error: "राजस्व डेटा लोड करने में विफल"
    },
    demand: {
      title: "मांग एनालिटिक्स",
      subtitle: "उत्पाद प्रदर्शन और मांग पैटर्न",
      loading: "मांग डेटा लोड हो रहा है...",
      error: "मांग डेटा लोड करने में विफल"
    },
    vendor_earnings: {
      title: "विक्रेता की कमाई",
      subtitle: "विक्रेता भुगतान और कमाई का विश्लेषण",
      loading: "कमाई डेटा लोड हो रहा है...",
      error: "कमाई डेटा लोड करने में विफल"
    }
  };
  console.log('Added analytics section to hi.json');
}

// -------------------------------------------------------
// FIX 7: Fix en.json - add dashboard.payment_status as object
// (en.json has it as a string "Payment Status" which conflicts with object usage)
// Need to rename the string to dashboard.payment_status_label
// -------------------------------------------------------
// Check en.json
if (typeof en.dashboard.payment_status === 'string') {
  // It's just "Payment Status" string - add the object version
  en.dashboard.payment_status_label = en.dashboard.payment_status;  // keep string as label
  // Add the object
  en.dashboard.payment_status = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded"
  };
  console.log('Fixed en.dashboard.payment_status from string to object, saved old as payment_status_label');
}

// -------------------------------------------------------
// FIX 8: Add dashboard.amount to en.json if missing
// -------------------------------------------------------
if (!en.dashboard.amount) {
  en.dashboard.amount = "Amount";
  console.log('Added en.dashboard.amount');
}

// dashboard.branch_store and branch_store_label
if (!en.dashboard.branch_store) en.dashboard.branch_store = "Branch / Store";
if (!en.dashboard.branch_store_label) en.dashboard.branch_store_label = "Branch / Store";

// -------------------------------------------------------
// Save files
// -------------------------------------------------------
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf-8');
console.log('✅ en.json saved successfully');

fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf-8');
console.log('✅ hi.json saved successfully');

console.log('\nDone! Translation files fixed.');
