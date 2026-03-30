import { API_BASE_URL } from '../../../config/apiConfig';

const CATEGORY_PAGE_CACHE_TTL = 60 * 1000;
const categoryPageCache = new Map();
const categoryPageRequests = new Map();

const normalizeParams = (params = {}) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

const getCategoryPageCacheKey = (slug, params = {}) => {
  const normalizedParams = normalizeParams(params);
  const orderedParams = Object.keys(normalizedParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = normalizedParams[key];
      return acc;
    }, {});

  return JSON.stringify({
    slug: encodeURIComponent(slug),
    params: orderedParams
  });
};

export const fetchCategoryPage = async (slug, params = {}) => {
  const normalizedParams = normalizeParams(params);
  const cacheKey = getCategoryPageCacheKey(slug, normalizedParams);
  const cached = categoryPageCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CATEGORY_PAGE_CACHE_TTL) {
    return cached.data;
  }

  if (categoryPageRequests.has(cacheKey)) {
    return categoryPageRequests.get(cacheKey);
  }

  const query = new URLSearchParams(normalizedParams).toString();
  const request = fetch(`${API_BASE_URL}/user/category-pages/${encodeURIComponent(slug)}${query ? `?${query}` : ''}`)
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch category page');
        error.status = response.status;
        error.payload = data;
        throw error;
      }

      categoryPageCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    })
    .finally(() => {
      categoryPageRequests.delete(cacheKey);
    });

  categoryPageRequests.set(cacheKey, request);

  return request;
};

export const clearCategoryPageCache = (slug) => {
  if (!slug) {
    categoryPageCache.clear();
    categoryPageRequests.clear();
    return;
  }

  for (const key of categoryPageCache.keys()) {
    if (key.includes(`"slug":"${encodeURIComponent(slug)}"`)) {
      categoryPageCache.delete(key);
    }
  }
};
