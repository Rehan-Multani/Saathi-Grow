import React, { createContext, useContext, useState } from 'react';

const ReturnRequestsContext = createContext();

export const useReturnRequests = () => {
    const context = useContext(ReturnRequestsContext);
    if (!context) {
        throw new Error('useReturnRequests must be used within ReturnRequestsProvider');
    }
    return context;
};

export const ReturnRequestsProvider = ({ children }) => {
    const [returnRequests, setReturnRequests] = useState([
        // Initial dummy data - these will be replaced by actual user submissions
        {
            id: 1,
            orderId: 'ORD-001',
            customer: 'Rahul Sharma',
            product: 'Fresh Tomatoes (1kg)',
            reason: 'Damaged product',
            amount: 85,
            date: '2024-02-09',
            status: 'pending',
            images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
            description: 'Product was damaged during delivery. Package was torn and tomatoes were crushed.'
        },
        {
            id: 2,
            orderId: 'ORD-002',
            customer: 'Priya Singh',
            product: 'Organic Carrots (500g)',
            reason: 'Wrong item',
            amount: 65,
            date: '2024-02-08',
            status: 'approved',
            images: ['https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400'],
            description: 'Received different product than ordered',
            refundDate: '2024-02-09'
        },
    ]);

    // Function to add new return request from user module
    const addReturnRequest = (returnData) => {
        const newRequest = {
            id: returnRequests.length + 1,
            orderId: returnData.orderId,
            customer: returnData.customer || 'Customer',
            product: returnData.product || 'Product',
            reason: returnData.reason,
            amount: returnData.amount || 0,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            images: returnData.images || [],
            description: returnData.description
        };

        setReturnRequests(prev => [newRequest, ...prev]);
        return newRequest;
    };

    // Function to update return request status (for vendor)
    const updateReturnStatus = (requestId, status, additionalData = {}) => {
        setReturnRequests(prev => prev.map(req =>
            req.id === requestId
                ? { ...req, status, ...additionalData }
                : req
        ));
    };

    const value = {
        returnRequests,
        setReturnRequests,
        addReturnRequest,
        updateReturnStatus
    };

    return (
        <ReturnRequestsContext.Provider value={value}>
            {children}
        </ReturnRequestsContext.Provider>
    );
};
