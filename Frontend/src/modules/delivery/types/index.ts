export interface User {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    profileImage?: string;
    role: 'user' | 'admin' | 'staff' | 'rider';
}

export interface Location {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface DeliveryPartner {
    _id: string;
    user: string | User;
    status: 'online' | 'offline' | 'busy';
    vehicleType: 'bike' | 'scooter' | 'cycle' | 'car';
    vehicleNumber: string;
    currentLocation: Location;
    serviceArea: {
        radius: number;
        center: Location;
    };
    totalEarnings: number;
    walletBalance: number;
    isActive: boolean;
    isVerified: boolean;
}

export interface Order {
    _id: string;
    orderId: string;
    user: User;
    totalAmount: number;
    status: string;
    paymentMethod: 'cod' | 'online';
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        location: Location;
    };
}

export interface OrderDelivery {
    _id: string;
    order: Order;
    deliveryPartner?: string | DeliveryPartner;
    status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'returned';
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    deliveryFee: number;
}

export interface Transaction {
    _id: string;
    amount: number;
    type: 'credit' | 'debit';
    category: string;
    status: string;
    description: string;
    createdAt: string;
}

export interface Wallet {
    balance: number;
    totalEarnings: number;
    pendingPayouts: number;
}
