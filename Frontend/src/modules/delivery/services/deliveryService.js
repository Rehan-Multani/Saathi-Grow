const API_URL = 'http://localhost:5000/api/delivery';

const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

export const getDeliveryProfile = async (token) => {
    const response = await fetch(`${API_URL}/profile`, {
        headers: getHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
};

export const updateDeliveryProfile = async (token, profileData) => {
    const response = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
};

export const updatePartnerStatus = async (token, status) => {
    const response = await fetch(`${API_URL}/status`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update status');
    return data;
};

export const updatePartnerLocation = async (token, longitude, latitude) => {
    const response = await fetch(`${API_URL}/location`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ longitude, latitude })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update location');
    return data;
};

export const getDeliveryOrders = async (token, type = 'active') => {
    const response = await fetch(`${API_URL}/orders?type=${type}`, {
        headers: getHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
    return data;
};

export const updateDeliveryStatus = async (token, deliveryId, status) => {
    const response = await fetch(`${API_URL}/orders/${deliveryId}/status`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update delivery status');
    return data;
};

export const getWalletTransactions = async (token) => {
    const response = await fetch(`${API_URL}/wallet`, {
        headers: getHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch wallet info');
    return data;
};

export const getDashboardStats = async (token) => {
    const response = await fetch(`${API_URL}/stats`, {
        headers: getHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
};

export const simulateOrder = async (token) => {
    const response = await fetch(`${API_URL}/simulate-order`, {
        method: 'POST',
        headers: getHeaders(token)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to simulate order');
    return data;
};
