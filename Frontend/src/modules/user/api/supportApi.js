import { API_BASE_URL } from '../../../config/apiConfig';

export const fetchPublicFAQs = async () => {
  const response = await fetch(`${API_BASE_URL}/faqs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch FAQs');
  return data;
};
