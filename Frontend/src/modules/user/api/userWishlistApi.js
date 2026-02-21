const API_URL = 'http://localhost:5000/api/user/wishlist';

export const getWishlist = async (token) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data;
};

export const addToWishlist = async (token, productId) => {
  const response = await fetch(`${API_URL}/${productId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add to wishlist');
  return data;
};

export const removeFromWishlist = async (token, productId) => {
  const response = await fetch(`${API_URL}/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data;
};
