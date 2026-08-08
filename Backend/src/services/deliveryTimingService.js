import DeliverySlot from '../models/DeliverySlot.js';
import GlobalSetting from '../models/GlobalSetting.js';
import mongoose from 'mongoose';

export const DEFAULT_DELIVERY_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_SLOT_CUTOFF_MINUTES = 30;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const parseTimeToMinutes = (value) => {
  const match = TIME_PATTERN.exec(String(value || ''));
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

export const getZonedDateParts = (date = new Date(), timeZone = DEFAULT_DELIVERY_TIMEZONE) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
};

export const isSlotBookable = (slot, settings = {}, now = new Date()) => {
  if (!slot?.isActive) return false;
  const startMinutes = parseTimeToMinutes(slot.startTime);
  if (startMinutes === null) return false;
  const configuredCutoff = settings.slotBookingCutoffMinutes ?? DEFAULT_SLOT_CUTOFF_MINUTES;
  const cutoff = Math.max(0, Number(configuredCutoff));
  const { minutes } = getZonedDateParts(now, settings.deliveryTimezone || DEFAULT_DELIVERY_TIMEZONE);
  return startMinutes - minutes > cutoff;
};

export const getDeliverySettings = async () => {
  let settings = await GlobalSetting.findOne();
  if (!settings) settings = await GlobalSetting.create({});
  return settings;
};

export const validateAndBuildDeliveryTiming = async (deliverySlotId, requestedImmediate, now = new Date()) => {
  const settings = await getDeliverySettings();
  // Preserve compatibility with older clients that omitted the flag for ASAP orders.
  const isImmediate = requestedImmediate === true || (requestedImmediate == null && !deliverySlotId);
  const timezone = settings.deliveryTimezone || DEFAULT_DELIVERY_TIMEZONE;
  const scheduledDate = getZonedDateParts(now, timezone).date;

  if (isImmediate) {
    if (!settings.immediateDeliveryEnabled) {
      throw new Error('Immediate delivery is currently unavailable. Please select a delivery slot.');
    }
    return {
      deliverySlot: 'Immediate Delivery', deliverySlotId: null, isImmediate: true,
      deliveryWindowSnapshot: { label: 'Immediate Delivery', startTime: null, endTime: null, timezone, scheduledDate, isImmediate: true }
    };
  }

  if (!deliverySlotId) throw new Error('Please select a delivery slot.');
  const slot = await DeliverySlot.findById(deliverySlotId);
  if (!slot || !isSlotBookable(slot, settings, now)) {
    throw new Error('The selected delivery slot is unavailable or has already passed. Please select another slot.');
  }

  const Order = mongoose.model('Order');
  const existingOrders = await Order.countDocuments({
    deliverySlotId: slot._id,
    'deliveryWindowSnapshot.scheduledDate': scheduledDate,
    status: { $nin: ['cancelled', 'returned'] }
  });
  if (existingOrders >= (slot.maxOrders || 50)) {
    throw new Error('The selected delivery slot is full. Please select another slot.');
  }

  return {
    deliverySlot: slot.label, deliverySlotId: slot._id, isImmediate: false,
    deliveryWindowSnapshot: { label: slot.label, startTime: slot.startTime, endTime: slot.endTime, timezone, scheduledDate, isImmediate: false }
  };
};
