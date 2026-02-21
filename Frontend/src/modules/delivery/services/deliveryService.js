import {
    mockProfile,
    mockOrders,
    mockHistory,
    mockWallet,
    mockTransactions,
    createDummyOrder,
} from '../data/mockDeliveryData';

let profile = JSON.parse(JSON.stringify(mockProfile));
let orders = JSON.parse(JSON.stringify(mockOrders));
let history = JSON.parse(JSON.stringify(mockHistory));
let wallet = JSON.parse(JSON.stringify(mockWallet));
let transactions = JSON.parse(JSON.stringify(mockTransactions));

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => {
    if (value === undefined || value === null) return value;
    return JSON.parse(JSON.stringify(value));
};

export const getDeliveryProfile = async () => {
    await wait();
    return clone(profile);
};

export const updateDeliveryProfile = async (_token, profileData) => {
    await wait();
    profile = { ...profile, ...profileData };
    return clone(profile);
};

export const updatePartnerStatus = async (_token, status) => {
    await wait();
    profile = { ...profile, status };
    return clone(profile);
};

export const updatePartnerLocation = async (_token, longitude, latitude) => {
    await wait();
    profile = {
        ...profile,
        currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude],
        },
    };
    return clone(profile.currentLocation);
};

export const getDeliveryOrders = async (_token, type = 'active') => {
    await wait();
    if (type === 'history' || type === 'completed') return clone(history);
    if (type === 'pending') return clone(orders.filter((order) => order.status === 'assigned'));
    return clone(orders);
};

export const updateDeliveryStatus = async (_token, deliveryId, status) => {
    await wait();
    orders = orders.map((order) => (order._id === deliveryId ? { ...order, status } : order));
    return clone(orders.find((order) => order._id === deliveryId) || null);
};

export const getWalletTransactions = async () => {
    await wait();
    return { wallet: clone(wallet), transactions: clone(transactions) };
};

export const getDashboardStats = async () => {
    await wait();
    const today = new Date().toDateString();
    const todayCredits = transactions.filter((tx) => tx.type === 'credit' && new Date(tx.createdAt).toDateString() === today);

    return {
        walletBalance: wallet.balance,
        totalEarnings: wallet.totalEarnings,
        todayEarnings: todayCredits.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
        activeOrders: orders.length,
        pendingOrders: orders.filter((order) => order.status === 'assigned').length,
        todayDeliveries: history.filter((order) => new Date(order.createdAt).toDateString() === today).length,
    };
};

export const simulateOrder = async () => {
    await wait();
    const order = createDummyOrder();
    orders = [order, ...orders];
    return clone(order);
};
