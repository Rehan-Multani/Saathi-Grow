const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/branches`;

export const getBranches = async (token) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch branches');
  return data;
};

export const createBranch = async (token, branchData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(branchData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create branch');
  return data;
};

export const updateBranch = async (token, id, branchData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(branchData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update branch');
  return data;
};

export const deleteBranch = async (token, id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete branch');
  return data;
};
