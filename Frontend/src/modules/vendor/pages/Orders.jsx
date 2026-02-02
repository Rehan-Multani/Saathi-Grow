import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle, Package, Truck, Clock } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency, formatDate } from '../utils/formatDate';

const Orders = () => {
    const { orders, updateOrderStatus } = useVendor();
    const [filter, setFilter] = useState('All');

    const statusColors = {
        'Pending': 'bg-[#f7cb15]/20 text-[#7a640a]',
        'Packing': 'bg-blue-100 text-blue-700',
        'Dispatched': 'bg-green-100 text-green-700',
        'Delivered': 'bg-gray-100 text-gray-700'
    };

    const nextAction = (status) => {
        if (status === 'Pending') return { label: 'Accept & Pack', next: 'Packing', icon: Package };
        if (status === 'Packing') return { label: 'Dispatch', next: 'Dispatched', icon: Truck };
        return null;
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Orders</h1>
                    <p className="text-xs text-gray-500">Manage order fulfillment</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Pending', 'Packing', 'Dispatched'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === status
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => {
                    const action = nextAction(order.status);
                    return (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-sm text-gray-900">{order.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Clock size={10} /> {order.time}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-sm text-gray-800">{order.customer}</p>
                                    <p className="text-xs text-gray-500">{order.items} items</p>
                                </div>

                                {/* Amount & Actions */}
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                                        <p className="text-[10px] text-gray-400">Paid online</p>
                                    </div>

                                    {action && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, action.next)}
                                            className="px-4 py-2 bg-[#0c831f] text-white text-xs font-bold rounded-md hover:bg-[#0a6b19] flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                                        >
                                            <action.icon size={14} />
                                            {action.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-100 border-dashed">
                        <Package size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No {filter !== 'All' ? filter.toLowerCase() : ''} orders found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
