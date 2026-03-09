import { API_BASE_URL } from '../../../config/apiConfig';

export const fetchFAQs = async (token) => {
  const response = await fetch(`${API_BASE_URL}/faqs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch FAQs');
  return data;
};

export const createFAQ = async (token, faqData) => {
  const response = await fetch(`${API_BASE_URL}/faqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(faqData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create FAQ');
  return data;
};

export const updateFAQ = async (token, id, faqData) => {
  const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(faqData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update FAQ');
  return data;
};

export const deleteFAQ = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete FAQ');
  return data;
};
