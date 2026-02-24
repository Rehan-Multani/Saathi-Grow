import Branch from '../models/Branch.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API;

/**
 * Validates stock availability for a list of items at a specific branch
 */
export const checkBranchStock = async (branchId, items) => {
  for (const item of items) {
    const product = await Product.findOne({
      _id: item.product,
      'branchStocks.branchId': branchId,
      'branchStocks.stock': { $gte: item.quantity }
    });
    if (!product) return false;
  }
  return true;
};

/**
 * Validates if a vendor owns/has the products and sufficient variant stock
 */
export const checkVendorStock = async (vendorId, items) => {
  for (const item of items) {
    // Find product that belongs to vendor and has enough stock in AT LEAST one variant (or sum)
    // This is a simplification; ideally, you'd check specific variants if provided
    const product = await Product.findOne({
      _id: item.product,
      vendor: vendorId,
      status: 'Active'
    });

    if (!product) return false;

    // Check if total stock across all variants is sufficient
    const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    if (totalStock < item.quantity) return false;
  }
  return true;
};

/**
 * Finds the optimal source (Branch or Vendor) for an order based on proximity and stock
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Array} items - Order items [{ product, quantity }]
 */
export const findOptimalSource = async (coordinates, items) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) return null;

  try {
    // 1. Find nearby branches (within 20km)
    const nearbyBranches = await Branch.find({
      isActive: true,
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 20000 // 20km
        }
      }
    }).limit(5);

    // 2. Find nearby vendors (within 20km)
    const nearbyVendors = await Vendor.find({
      status: 'Active',
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 20000 // 20km
        }
      }
    }).limit(5);

    const candidates = [];

    // Check stock for branches
    for (const branch of nearbyBranches) {
      const hasStock = await checkBranchStock(branch._id, items);
      if (hasStock) {
        candidates.push({ type: 'branch', id: branch._id, location: branch.address.location.coordinates, doc: branch });
      }
    }

    // Check stock for vendors
    for (const vendor of nearbyVendors) {
      const hasStock = await checkVendorStock(vendor._id, items);
      if (hasStock) {
        candidates.push({ type: 'vendor', id: vendor._id, location: vendor.address.location.coordinates, doc: vendor });
      }
    }

    if (candidates.length === 0) return null;

    // 3. If multiple candidates, we could use Google Maps Distance Matrix to be super precise
    // For now, sorting by initial $near proximity is good, but let's implement a fallback

    // Sort by Euclidean distance (simple) or just take the first from $near results if they were merged.
    // Actually $near already sorts. Let's just find the closest one manually from our candidates list 
    // to be sure since we fetched two separate lists.

    candidates.sort((a, b) => {
      const distA = calculateDistance(coordinates[1], coordinates[0], a.location[1], a.location[0]);
      const distB = calculateDistance(coordinates[1], coordinates[0], b.location[1], b.location[0]);
      return distA - distB;
    });

    return candidates[0];
  } catch (error) {
    console.error('Error in findOptimalSource:', error);
    return null;
  }
};

/**
 * Get coordinates from address string using Google Geocoding API
 */
export const geocodeAddress = async (addressString) => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: addressString,
        key: GOOGLE_MAPS_API_KEY
      }
    });
    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      return [lng, lat];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Get full address details from address string using Google Geocoding API
 */
export const getFullAddress = async (addressString) => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: addressString,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results[0]) {
      const place = response.data.results[0];
      const addressData = {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        coordinates: [place.geometry.location.lng, place.geometry.location.lat()],
        fullAddress: place.formatted_address
      };

      place.address_components.forEach(component => {
        const type = component.types[0];
        if (type === "street_number" || type === "route") {
          addressData.street += (addressData.street ? " " : "") + component.long_name;
        } else if (type === "locality") {
          addressData.city = component.long_name;
        } else if (type === "administrative_area_level_1") {
          addressData.state = component.long_name;
        } else if (type === "postal_code") {
          addressData.zipCode = component.long_name;
        }
      });

      // Fallback for city usually found in sublocality_level_1 or others
      if (!addressData.city) {
        const fallbackCity = place.address_components.find(c => c.types.includes("sublocality_level_1") || c.types.includes("administrative_area_level_2"));
        if (fallbackCity) addressData.city = fallbackCity.long_name;
      }

      return addressData;
    }
    return null;
  } catch (error) {
    console.error('Full Geocoding error:', error);
    return null;
  }
};

/**
 * Calculates distance between two points (Haversine formula) in KM
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};
