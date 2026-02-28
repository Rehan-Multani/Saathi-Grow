const now = new Date();

const makeDate = (daysAgo = 0, minutesAgo = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setMinutes(date.getMinutes() - minutesAgo);
    return date.toISOString();
};

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const customerNames = ['Amit Sharma', 'Neha Verma', 'Rajesh Kumar', 'Anjali Singh', 'Priya Patel'];
const stores = ['Nature Fresh Mart', 'Spice Garden', 'Urban Grocery', 'Daily Basket', 'Green Leaf Store'];
const streets = ['Vijay Nagar', 'Palasia', 'MR-10 Road', 'Bhawarkuan', 'Annapurna Road'];
const cities = ['Indore', 'Indore', 'Indore', 'Indore', 'Indore'];
const itemSets = [
    ['Milk x2', 'Bread x1', 'Eggs x12'],
    ['Tomato x1kg', 'Onion x1kg', 'Potato x2kg'],
    ['Paneer x500g', 'Curd x1', 'Banana x6'],
    ['Rice 5kg x1', 'Oil 1L x1', 'Salt x1'],
];

export const createDummyOrder = () => {
    const id = `DLV-${Date.now().toString(36).toUpperCase()}`;
    const amount = Math.floor(Math.random() * 700) + 200;
    const fee = Math.floor(Math.random() * 30) + 35;
    const pickupLat = 22.725 + Math.random() * 0.03;
    const pickupLng = 75.86 + Math.random() * 0.03;
    const dropLat = pickupLat - 0.02 + Math.random() * 0.02;
    const dropLng = pickupLng + 0.01 + Math.random() * 0.02;

    return {
        _id: id,
        status: 'assigned',
        createdAt: new Date().toISOString(),
        deliveryFee: fee,
        customer: randomFrom(customerNames),
        restaurant: randomFrom(stores),
        distance: `${(Math.random() * 3 + 1.5).toFixed(1)} km`,
        fare: `₹${fee.toFixed(2)}`,
        time: `${Math.floor(Math.random() * 8) + 10}-${Math.floor(Math.random() * 8) + 16} mins`,
        items: randomFrom(itemSets),
        coords: {
            pickup: [pickupLat, pickupLng],
            delivery: [dropLat, dropLng],
        },
        order: {
            orderId: id.slice(-6),
            totalAmount: amount,
            shippingAddress: {
                street: randomFrom(streets),
                city: randomFrom(cities),
            },
        },
    };
};

export const mockProfile = {
    _id: 'partner-1',
    name: 'Rahul Kumar',
    status: 'online',
    vehicleNumber: 'MP09AB1234',
    currentLocation: {
        type: 'Point',
        coordinates: [75.8577, 22.7196],
    },
    serviceArea: {
        radius: 5,
    },
};

export const mockOrders = [
    {
        _id: 'DLV-ACT-1',
        status: 'assigned',
        createdAt: makeDate(0, 45),
        deliveryFee: 40,
        order: {
            orderId: 'SG9012',
            totalAmount: 760,
            shippingAddress: { street: 'Vijay Nagar', city: 'Indore' },
        },
    },
    {
        _id: 'DLV-ACT-2',
        status: 'picked_up',
        createdAt: makeDate(0, 18),
        deliveryFee: 52,
        order: {
            orderId: 'SG9021',
            totalAmount: 1120,
            shippingAddress: { street: 'Palasia', city: 'Indore' },
        },
    },
];

export const mockHistory = [
    {
        _id: 'DLV-HIS-1',
        status: 'delivered',
        createdAt: makeDate(1, 120),
        deliveryFee: 48,
        order: {
            orderId: 'SG8920',
            totalAmount: 860,
            shippingAddress: { street: 'Annapurna Road', city: 'Indore' },
        },
    },
    {
        _id: 'DLV-HIS-2',
        status: 'delivered',
        createdAt: makeDate(2, 60),
        deliveryFee: 42,
        order: {
            orderId: 'SG8834',
            totalAmount: 720,
            shippingAddress: { street: 'MR-10 Road', city: 'Indore' },
        },
    },
];

export const mockWallet = {
    balance: 2480.75,
    totalEarnings: 42650.5,
    pendingPayout: 860,
};

export const mockTransactions = [
    { _id: 'TX-1', type: 'credit', category: 'delivery_earning', amount: 52, status: 'completed', createdAt: makeDate(0, 15) },
    { _id: 'TX-2', type: 'credit', category: 'delivery_earning', amount: 40, status: 'completed', createdAt: makeDate(0, 80) },
    { _id: 'TX-3', type: 'debit', category: 'withdrawal', amount: 500, status: 'completed', createdAt: makeDate(1, 45) },
    { _id: 'TX-4', type: 'credit', category: 'delivery_earning', amount: 48, status: 'completed', createdAt: makeDate(1, 130) },
    { _id: 'TX-5', type: 'credit', category: 'delivery_earning', amount: 42, status: 'completed', createdAt: makeDate(2, 110) },
];
