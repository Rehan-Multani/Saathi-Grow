import { API_BASE_URL } from '../../config/apiConfig';

const getHeaders = () => {
  const admin = JSON.parse(localStorage.getItem('saathigro_admin'));
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${admin?.token}`
  };
};

export const fetchAllLegalPages = async () => {
  const response = await fetch(`${API_BASE_URL}/legal/admin`, {
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch legal pages');
  return data;
};

export const createLegalPage = async (pageData) => {
  const response = await fetch(`${API_BASE_URL}/legal/admin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(pageData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create legal page');
  return data;
};

export const updateLegalPage = async (id, pageData) => {
  const response = await fetch(`${API_BASE_URL}/legal/admin/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(pageData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update legal page');
  return data;
};

export const deleteLegalPage = async (id) => {
  const response = await fetch(`${API_BASE_URL}/legal/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete legal page');
  return data;
};
