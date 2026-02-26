import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin/branches/my-branch`;

const getAuth = () => {
  const manager = localStorage.getItem('saathigro_manager');
  return manager ? JSON.parse(manager) : null;
};

export const getMyBranch = async () => {
  const auth = getAuth();
  if (!auth) throw new Error('Not Authenticated');
  const { data } = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};

export const updateMyBranch = async (branchData) => {
  const auth = getAuth();
  if (!auth) throw new Error('Not Authenticated');
  const { data } = await axios.put(API_URL, branchData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return data;
};
