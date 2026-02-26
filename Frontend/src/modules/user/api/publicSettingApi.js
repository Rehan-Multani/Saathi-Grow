const API_URL = 'http://localhost:5000/api/settings/public';

export const getPublicSettings = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch public configurations');
  return data;
};
