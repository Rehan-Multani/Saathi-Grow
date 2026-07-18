import Branch from '../models/Branch.js';
import Vendor from '../models/Vendor.js';
import GlobalSetting from '../models/GlobalSetting.js';
import { getGoogleDistances, calculateDistance, reverseGeocode } from '../services/locationService.js';

const resolveStoreRadiusKm = (store, globalDefaultKm) => {
  const r = Number(store?.deliveryRadius);
  return Number.isFinite(r) && r > 0 ? r : globalDefaultKm;
};

// @desc    Get nearby branches and vendors within each store's admin-set delivery radius
// @route   GET /api/user/stores/nearby
// @access  Public
export const getNearbyStores = async (req, res) => {
  try {
    const settings = await GlobalSetting.findOne();
    const globalDefaultKm = settings?.maxDeliveryRadius || 20;
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const userCoordinates = [userLng, userLat];

    // Query bound = largest configured store radius (so large-area hubs are not missed)
    const [branchMax, vendorMax] = await Promise.all([
      Branch.findOne({ isActive: true }).sort({ deliveryRadius: -1 }).select('deliveryRadius').lean(),
      Vendor.findOne({ status: 'Active' }).sort({ deliveryRadius: -1 }).select('deliveryRadius').lean()
    ]);
    const searchCeilingKm = Math.max(
      globalDefaultKm,
      Number(branchMax?.deliveryRadius) || 0,
      Number(vendorMax?.deliveryRadius) || 0,
      20
    );
    const searchMaxMeters = searchCeilingKm * 1000 + 5000;

    const nearbyBranches = await Branch.find({
      isActive: true,
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates: userCoordinates },
          $maxDistance: searchMaxMeters
        }
      }
    }).limit(50).lean();

    const nearbyVendors = await Vendor.find({
      status: 'Active',
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates: userCoordinates },
          $maxDistance: searchMaxMeters
        }
      }
    }).limit(50).lean();

    const allCandidates = [
      ...nearbyBranches.map(b => ({ ...b, storeType: 'branch' })),
      ...nearbyVendors.map(v => ({ ...v, storeType: 'vendor' }))
    ];

    if (allCandidates.length === 0) {
      return res.json([]);
    }

    const destinations = allCandidates.map(c => c.address?.location?.coordinates).filter(Boolean);
    const googleData = await getGoogleDistances(userCoordinates, destinations);

    let stores = [];

    if (googleData) {
      allCandidates.forEach((candidate, idx) => {
        const roadInfo = googleData[idx];
        const storeRadiusKm = resolveStoreRadiusKm(candidate, globalDefaultKm);
        if (roadInfo && roadInfo.distance <= storeRadiusKm) {
          stores.push({
            id: candidate._id,
            name: candidate.storeName || candidate.name,
            type: candidate.storeType,
            location: candidate.address?.location?.coordinates,
            address: candidate.address,
            deliveryRadius: storeRadiusKm,
            roadDistance: roadInfo.distance.toFixed(1),
            isNearby: true
          });
        }
      });
    } else {
      console.warn('[STORES] Google Distance Matrix failed, falling back to Euclidean mapping');
      stores = allCandidates
        .map(candidate => {
          const destCoords = candidate.address?.location?.coordinates;
          const dist = destCoords
            ? calculateDistance(userLat, userLng, destCoords[1], destCoords[0])
            : Infinity;
          const storeRadiusKm = resolveStoreRadiusKm(candidate, globalDefaultKm);
          if (dist > storeRadiusKm) return null;
          return {
            id: candidate._id,
            name: candidate.storeName || candidate.name,
            type: candidate.storeType,
            location: destCoords,
            address: candidate.address,
            deliveryRadius: storeRadiusKm,
            roadDistance: dist.toFixed(1),
            isNearby: true
          };
        })
        .filter(Boolean);
    }

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
