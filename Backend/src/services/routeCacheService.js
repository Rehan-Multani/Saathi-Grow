/**
 * In-memory route cache with TTL.
 * Reduces Google Directions API calls by caching route responses per order + origin (rounded).
 * TTL: 90 seconds (matches frontend throttle window).
 */

const routeCache = new Map();

/**
 * Round coordinate to 4 decimal places (~11m precision) to avoid cache misses on tiny GPS jitter.
 */
function roundCoord(value) {
  return Number(value).toFixed(4);
}

/**
 * Build a cache key from order ID + rider origin + destination.
 */
export function buildRouteCacheKey(orderId, originLat, originLng, destLat, destLng) {
  return `route:${orderId}:${roundCoord(originLat)}:${roundCoord(originLng)}:${roundCoord(destLat)}:${roundCoord(destLng)}`;
}

/**
 * Get cached route data. Returns null if missing or expired.
 */
export function getCachedRoute(key) {
  const item = routeCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    routeCache.delete(key);
    return null;
  }
  return item.data;
}

/**
 * Store route data in cache with TTL (default 90s).
 */
export function setCachedRoute(key, data, ttlMs = 90_000) {
  routeCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}
