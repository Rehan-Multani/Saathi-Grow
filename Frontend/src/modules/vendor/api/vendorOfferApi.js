import { API_BASE_URL } from '../../../config/apiConfig';

const VENDOR_OFFERS_BASE = `${API_BASE_URL}/vendors/offers`;

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const getVendorOffers = async (token) => {
  const res = await fetch(VENDOR_OFFERS_BASE, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch offers');
  return data;
};

export const getVendorOfferById = async (token, id) => {
  const res = await fetch(`${VENDOR_OFFERS_BASE}/${id}`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch offer');
  return data;
};

export const createVendorOffer = async (token, formData) => {
  const res = await fetch(VENDOR_OFFERS_BASE, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData, // FormData handles Content-Type automatically
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create offer');
  return data;
};

export const updateVendorOffer = async (token, id, formData) => {
  const res = await fetch(`${VENDOR_OFFERS_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update offer');
  return data;
};

export const deleteVendorOffer = async (token, id) => {
  const res = await fetch(`${VENDOR_OFFERS_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete offer');
  return data;
};
