import Branch from '../models/Branch.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import axios from 'axios';
import { GOOGLE_MAPS_BASE_URL } from '../config/serviceUrls.js';

const GOOGLE_MAPS_DISTANCEMATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const getApiKey = () => process.env.GOOGLE_MAPS_API;

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

    if (candidates.length === 0) {
      // 2.5 Fallback: Search again without distance constraints if proximity fails
      console.log('[SOURCE-FALLBACK] No nearby source found within 20km. Searching globally...');
      const allActiveBranches = await Branch.find({ isActive: true }).limit(20);
      const allActiveVendors = await Vendor.find({ status: 'Active' }).limit(20);

      for (const branch of allActiveBranches) {
        if (await checkBranchStock(branch._id, items)) {
          candidates.push({ type: 'branch', id: branch._id, location: branch.address?.location?.coordinates || [0, 0], doc: branch });
        }
      }
      for (const vendor of allActiveVendors) {
        if (await checkVendorStock(vendor._id, items)) {
          candidates.push({ type: 'vendor', id: vendor._id, location: vendor.address?.location?.coordinates || [0, 0], doc: vendor });
        }
      }
    }

    if (candidates.length === 0) {
      console.error('[SOURCE-FATAL] No source found globally with sufficient stock for these items');
      return null;
    }

    // 3. Filter and Sort using Google Maps Distance Matrix for accuracy
    const apiKey = getApiKey();
    if (candidates.length > 0 && apiKey) {
      console.log(`[SOURCE-DEBUG] Verifying ${candidates.length} candidates with Google Distance Matrix`);
      const googleDistances = await getGoogleDistances(coordinates, candidates.map(c => c.location));

      if (googleDistances) {
        // Map actual road distances back to our candidates
        candidates.forEach((c, idx) => {
          c.roadDistance = googleDistances[idx].distance;
        });

        // Filter those strictly within 20km road distance if any exist
        const withinRadius = candidates.filter(c => c.roadDistance <= 20);
        if (withinRadius.length > 0) {
          withinRadius.sort((a, b) => a.roadDistance - b.roadDistance);
          console.log(`[SOURCE-CHOSEN] Road Distance: ${withinRadius[0].roadDistance}km`);
          return withinRadius[0];
        } else {
          console.log('[SOURCE-WARN] No candidate within 20km road distance. Picking closest available.');
        }
      }
    }

    // 4. Fallback Sort by Euclidean distance if Google fails or none are within 20km
    candidates.sort((a, b) => {
      const distA = calculateDistance(coordinates[1], coordinates[0], a.location[1], a.location[0]);
      const distB = calculateDistance(coordinates[1], coordinates[0], b.location[1], b.location[0]);
      return distA - distB;
    });

    const chosen = candidates[0];
    console.log(`[SOURCE-CHOSEN] Type: ${chosen.type}, ID: ${chosen.id} (Euclidean: ${calculateDistance(coordinates[1], coordinates[0], chosen.location[1], chosen.location[0]).toFixed(2)}km)`);
    return chosen;
  } catch (error) {
    console.error('Error in findOptimalSource:', error);
    return null;
  }
};

/**
 * Get coordinates from address string using Google Geocoding API
 */
export const geocodeAddress = async (addressString) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const response = await axios.get(GOOGLE_MAPS_BASE_URL, {
      params: {
        address: addressString,
        key: apiKey
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
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const response = await axios.get(GOOGLE_MAPS_BASE_URL, {
      params: {
        address: addressString,
        key: apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results[0]) {
      const place = response.data.results[0];
      const addressData = {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        coordinates: [place.geometry.location.lng, place.geometry.location.lat],
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
 * Get road distances from origin to multiple destinations using Google Distance Matrix
 */
export const getGoogleDistances = async (origin, destinations) => {
  const apiKey = getApiKey();
  if (!apiKey || !destinations.length) return null;
  try {
    const destString = destinations.map(d => `${d[1]},${d[0]}`).join('|');
    const originString = `${origin[1]},${origin[0]}`;

    const response = await axios.get(GOOGLE_MAPS_DISTANCEMATRIX_URL, {
      params: {
        origins: originString,
        destinations: destString,
        key: apiKey,
        mode: 'driving'
      }
    });

    if (response.data.status === 'OK' && response.data.rows[0]) {
      return response.data.rows[0].elements.map((el, idx) => ({
        distance: (el.distance && typeof el.distance.value === 'number') ? el.distance.value / 1000 : 99999, // in KM
        duration: el.duration?.value || 0, // in seconds
        destination: destinations[idx]
      }));
    }
    return null;
  } catch (error) {
    console.error('Distance Matrix error:', error);
    return null;
  }
};

/**
 * Reverse Geocode coordinates to address details using Google Geocoding API (REST)
 * @param {Array} coords - [longitude, latitude]
 */
export const reverseGeocode = async (coords) => {
  const apiKey = getApiKey();
  if (!apiKey || !Array.isArray(coords) || coords.length !== 2) return null;
  try {
    console.log(`[REV-GEO] Fetching for: ${coords[1]},${coords[0]}`);
    console.log(`[REV-GEO] API Key Status: ${apiKey ? 'Present (ending in ' + apiKey.slice(-4) + ')' : 'MISSING'}`);
    const response = await axios.get(GOOGLE_MAPS_BASE_URL, {
      params: {
        latlng: `${coords[1]},${coords[0]}`,
        key: apiKey
      }
    });

    console.log(`[REV-GEO] Google Response Status: ${response.data.status}`);
    if (response.data.error_message) {
      console.error(`[REV-GEO] Google Error Message: ${response.data.error_message}`);
    }
    
    if (response.data.status === 'OK' && response.data.results[0]) {
      const place = response.data.results[0];
      let street = "";
      let area = "";
      let city = "";

      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes("sublocality_level_1") || types.includes("route")) {
          street = component.long_name;
        }
        if (types.includes("sublocality_level_2") || types.includes("neighborhood")) {
          area = component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
      });

      const displayArea = street || area || place.address_components[0]?.long_name || "Unknown Area";

      return {
        address: place.formatted_address,
        street: displayArea,
        city: city || "Indore",
        status: response.data.status
      };
    }
    
    // Return status if not OK
    if (response.data.status !== 'OK') {
        return { status: response.data.status };
    }

    return null;
  } catch (error) {
    console.error('Reverse Geocoding error:', error);
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
