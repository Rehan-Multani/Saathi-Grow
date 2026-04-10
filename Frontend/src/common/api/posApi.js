import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/pos`;

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;

  if (path.startsWith('/vendor')) {
    const vendor = localStorage.getItem('vendorUser');
    if (vendor) try { return JSON.parse(vendor).token; } catch (e) { }
  } else if (path.startsWith('/staff')) {
    const staff = localStorage.getItem('sathiGro_staff') || localStorage.getItem('saathigro_staff');
    if (staff) try { return JSON.parse(staff).token; } catch (e) { }
  } else if (path.startsWith('/store-manager')) {
    const manager = localStorage.getItem('sathiGro_manager') || localStorage.getItem('saathigro_manager');
    if (manager) try { return JSON.parse(manager).token; } catch (e) { }
  } else if (path.startsWith('/admin')) {
    const admin = localStorage.getItem('sathiGro_admin');
    if (admin) try { return JSON.parse(admin).token; } catch (e) { }
  }

  // Fallback if not matched by path
  const admin = localStorage.getItem('sathiGro_admin');
  const vendor = localStorage.getItem('vendorUser');
  const staff = localStorage.getItem('sathiGro_staff') || localStorage.getItem('saathigro_staff');
  const manager = localStorage.getItem('sathiGro_manager') || localStorage.getItem('saathigro_manager');

  if (admin) try { return JSON.parse(admin).token; } catch (e) { }
  if (vendor) try { return JSON.parse(vendor).token; } catch (e) { }
  if (staff) try { return JSON.parse(staff).token; } catch (e) { }
  if (manager) try { return JSON.parse(manager).token; } catch (e) { }
  return null;
};

export const getPOSAuthToken = () => getAuthToken();

/**
 * Create a POS Order
 * @param {Object} payload - { items, customerDetails, paymentMethod, storeId, storeType, razorpayDetails }
 * @param {String} explicitToken - Optional explicit token to use instead of extracting from localStorage
 */
export const createPOSOrder = async (payload, explicitToken = null) => {
  const token = explicitToken || getAuthToken();
  const { data } = await axios.post(`${API_URL}/create`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

/**
 * Fetch POS Orders with pagination and filters
 */
export const getPOSOrders = async (params = {}, explicitToken = null) => {
  const token = explicitToken || getAuthToken();
  const { data } = await axios.get(`${API_URL}/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return data;
};

/**
 * Search Products specifically for POS (usually needs live stock check)
 */
export const searchProductsPOS = async (query, searchParams = {}, explicitToken = null) => {
  const token = explicitToken || getAuthToken();
  const { data } = await axios.get(`${API_BASE_URL}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      search: query,
      limit: 100,
      ...searchParams
    }
  });
  return data;
};
