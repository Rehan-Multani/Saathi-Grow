export const loginVendor = async (credentials) => {
    // Simulator
    return new Promise((resolve) => setTimeout(() => resolve({ token: 'vendor-123' }), 500));
};

export const registerVendor = async (data) => {
    return new Promise((resolve) => setTimeout(() => resolve({ token: 'vendor-123' }), 500));
};

export const isAuthenticated = () => {
    return localStorage.getItem('vendor_token') !== null; // Simple check
};
