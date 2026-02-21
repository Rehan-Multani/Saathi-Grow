const API_URL = 'http://localhost:5000/api/user/cart';

export const getCart = async (token) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch cart');
  return data;
};

export const syncCart = async (token, cartItems) => {
  const response = await fetch(`${API_URL}/sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cartItems })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to sync cart');
  return data;
};
