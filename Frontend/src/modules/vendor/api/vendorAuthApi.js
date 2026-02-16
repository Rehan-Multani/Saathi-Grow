const API_BASE_URL = 'http://localhost:5000/api/vendors';

export const vendorLogin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const vendorRegister = async (vendorData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const getVendorProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data;
};

export const updateVendorProfile = async (token, vendorData) => {
  const isFormData = vendorData instanceof FormData;
  const headers = { 'Authorization': `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers,
    body: isFormData ? vendorData : JSON.stringify(vendorData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
};
