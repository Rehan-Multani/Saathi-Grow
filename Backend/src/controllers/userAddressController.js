import User from '../models/User.js';

// @desc    Get all addresses for logged-in user
// @route   GET /api/user/addresses
// @access  Private
export const getMyAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/user/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const { label, name, phone, street, city, state, zipCode, isDefault, location } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAddress = {
      label: label || 'Other',
      name: name || '',
      phone: phone || '',
      street,
      city,
      state,
      zipCode,
      isDefault: isDefault || false,
      location: location || { type: 'Point', coordinates: [0, 0] }
    };

    // If this is set to default, unset all others
    if (newAddress.isDefault && user.addresses) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // If it's the first address, make it default automatically
    if (!user.addresses || user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/user/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const { label, name, phone, street, city, state, zipCode, isDefault, location } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    address.label = label || address.label;
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;

    if (location) {
      address.location = location;
    }

    if (isDefault) {
      address.isDefault = true;
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.id) {
          addr.isDefault = false;
        }
      });
    } else {
      // If client attempts to unset the default, protect it.
      if (address.isDefault) {
        if (user.addresses.length > 1) {
          address.isDefault = false;
          // Reassign default to the first available alternate address
          const anotherAddress = user.addresses.find(a => a._id.toString() !== req.params.id);
          if (anotherAddress) {
            anotherAddress.isDefault = true;
          }
        } else {
          // If this is the only address, it must remain default
          address.isDefault = true;
        }
      }
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/user/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: 'Address removed', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
