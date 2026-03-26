import Branch from '../models/Branch.js';
import Vendor from '../models/Vendor.js';
import GlobalSetting from '../models/GlobalSetting.js';
import { getGoogleDistances, calculateDistance, reverseGeocode } from '../services/locationService.js';

// @desc    Get nearby branches and vendors with Google Maps verification
// @route   GET /api/user/stores/nearby
// @access  Public
export const getNearbyStores = async (req, res) => {
  try {
    const settings = await GlobalSetting.findOne();
    const globalMaxRadius = (settings?.maxDeliveryRadius || 25) * 1000; // default 25km if not set

    // Admin decided radius is the absolute authority
    const radius = globalMaxRadius;
    const { lat, lng } = req.query;
    const MAX_ROAD_DISTANCE_KM = radius / 1000; // in km as per Admin's config

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const userCoordinates = [parseFloat(lng), parseFloat(lat)];

    // 1. First fetch candidates via fast MongoDB geospatial query
    const nearbyBranches = await Branch.find({
      isActive: true,
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates: userCoordinates },
          $maxDistance: parseInt(radius) + 5000 // 5km buffer for road distance variations
        }
      }
    }).limit(10).lean();

    const nearbyVendors = await Vendor.find({
      status: 'Active',
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates: userCoordinates },
          $maxDistance: parseInt(radius) + 5000
        }
      }
    }).limit(10).lean();

    let allCandidates = [
      ...nearbyBranches.map(b => ({ ...b, storeType: 'branch' })),
      ...nearbyVendors.map(v => ({ ...v, storeType: 'vendor' }))
    ];

    if (allCandidates.length === 0) {
      return res.json([]);
    }

    // 2. Use Google Maps Distance Matrix for high-precision "Zone" filtering
    const destinations = allCandidates.map(c => c.address?.location?.coordinates).filter(Boolean);
    const googleData = await getGoogleDistances(userCoordinates, destinations);

    let stores = [];

    if (googleData) {
      // Filter and enrich with road distance (Time removed as per user request)
      allCandidates.forEach((candidate, idx) => {
        const roadInfo = googleData[idx];
        if (roadInfo && roadInfo.distance <= MAX_ROAD_DISTANCE_KM) {
          stores.push({
            id: candidate._id,
            name: candidate.storeName || candidate.name,
            type: candidate.storeType,
            location: candidate.address?.location?.coordinates,
            address: candidate.address,
            roadDistance: roadInfo.distance.toFixed(1), // in KM
            isNearby: true
          });
        }
      });
    } else {
      // Fallback to Euclidean if Google fails (e.g. invalid API key)
      console.warn('[STORES] Google Distance Matrix failed, falling back to Euclidean mapping');
      stores = allCandidates.map(candidate => {
        const destCoords = candidate.address?.location?.coordinates;
        // Calculate haversine distance as a fallback
        const dist = destCoords ? calculateDistance(lat, lng, destCoords[1], destCoords[0]) : 0;

        return {
          id: candidate._id,
          name: candidate.storeName || candidate.name,
          type: candidate.storeType,
          location: destCoords,
          address: candidate.address,
          roadDistance: dist.toFixed(1),
          isNearby: true
        };
      });
    }

    // Sort by distance
    stores.sort((a, b) => (parseFloat(a.roadDistance) || 0) - (parseFloat(b.roadDistance) || 0));

    res.json(stores);
  } catch (error) {
    console.error('Error fetching optimized nearby stores:', error);
    res.status(500).json({ message: 'Failed to fetch nearby stores' });
  }
};

// @desc    Reverse geocode coordinates to address
// @route   GET /api/user/stores/reverse-geocode
// @access  Public
export const reverseGeocodeToAddress = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    console.log(`[STORES] Reverse Geocode request for lat: ${lat}, lng: ${lng}`);
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const coords = [parseFloat(lng), parseFloat(lat)];
    const result = await reverseGeocode(coords);

    if (!result) {
      return res.status(404).json({ message: 'Could not resolve location', error: 'ZERO_RESULTS' });
    }

    if (result.status === 'REQUEST_DENIED') {
        return res.status(401).json({ 
            message: 'Reverse Geocoding API not enabled on backend credentials',
            error: 'REQUEST_DENIED'
        });
    }

    res.json(result);
  } catch (error) {
    console.error('Reverse Geocode error:', error);
    res.status(500).json({ message: 'Server error during reverse geocoding' });
  }
};
