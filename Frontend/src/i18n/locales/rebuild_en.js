const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'en.json');
const lines = fs.readFileSync(enPath, 'utf8').split('\n');
const part1 = lines.slice(0, 1025).join('\n');

const part2 = \`      }
    }
  },
  "support": {
    "tickets": {
      "title": "Ticket Intake Center",
      "search_placeholder": "Search by ID or User...",
      "refresh": "Refresh",
      "loading": "Loading tickets...",
      "table": {
        "ticket_id": "TICKET ID",
        "order_id": "ORDER ID",
        "user": "USER",
        "category": "ISSUE CATEGORY",
        "priority": "PRIORITY",
        "status": "STATUS",
        "actions": "ACTIONS"
      },
      "status": {
        "open": "OPEN",
        "escalated": "ESCALATED",
        "responded": "RESPONDED",
        "resolved": "RESOLVED",
        "closed": "CLOSED",
        "sla_breach": "SLA BREACH"
      },
      "modal": {
        "title": "Ticket Details: {{id}}",
        "context_label": "Complaint Context",
        "order_user_info": "Order & User",
        "order_id": "Order #{{id}}",
        "amount": "Amount",
        "resolution_progress": "Resolution Progress",
        "store_recommendation_msg": "Store has recommended a refund for this ticket",
        "admin_notes_label": "Internal Admin Notes",
        "admin_notes_placeholder": "Add notes for the store or internal records...",
        "escalate_btn": "Escalate to Store",
        "resolution_action": "Resolution Action",
        "process_refund": "Process Wallet Refund",
        "refund_close_btn": "Refund & Close",
        "close_btn": "Close Ticket",
        "keep_pending": "Keep Pending",
        "alerts": {
          "close_success": "Ticket closed successfully",
          "refund_success": "Ticket closed & Refund processed",
          "action_failed": "Action failed"
        }
      }
    },
    "faqs": {
      "title": "Help Center / FAQs",
      "subtitle": "Common questions and platform mechanics.",
      "search_placeholder": "Search Questions...",
      "add_new": "Add New FAQ",
      "delete_confirm_title": "Delete FAQ",
      "delete_confirm_text": "Are you sure you want to delete this FAQ? It will be removed from the help center.",
      "no_matching": "No matching mechanics found.",
      "try_different": "Try a different search term or category.",
      "edit": "Edit",
      "delete": "Delete",
      "modal": {
        "title_add": "Add New FAQ",
        "title_edit": "Edit FAQ",
        "question_label": "Question",
        "question_placeholder": "Enter the question",
        "answer_label": "Answer",
        "answer_placeholder": "Enter the answer",
        "category_label": "Category",
        "status_label": "Status",
        "save_btn": "Save FAQ",
        "update_btn": "Update FAQ",
        "cancel": "Cancel",
        "categories": {
          "general": "General",
          "orders": "Orders",
          "shipping": "Shipping",
          "account": "Account",
          "statuses": {
            "published": "Published",
            "draft": "Draft"
          }
        }
      }
    }
  },
  "orders": {
    "returns": {
      "title": "Return Management",
      "logistics_control": "Logistics Control",
      "active_requests": "{{count}} Active Requests",
      "search_placeholder": "Find by ID or Customer...",
      "syncing": "Syncing Logistics...",
      "no_returns": "No returns found in this filter.",
      "quiet_moment": "Quiet Moment",
      "store_denied": "Store Denied",
      "dispatch_picks": "Dispatch {{count}} Picks",
      "tabs": {
        "pending": "Pending",
        "accepted": "Accepted",
        "scheduled": "Scheduled",
        "history": "History"
      },
      "table": {
        "return_id": "Return ID",
        "source_client": "Source & Client",
        "context": "Context",
        "value": "Value",
        "condition": "Condition",
        "action": "Action"
      },
      "details": {
        "title": "Return Details",
        "visual_evidence": "Visual Evidence",
        "line_items": "Line Items",
        "issue_claimed": "Issue Claimed",
        "system_notice": "System Notice: Store Rejection",
        "approve": "Approve",
        "reject": "Reject",
        "overrule_yes": "Overrule & Yes",
        "final_deny": "Final Deny",
        "pending_logistics": "Pending Logistics Batching",
        "verification_key": "Verification Key"
      },
      "batch": {
        "title": "Assign Logistics",
        "items_for_pickup": "{{count}} Items for Pickup",
        "available_fleet": "Available Fleet",
        "no_riders": "No active riders in vicinity.",
        "confirm_btn": "Confirm Delivery Assignment",
        "initializing": "Initializing...",
        "select_rider": "Please select a rider",
        "no_selections": "No items selected for dispatch",
        "session_mismatch": "Session data mismatch. Please refresh."
      },
      "alerts": {
        "load_failed": "Failed to load returns",
        "update_failed": "Update failed",
        "record_success": "Return {{action}} recorded",
        "batch_success": "Return delivery run initialized!"
      },
      "swal": {
        "reject_title": "Reject Return Request",
        "reason_label": "Reason",
        "reason_required": "Reason required",
        "approve_title": "Approve Return?",
        "approve_text": "Moving to dispatch queue.",
        "mixed_dest_title": "Mixed Destinations",
        "mixed_dest_text": "You have selected items bound for different branches/vendors. Do you want to continue with a mixed batch?"
      },
      "pagination": {
        "showing": "Showing",
        "to": "to",
        "of": "of",
        "page_of": "Page {{current}} / {{total}}"
      }
    },
    "online": {
      "title": "Online Orders",
      "subtitle": "Razorpay Payments Only",
      "order_count": "{{count}} orders",
      "stats": {
        "total_online": "Total Online Orders",
        "paid_orders": "Paid Orders",
        "pending_payment": "Pending Payment",
        "total_revenue": "Total Revenue"
      },
      "search_placeholder": "Search Order ID, Customer, Phone...",
      "filters": {
        "title": "Advanced Filters",
        "btn": "Filters",
        "all_status": "All Status",
        "all_payment_status": "All Payment Status",
        "from_date": "From Date",
        "to_date": "To Date",
        "apply": "Apply Filters"
      },
      "table": {
        "razorpay": "Razorpay"
      },
      "empty": {
        "no_orders": "No online orders found",
        "adjust_filters": "Try adjusting your filters.",
        "razorpay_msg": "Razorpay orders will appear here once customers pay online."
      },
      "alerts": {
        "load_failed": "Could not load online orders",
        "status_updated": "Status updated!"
      }
    },
    "pos": {
      "title": "POS BILLING",
      "store_id": "Store ID",
      "search_placeholder": "Scan Barcode or Search Product...",
      "stock": "Stock",
      "billing": {
        "title": "Current Bill",
        "item_count": "ITEM COUNT",
        "empty_cart": "Cart is empty"
      },
      "customer": {
        "walk_in": "Walk-in Customer",
        "email_placeholder": "Customer Email (for Invoice)",
        "phone_placeholder": "Customer Phone (optional)"
      },
      "totals": {
        "subtotal": "Subtotal",
        "tax": "Tax",
        "total": "Total",
        "cash_only": "CASH ONLY"
      },
      "buttons": {
        "complete": "Complete Order",
        "complete_sale": "Complete Sale"
      },
      "terminal": {
        "title": "POS TERMINAL",
        "print": "Print",
        "low_stock": "Low Stock",
        "cart_preview": "Cart Preview",
        "reset": "Reset",
        "empty": "Empty",
        "payable": "Payable"
      },
      "alerts": {
        "cart_empty": "Cart is empty",
        "no_email_confirm": "No customer email provided. Send invoice later?",
        "success_title": "Order Completed!",
        "success_msg": "Stock deducted and invoice sent to customer.",
        "load_products_failed": "Failed to load products",
        "order_failed": "Failed to complete POS order",
        "out_of_stock": "Product out of stock",
        "exceeds_stock": "Cannot add more than available stock",
        "exceeds_stock_toast": "Exceeds available stock",
        "complete_order_confirm": "Complete Order?",
        "complete_order_text": "Confirming ₹{{amount}} payment via {{method}}",
        "complete_order_btn": "Yes, Complete Billing"
      }
    }
  },
  "stock": {
    "overview": {
      "title": "Inventory Control Center",
      "live_status_all": "Unified Global Inventory Status",
      "live_status_branch": "Real-time Branch Health",
      "global_all_branches": "All Global Nodes",
      "total_stock_units": "Total Stock Units",
      "global_assets": "Global Physical Assets",
      "inventory_worth": "Current Inventory Value",
      "market_value": "Total Market Valuation",
      "under_threshold": "Below Warning Threshold",
      "needs_fast_restock": "High priority restock required",
      "zero_stock": "Zero Availability Items",
      "unavailable_items": "Stock currently depleted",
      "regional_health_heatmap": "Regional Node Health Matrix",
      "total_items": "Total Items",
      "low_out_of_stock": "Low / Depleted",
      "manage_branch": "Manage Node",
      "urgent_restock_list": "Priority Replenishment Queue",
      "view_all_alerts": "Expand Alerts",
      "table": {
        "product": "Product ID",
        "branch": "Source Branch",
        "current": "Level",
        "status": "Health",
        "action": "Cmd"
      },
      "status": {
        "empty": "DEPLETED",
        "low": "CRITICAL"
      },
      "all_systems_clear": "All inventory levels optimized",
      "stock_density_category": "Inventory Density by Classification",
      "syncing": "Synchronizing Global Logic...",
      "error_sync": "Failed to sync inventory state"
    },
    "low_stock": {
      "scanning": "Scanning Grid...",
      "critical_shortages": "{{count}} Critical Shortages Detected",
      "high_priority": "High Priority Intervention Required",
      "sync_data": "Re-sync Grid",
      "search_placeholder": "Filter by item or SKU...",
      "severity_all": "Any Level",
      "severity_critical": "Level: Critical",
      "severity_warning": "Level: Warning",
      "infrastructure_global": "Unified Infrastructure",
      "vendor_managed_only": "Third Party Assets Only",
      "table": {
        "item": "Product / SKU",
        "deployment": "Asset Location",
        "health": "Inventory Health",
        "severity": "Threat Level",
        "command": "Action"
      },
      "external_partner": "Partner Managed",
      "branch_store": "Core Node",
      "units_left": "{{count}} Units Remained",
      "threshold": "Limit",
      "vendor_managed": "Partner Control Only",
      "restock": "Initialize Restock",
      "system_healthy": "Infrastructure Optimal",
      "no_alerts": "No inventory threats detected at this time",
      "analyzed_records": "Analyzed records {{range}} of {{total}}",
      "page_of": "Logic Page {{current}} / {{total}}",
      "restock_success": "Restock sequence initialized successfully",
      "loading_failed": "Failed to load inventory alerts",
      "vendor_restriction": "Cannot reorder third-party managed assets directly"
    },
    "branch_stock": {
      "title": "Branch Inventory Matrix",
      "logistics_control": "Strategic Logistics Control",
      "active_records": "{{count}} active inventory records",
      "refresh": "Sync Matrix",
      "search_placeholder": "Query SKU or label...",
      "filters": {
        "status_all": "All Statuses",
        "in_stock": "Stable",
        "critically_low": "Low",
        "out_of_stock": "Depleted",
        "branch_global": "Global View"
      },
      "table": {
        "item": "Class / SKU",
        "deployment": "Operational Node",
        "level": "Inventory Level",
        "status": "State",
        "command": "Cmd",
        "decrypting": "Decrypting...",
        "units": "u",
        "alert_at": "Warning @ "
      },
      "quiet_moment": "Operational Silence",
      "no_data": "No inventory data found for current filters",
      "pagination": {
        "showing": "Displaying",
        "of": "from",
        "page": "Sector"
      },
      "error_load": "Failed to fetch node inventory"
    },
    "adjustments": {
      "title": "Inventory Audit Trail",
      "new_adjustment": "Manual Adjustment",
      "loading": "Retrieving logs...",
      "error_load": "Failed to load audit trail",
      "unknown_product": "Unknown Asset",
      "system_user": "System Auto",
      "no_logs": "No inventory adjustments found",
      "table": {
        "id": "Log ID",
        "date": "Timestamp",
        "product": "Product",
        "branch": "Node",
        "type": "Logic",
        "changed": "Delta",
        "quantity": "Final",
        "reason": "Context",
        "user": "Auth"
      },
      "types": {
        "addition": "Restock",
        "deduction": "Manual Out",
        "damage": "Log Loss",
        "return": "Return",
        "audit": "Set Exact",
        "adjustment": "Generic"
      },
      "pagination": {
        "showing": "Listing",
        "to": "thru",
        "of": "from",
        "adjustments": "logs"
      }
    },
    "add_adjustment": {
      "title": "Initialize Inventory Proxy",
      "subtitle": "Bulk re-allocation and state adjustment for physical assets.",
      "preparing": "Building secure bridge...",
      "step1": "Asset Selection",
      "step2": "Logic Calibration",
      "search_placeholder": "Search product grid...",
      "selected_items": "{{count}} items in buffer",
      "set_common_qty": "Apply global delta",
      "qty_placeholder": "Qty",
      "target_branch": "Deployment Node",
      "select_branch": "Choose destination node",
      "adjustment_type": "Adjustment Logic",
      "reason": "Calibration Context",
      "select_reason": "Select context...",
      "notes": "Operation Logs",
      "notes_placeholder": "Enter additional operational context...",
      "processing": "Transmitting...",
      "submit_btn": "Commit {{count}} Adjustments",
      "cancel": "Abort",
      "reasons": {
        "arrival": "New Deployment",
        "damaged": "Physical Damage",
        "correction": "Grid Correction",
        "return": "Recall / Return",
        "loss": "Untracked Loss",
        "audit": "Scheduled Audit",
        "other": "Manual Override"
      },
      "table": {
        "product": "Asset",
        "quantity": "Delta",
        "remove": "Rem"
      },
      "alerts": {
        "load_error": "Fault in data retrieval",
        "validation": "Selection incomplete",
        "qty_required": "Non-zero delta required for this logic",
        "success": "Inventory state committed",
        "error": "Fault in transmission"
      }
    },
    "requests": {
      "title": "Internal Resource Requests",
      "subtitle": "Review and authorize cross-node inventory movements.",
      "search_placeholder": "Filter by node or asset...",
      "refresh": "Sync Requests",
      "loading": "Accessing request queue...",
      "no_requests": "No pending resource authorizations",
      "table": {
        "product": "Asset",
        "branch": "Requesting Node",
        "adjustment": "State Delta",
        "status": "Auth State",
        "actions": "Cmd",
        "sku": "SKU",
        "by": "Requester",
        "reviewed_by": "Authorized by"
      },
      "alerts": {
        "fetch_error": "Fault in request retrieval",
        "approve_success": "Resource movement authorized",
        "approve_error": "Authorization fault",
        "reject_confirm": "Confirm resource request denial?",
        "reject_success": "Resource request denied",
        "reject_error": "Denial fault"
      }
    },
    "reports": {
      "inventory": {
        "title": "Inventory Reports",
        "subtitle": "Unified cross-store stock monitoring and replenishment analytics.",
        "out_of_stock_btn": "Out of Stock ({{count}})",
        "low_stock_btn": "Low Stock ({{count}})",
        "export_report": "Export Report",
        "exporting": "Exporting...",
        "table_title": "Current Stock Levels",
        "search_placeholder": "Search by product name or SKU...",
        "filter": "Filter",
        "filter_menu": {
          "title": "Filter Reports",
          "category_label": "By Category",
          "all_categories": "All Categories",
          "source_label": "Source (Branch/Vendor)",
          "all_sources": "All Sources (Global)",
          "branches_group": "Branches",
          "vendors_group": "Vendors",
          "status_label": "Stock Status",
          "all_items": "All Items",
          "in_stock": "In Stock",
          "low_stock_only": "Low Stock Only",
          "out_of_stock": "Out of Stock",
          "clear_filters": "Clear All Filters"
        },
        "statuses": {
          "in_stock": "In Stock",
          "low_stock": "Low Stock",
          "out_of_stock": "Out of Stock"
        },
        "table": {
          "product": "Product",
          "vendor_source": "Vendor/Source",
          "category": "Category",
          "stock_level": "Stock Level",
          "reorder_point": "Reorder Point",
          "status": "Status",
          "units": "units",
          "no_data": "No inventory data found matching your criteria."
        },
        "pagination": {
          "showing": "Showing",
          "to": "to",
          "of": "of",
          "products": "products"
        },
        "alerts": {
          "export_success": "Inventory report exported",
          "export_error": "Failed to export report"
        }
      },
      "sales": {
        "title": "Sales Reports",
        "period": {
          "last_30_days": "Last 30 Days",
          "this_month": "This Month",
          "last_month": "Last Month",
          "this_year": "This Year"
        },
        "export_csv": "Export CSV",
        "exporting": "Exporting...",
        "export_short": "Export",
        "stats": {
          "total_revenue": "Total Revenue",
          "total_orders": "Total Orders",
          "avg_order_value": "Avg Order Value",
          "period_sales": "Period Sales",
          "growth_suffix": "from last period",
          "standard_avg": "Standard period avg",
          "currently_viewing": "Currently viewing {{period}}"
        },
        "table": {
          "title": "Recent Transactions",
          "order_id": "Order ID",
          "date": "Date",
          "customer": "Customer",
          "items": "Items",
          "items_count": "{{count}} Items",
          "payment": "Payment",
          "status": "Status",
          "amount": "Amount",
          "no_transactions": "No transactions found for the selected period."
        },
        "pagination": {
          "showing": "Showing",
          "to": "to",
          "of": "of",
          "orders": "orders"
        },
        "alerts": {
          "export_success": "Sales report exported successfully",
          "export_error": "Failed to export sales report",
          "load_error": "Failed to load sales reports"
        }
      },
      "vendors": {
        "title": "Vendor Performance Reports",
        "subtitle": "Evaluate your vendor partners based on inventory and sales metrics.",
        "export_report": "Export Report",
        "exporting": "Exporting...",
        "table": {
          "title": "Vendor Performance Directory",
          "search_placeholder": "Search by vendor store name...",
          "vendor_store": "Vendor Store",
          "contact_details": "Contact Details",
          "products": "Products",
          "total_sales": "Total Sales",
          "member_since": "Member Since",
          "status": "Status",
          "actions": "Actions",
          "items_count": "{{count}} Items",
          "orders_count": "{{count}} Orders",
          "view_stats": "View Stats",
          "no_data": "No vendor performance data found."
        },
        "statuses": {
          "active": "Active",
          "pending": "Pending",
          "inactive": "Inactive"
        },
        "performance_modal": {
          "id": "ID",
          "lifetime_sales": "Lifetime Sales",
          "catalog_size": "Catalog Size",
          "items": "Items",
          "admin_details": "Administrative Details",
          "store_owner": "Store Owner",
          "onboarded_on": "Onboarded On",
          "phone_number": "Phone Number",
          "total_orders": "Total Orders",
          "status_msg": "This vendor account is currently {{status}} in the SaathiGrow network.",
          "close": "Close",
          "refresh_stats": "Refresh Stats"
        },
        "pagination": {
          "showing": "Showing",
          "to": "to",
          "of": "of",
          "vendors": "vendors"
        },
        "alerts": {
          "export_error": "Failed to export report",
          "export_success": "Vendor Performance Report exported successfully.",
          "fetch_error": "Failed to fetch vendor performance data"
        }
      }
    }
  }
}
\`;

fs.writeFileSync(enPath, part1 + part2, 'utf8');
console.log('Done!');
