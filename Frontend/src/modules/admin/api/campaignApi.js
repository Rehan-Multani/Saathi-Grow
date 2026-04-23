import { API_BASE_URL } from '../../../config/apiConfig';

const CAMPAIGNS_API_BASE_URL = `${API_BASE_URL}/admin/campaigns`;

export const getCampaigns = async (token) => {
  const response = await fetch(`${CAMPAIGNS_API_BASE_URL}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch campaigns');
  }
  return data;
};

export const createCampaign = async (token, campaignData) => {
  const response = await fetch(`${CAMPAIGNS_API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create campaign');
  }
  return data;
};

export const updateCampaign = async (token, id, campaignData) => {
  const response = await fetch(`${CAMPAIGNS_API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update campaign');
  }
  return data;
};

export const deleteCampaign = async (token, id) => {
  const response = await fetch(`${CAMPAIGNS_API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete campaign');
  }
  return data;
};

export const getCampaignById = async (token, id) => {
  const response = await fetch(`${CAMPAIGNS_API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch campaign details');
  }
  return data;
};
