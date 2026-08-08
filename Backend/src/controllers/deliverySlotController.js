import DeliverySlot from '../models/DeliverySlot.js';
import Order from '../models/Order.js';
import { getDeliverySettings, getZonedDateParts, isSlotBookable, parseTimeToMinutes } from '../services/deliveryTimingService.js';

const validateSlotInput = ({ startTime, endTime, label, maxOrders }) => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) throw new Error('Start and end time must use HH:mm format.');
  if (start >= end) throw new Error('End time must be later than start time.');
  if (!String(label || '').trim()) throw new Error('Slot label is required.');
  const limit = Number(maxOrders ?? 50);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('Max orders must be between 1 and 1000.');
  return limit;
};

// @desc    Get all delivery slots
// @route   GET /api/delivery-slots
// @access  Public
export const getDeliverySlots = async (req, res) => {
  try {
    const [slots, settings] = await Promise.all([
      DeliverySlot.find({ isActive: true }).sort({ startTime: 1 }),
      getDeliverySettings()
    ]);
    const scheduledDate = getZonedDateParts(new Date(), settings.deliveryTimezone).date;
    const bookableSlots = slots.filter((slot) => isSlotBookable(slot, settings));
    const slotsWithCapacity = await Promise.all(bookableSlots.map(async (slot) => {
      const orderCount = await Order.countDocuments({
        deliverySlotId: slot._id,
        'deliveryWindowSnapshot.scheduledDate': scheduledDate,
        status: { $nin: ['cancelled', 'returned'] }
      });
      return orderCount < (slot.maxOrders || 50) ? slot : null;
    }));
    res.json(slotsWithCapacity.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all delivery slots (Admin)
// @route   GET /api/admin/delivery-slots
// @access  Private (Admin)
export const getAllSlotsAdmin = async (req, res) => {
  try {
    const slots = await DeliverySlot.find().sort({ startTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a delivery slot
// @route   POST /api/admin/delivery-slots
// @access  Private (Admin)
export const createDeliverySlot = async (req, res) => {
  try {
    const { startTime, endTime, label, isActive } = req.body;
    const maxOrders = validateSlotInput(req.body);
    const slot = await DeliverySlot.create({
      startTime,
      endTime,
      label,
      isActive,
      maxOrders
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a delivery slot
// @route   PUT /api/admin/delivery-slots/:id
// @access  Private (Admin)
export const updateDeliverySlot = async (req, res) => {
  try {
    const slot = await DeliverySlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const nextValues = {
      startTime: req.body.startTime ?? slot.startTime,
      endTime: req.body.endTime ?? slot.endTime,
      label: req.body.label ?? slot.label,
      maxOrders: req.body.maxOrders ?? slot.maxOrders
    };
    const maxOrders = validateSlotInput(nextValues);
    slot.startTime = nextValues.startTime;
    slot.endTime = nextValues.endTime;
    slot.label = String(nextValues.label).trim();
    slot.maxOrders = maxOrders;
    slot.isActive = req.body.isActive !== undefined ? req.body.isActive : slot.isActive;

    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a delivery slot
// @route   DELETE /api/admin/delivery-slots/:id
// @access  Private (Admin)
export const deleteDeliverySlot = async (req, res) => {
  try {
    const slot = await DeliverySlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    await slot.deleteOne();
    res.json({ message: 'Slot removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
