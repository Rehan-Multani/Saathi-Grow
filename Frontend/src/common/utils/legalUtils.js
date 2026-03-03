import { API_BASE_URL } from '../../config/apiConfig';

/**
 * Fetches a list of legal policies available for a specific audience.
 * @param {string} audience - 'User', 'Vendor', 'Delivery Partner', 'Staff', etc.
 */
export const getPoliciesList = async (audience) => {
  try {
    const response = await fetch(`${API_BASE_URL}/legal/list/${encodeURIComponent(audience)}`);
    if (!response.ok) throw new Error('Failed to fetch policies list');
    return await response.json();
  } catch (error) {
    console.error('Error fetching policies list:', error);
    return [];
  }
};

/**
 * Fetches the content of a specific legal policy by slug and audience.
 * @param {string} slug - The policy slug.
 * @param {string} audience - The role audience.
 */
export const getPolicyContent = async (slug, audience) => {
  try {
    const response = await fetch(`${API_BASE_URL}/legal/${slug}?audience=${encodeURIComponent(audience)}`);
    if (!response.ok) throw new Error('Failed to fetch policy content');
    return await response.json();
  } catch (error) {
    console.error('Error fetching policy content:', error);
    return null;
  }
};
