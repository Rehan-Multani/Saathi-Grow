import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';

const API_URL = `${API_BASE_URL}/vendors/wallet`;
const BANK_URL = `${API_BASE_URL}/vendors/bank-account`;

// ── Wallet ────────────────────────────────────────────────────────────────

export const getVendorWallet = async (token, page = 1, limit = 10) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, config);
  return data;
};

export const getVendorWalletStats = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(`${API_URL}/stats`, config);
  return data;
};

// ── Withdrawal ────────────────────────────────────────────────────────────

export const requestWithdrawal = async (token, amount) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.post(`${API_URL}/withdraw`, { amount }, config);
  return data;
};

export const getWithdrawalRequests = async (token, page = 1, limit = 10) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(`${API_URL}/withdrawals?page=${page}&limit=${limit}`, config);
  return data;
};

// ── Bank Account ──────────────────────────────────────────────────────────

export const getBankAccount = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(BANK_URL, config);
  return data; // { bankAccount }
};

export const saveBankAccount = async (token, accountData) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.put(BANK_URL, accountData, config);
  return data; // { success, bankAccount }
};

export const deleteBankAccount = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.delete(BANK_URL, config);
  return data;
};
