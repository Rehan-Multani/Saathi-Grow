import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, CheckCircle, Package, Truck, Clock, Filter, Eye, MoreVertical, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency, formatDate } from '../../utils/formatDate';

const AllOrders = () => {
    const { orders, updateOrderStatus } = useVendor();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const statusColors = {
        'Pending': 'text-amber-500 bg-amber-50 border-amber-100',
        'Packing': 'text-blue-500 bg-blue-50 border-blue-100',
        'Dispatched': 'text-indigo-500 bg-indigo-50 border-indigo-100',
        'Delivered': 'text-green-600 bg-green-50 border-green-100'
    };

    const nextAction = (status) => {
        if (status === 'Pending') return { label: 'Pack Order', next: 'Packing', icon: Package, color: 'bg-[#0c831f]' };
        if (status === 'Packing') return { label: 'Dispatch', next: 'Dispatched', icon: Truck, color: 'bg-blue-600' };
        return null;
    };

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filter === 'All' || o.status === filter;
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 overflow-x-hidden">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 transition-shadow shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Order Management</h1>
                    <p className="text-xs text-gray-500 font-medium">Track and process all shop orders</p>
                </div>
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search order ID or customer name..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0c831f] outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="space-y-6">
                    {/* Performance Tiles (Compact) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Pending', val: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'To Pack', val: orders.filter(o => o.status === 'Packing').length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'In Transit', val: orders.filter(o => o.status === 'Dispatched').length, icon: Truck, color: 'text-[#0c831f]', bg: 'bg-green-50' },
                            { label: 'Revenue', val: formatCurrency(orders.reduce((sum, o) => sum + o.total, 0)), icon: DollarSign, color: 'text-gray-600', bg: 'bg-gray-100' }
                        ].map((s, i) => (
                            <div key={i} className="premium-card p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{s.label}</p>
                                    <s.icon size={14} className={s.color} />
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mt-1">{s.val}</h3>
                                <div className="mt-2 text-[10px] font-bold text-[#0c831f] flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-[#0c831f]" /> +5 today
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="premium-card overflow-hidden">
                        {/* Tabs Navigation */}
                        <div className="px-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex gap-6 overflow-x-auto no-scrollbar pt-1">
                                {['All', 'Pending', 'Packing', 'Dispatched', 'Delivered'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`relative py-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === status
                                            ? 'text-[#0c831f]'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {status}
                                        {filter === status && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0c831f] rounded-full" />}
                                    </button>
                                ))}
                            </div>
                            <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors pb-4 sm:pb-0">
                                <Calendar size={14} /> Filter Date <ChevronDown size={14} />
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px] flex flex-col">
                                {filteredOrders.map((order) => {
                                    const action = nextAction(order.status);
                                    return (
                                        <div
                                            key={order.id}
                                            onClick={() => navigate(`/vendor/orders/${order.id}`)}
                                            className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all flex items-center gap-6 group cursor-pointer"
                                        >
                                            {/* Order Identity */}
                                            <div className="w-32 shrink-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Pending' ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">#{order.id}</span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-900">{order.time}</p>
                                            </div>

                                            {/* Customer Meta */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0c831f] transition-colors">{order.customer}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        <MapPin size={10} /> Delhi-NCR
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        <Package size={10} /> {order.items} Items
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="w-32 shrink-0">
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusColors[order.status] || 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div className="w-24 shrink-0 text-right">
                                                <p className="text-sm font-extrabold text-gray-900">{formatCurrency(order.total)}</p>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/vendor/orders/${order.id}`);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-sm md:shadow-none"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {action ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateOrderStatus(order.id, action.next);
                                                        }}
                                                        className={`px-4 py-2 ${action.color} text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5`}
                                                    >
                                                        <action.icon size={12} /> {action.label}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredOrders.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                                        <Package size={32} className="text-gray-200 mb-3" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching orders found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllOrders;
