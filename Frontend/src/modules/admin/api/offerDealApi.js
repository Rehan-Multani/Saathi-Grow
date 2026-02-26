import { API_BASE_URL } from '../../../config/apiConfig';

const OFFER_DEALS_API_BASE_URL = `${API_BASE_URL}/admin/offer-deals`;

export const getOfferDeals = async (token) => {
  const response = await fetch(`${OFFER_DEALS_API_BASE_URL}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch offer deals');
  }
  return data;
};

export const createOfferDeal = async (token, offerData) => {
  const response = await fetch(`${OFFER_DEALS_API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: offerData, // FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create offer deal');
  }
  return data;
};

export const updateOfferDeal = async (token, id, offerData) => {
  const response = await fetch(`${OFFER_DEALS_API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: offerData, // FormData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update offer deal');
  }
  return data;
};

export const deleteOfferDeal = async (token, id) => {
  const response = await fetch(`${OFFER_DEALS_API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete offer deal');
  }
  return data;
};

export const getOfferDealById = async (token, id) => {
  const response = await fetch(`${OFFER_DEALS_API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch offer details');
  }
  return data;
};
