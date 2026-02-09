import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle, Package, Truck, Clock, Eye, MoreVertical } from 'lucide-react';
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
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {/* Strict Desktop Header for alignment */}
                <div className="hidden md:grid grid-cols-12 px-5 py-3 bg-gray-50/30 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="col-span-4 pl-2">Customer & Details</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Amount</div>
                    <div className="col-span-1 text-center">View</div>
                    <div className="col-span-3 text-right pr-6">Management</div>
                </div>

                {filteredOrders.map((order) => {
                    const action = nextAction(order.status);
                    return (
                        <div key={order.id} className="grid grid-cols-1 md:grid-cols-12 px-5 py-4 items-center hover:bg-gray-50/50 transition-all">
                            {/* Col 1-4: Details */}
                            <div className="col-span-4 pl-2 space-y-1">
                                <span className="text-[10px] font-black text-[#0c831f] tracking-tight bg-green-50 px-2 py-0.5 rounded border border-green-100">#{order.id}</span>
                                <h3 className="text-sm font-extrabold text-gray-900 leading-none mt-1">{order.customer}</h3>
                                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px]">
                                    <span className="flex items-center gap-1"><Clock size={10} /> {order.time}</span>
                                    <span>•</span>
                                    <span>{order.items} Items</span>
                                </div>
                            </div>

                            {/* Col 5-6: Status (Strict Center) */}
                            <div className="col-span-2 flex justify-center">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-tight uppercase ${statusColors[order.status] || 'bg-gray-100'}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Col 7-8: Price (Strict Center) */}
                            <div className="col-span-2 flex justify-center">
                                <p className="text-base font-black text-gray-900 tracking-tight">
                                    {formatCurrency(order.total)}
                                </p>
                            </div>

                            {/* Col 9: Eye Icon (Strict Center) */}
                            <div className="col-span-1 flex justify-center">
                                <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-lg bg-white hover:shadow-sm transition-all">
                                    <Eye size={16} />
                                </button>
                            </div>

                            {/* Col 10-12: Action Button (Strict Right) */}
                            <div className="col-span-3 flex justify-end pr-4">
                                {action ? (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, action.next)}
                                        className="px-4 py-2 bg-[#0c831f] text-white text-[11px] font-black rounded-lg hover:bg-[#0a6b19] flex items-center gap-2 shadow-sm active:scale-95 transition-all w-full max-w-[130px] justify-center"
                                    >
                                        <action.icon size={13} />
                                        {action.label}
                                    </button>
                                ) : (
                                    <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                )}
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
