import DeliverySlot from '../models/DeliverySlot.js';

// @desc    Get all delivery slots
// @route   GET /api/delivery-slots
// @access  Public
export const getDeliverySlots = async (req, res) => {
  try {
    const slots = await DeliverySlot.find({ isActive: true }).sort({ startTime: 1 });

    // Filter slots based on current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const filteredSlots = slots.filter(slot => {
      const [endHour, endMin] = slot.endTime.split(':').map(Number);

      // If current hour is less than end hour, it's valid
      if (currentHour < endHour) return true;

      // If current hour matches end hour, check minutes (with a 30 min buffer for safety)
      if (currentHour === endHour) {
        return currentMin < (endMin - 30);
      }

      return false;
    });

    res.json(filteredSlots);
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
    const slot = await DeliverySlot.create({
      startTime,
      endTime,
      label,
      isActive
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a delivery slot
// @route   PUT /api/admin/delivery-slots/:id
// @access  Private (Admin)
export const updateDeliverySlot = async (req, res) => {
  try {
    const slot = await DeliverySlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.startTime = req.body.startTime || slot.startTime;
    slot.endTime = req.body.endTime || slot.endTime;
    slot.label = req.body.label || slot.label;
    slot.isActive = req.body.isActive !== undefined ? req.body.isActive : slot.isActive;

    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
