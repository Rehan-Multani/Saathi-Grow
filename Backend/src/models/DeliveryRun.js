import mongoose from 'mongoose';

/**
 * DeliveryRun — A "batch trip" where one delivery partner handles
 * multiple orders in a single run, visiting each customer stop in sequence.
 *
 * Flow:
 *   Admin selects orders (grouped by slot) → creates a DeliveryRun →
 *   assigns to a partner → partner gets optimized multi-stop route →
 *   partner confirms delivery at each stop via OTP → run completes
 */
const deliveryRunSchema = new mongoose.Schema({

  // Human-readable run ID e.g. "RUN-20250305-MORNING-001"
  runId: {
    type: String,
    unique: true,
    required: true
  },
  runType: {
    type: String,
    enum: ['delivery', 'return'],
    default: 'delivery'
  },
  destinationType: {
    type: String,
    enum: ['branch', 'vendor'],
    default: null
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'destinationTypeModel'
  },
  destinationTypeModel: {
    type: String,
    enum: ['Branch', 'Vendor']
  },

  // The delivery partner executing this run
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    required: true
  },

  // Which time slot this run belongs to (null = Immediate run)
  deliverySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliverySlot',
    default: null
  },

  // The calendar date this run is scheduled for (date part only, time from slot)
  slotDate: {
    type: Date,
    required: true
  },

  // true = this run handles Immediate/ASAP orders (no slot)
  isImmediate: {
    type: Boolean,
    default: false
  },

  // Branch this run originates from (pickup point for all orders)
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    default: null
  },

  // Vendor this run belongs to
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },

  // Ordered list of delivery stops
  orders: [
    {
      // The order to deliver
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
      },
      pickupPoint: { 
        // For returns, this is the customer's location
        street: String,
        city: String,
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: [Number]
        }
      },

      // Position in the delivery sequence (1 = first stop, 2 = second, ...)
      // This may differ from array index after Google Maps route optimization
      stopSequence: {
        type: Number,
        required: true
      },

      // Delivery status at this specific stop
      status: {
        type: String,
        enum: ['pending', 'out_for_delivery', 'delivered', 'picked_up', 'failed'],
        default: 'pending'
      },

      // 4-digit OTP the customer must provide to confirm delivery
      deliveryOTP: {
        type: String,
        default: null
      },

      // Number of wrong OTP attempts (max 3 before requiring admin override)
      otpAttempts: {
        type: Number,
        default: 0
      },

      // Timestamps for this stop
      startedAt: { type: Date, default: null }, // When partner began traveling to this stop
      deliveredAt: { type: Date, default: null }, // When delivery was confirmed
      failedAt: { type: Date, default: null },

      // Reason if delivery failed (e.g., "Customer not home", "Wrong address")
      failureReason: {
        type: String,
        default: null
      },

      // Cloudinary URL of delivery proof photo (optional)
      proofImage: {
        type: String,
        default: null
      }
    }
  ],

  // Overall run lifecycle status
  status: {
    type: String,
    enum: [
      'created',          // Run created, partner not yet notified
      'assigned',         // Partner notified, hasn't started yet
      'in_progress',      // Partner has marked first stop started
      'completed',        // All stops delivered successfully
      'partial_complete', // Some stops delivered, some failed
      'cancelled'         // Admin cancelled the entire run
    ],
    default: 'created'
  },

  // Google Maps route optimization result
  optimizedRoute: {
    // Reordered indices from Google Maps waypoint optimization
    // e.g. [2, 0, 1] means stop 3 first, then 1, then 2
    waypointOrder: {
      type: [Number],
      default: []
    },

    // Encoded polyline string for rendering the full route on a map
    encodedPolyline: {
      type: String,
      default: null
    },

    // Total route metrics
    totalDistanceMeters: {
      type: Number,
      default: 0
    },
    totalDurationSeconds: {
      type: Number,
      default: 0
    }
  },

  // Admin notes for this run (e.g., "Handle fragile items carefully")
  notes: {
    type: String,
    default: null
  },

  // --- Lifecycle timestamps ---
  assignedAt: { type: Date, default: null },
  startedAt: { type: Date, default: null }, // When partner marks first stop active
  completedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },

  // Who cancelled (if cancelled)
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }

}, {
  timestamps: true // createdAt, updatedAt
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Fast lookup for a partner's active run
deliveryRunSchema.index({ deliveryPartner: 1, status: 1 });

// Admin filtering by slot + date
deliveryRunSchema.index({ deliverySlot: 1, slotDate: 1 });

// Admin filtering by branch + date
deliveryRunSchema.index({ branchId: 1, slotDate: 1 });

// ─── Virtual: Computed delivery summary ───────────────────────────────────────
deliveryRunSchema.virtual('summary').get(function () {
  const total = this.orders.length;
  const delivered = this.orders.filter(o => o.status === 'delivered').length;
  const failed = this.orders.filter(o => o.status === 'failed').length;
  const pending = this.orders.filter(o => o.status === 'pending').length;
  return { total, delivered, failed, pending };
});

// Enable virtual fields in JSON output
deliveryRunSchema.set('toJSON', { virtuals: true });
deliveryRunSchema.set('toObject', { virtuals: true });

const DeliveryRun = mongoose.model('DeliveryRun', deliveryRunSchema);
export default DeliveryRun;
