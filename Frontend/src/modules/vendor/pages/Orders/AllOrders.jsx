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
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const statusColors = {
        'pending': 'text-amber-500 bg-amber-50 border-amber-100',
        'confirmed': 'text-amber-500 bg-amber-50 border-amber-100',
        'preparing': 'text-blue-500 bg-blue-50 border-blue-100',
        'ready_for_pickup': 'text-indigo-500 bg-indigo-50 border-indigo-100',
        'out_for_delivery': 'text-indigo-500 bg-indigo-50 border-indigo-100',
        'delivered': 'text-green-600 bg-green-50 border-green-100',
        'cancelled': 'text-red-500 bg-red-50 border-red-100'
    };

    const nextAction = (status) => {
        if (status === 'confirmed' || status === 'pending') return { label: 'Pack Order', next: 'preparing', icon: Package, color: 'bg-[#0c831f]' };
        if (status === 'preparing') return { label: 'Ready for Pickup', next: 'ready_for_pickup', icon: Truck, color: 'bg-blue-600' };
        return null;
    };

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filter === 'All' || o.status === filter.toLowerCase() || (filter === 'Pending' && (o.status === 'confirmed' || o.status === 'pending'));
        const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 overflow-x-hidden">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-40 transition-shadow shadow-sm">
                <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Order Management</h1>
                    <p className="text-xs text-gray-500 font-medium">Track and process all shop orders</p>
                </div>
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search order ID or customer name..."
                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0c831f] outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 lg:py-4">
                <div className="space-y-4 lg:space-y-4">
                    {/* Performance Tiles (Compact) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Pending', val: orders.filter(o => o.status === 'confirmed' || o.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'To Pack', val: orders.filter(o => o.status === 'preparing').length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Ready', val: orders.filter(o => o.status === 'ready_for_pickup').length, icon: Truck, color: 'text-[#0c831f]', bg: 'bg-green-50' },
                            { label: 'Revenue', val: formatCurrency(orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.totalAmount : sum, 0)), icon: DollarSign, color: 'text-gray-600', bg: 'bg-gray-100' }
                        ].map((s, i) => (
                            <div key={i} className="premium-card p-3 lg:p-3 flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{s.label}</p>
                                    <s.icon size={14} className={s.color} />
                                </div>
                                <h3 className="text-lg lg:text-xl font-extrabold text-gray-900 mt-1">{s.val}</h3>
                                <div className="mt-2 text-[10px] font-bold text-[#0c831f] flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-[#0c831f]" /> +5 today
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="premium-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px] flex flex-col">
                                {/* Header Row */}
                                <div className="flex items-center gap-4 p-3 bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm">
                                    <div className="w-28 shrink-0 pl-1">Order ID</div>
                                    <div className="flex-1 min-w-0 pl-1">Customer</div>
                                    <div className="w-28 shrink-0 hidden sm:block relative">
                                        <button
                                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                                            className={`flex items-center gap-1 hover:text-gray-900 transition-colors ${filter !== 'All' ? 'text-[#0c831f]' : ''}`}
                                        >
                                            {filter === 'All' ? 'Status' : filter} <ChevronDown size={12} className={`transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showStatusMenu && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                                                <div className="absolute top-full left-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 flex flex-col overflow-hidden">
                                                    {['All', 'Confirmed', 'Preparing', 'Ready_for_pickup', 'Out_for_delivery', 'Delivered', 'Cancelled'].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => {
                                                                setFilter(status);
                                                                setShowStatusMenu(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors ${filter === status ? 'text-[#0c831f] bg-green-50/30' : 'text-gray-600'}`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="w-24 shrink-0 text-right">Amount</div>
                                    <div className="w-10 shrink-0 text-center">View</div>
                                    <div className="w-32 shrink-0 text-center">Action</div>
                                </div>
                                {filteredOrders.map((order) => {
                                    const action = nextAction(order.status);
                                    return (
                                        <div
                                            key={order._id}
                                            onClick={() => navigate(`/vendor/orders/${order._id}`)}
                                            className="p-3 lg:p-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all flex items-center gap-4 group cursor-pointer"
                                        >
                                            {/* Order Identity */}
                                            <div className="w-28 shrink-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${['pending', 'confirmed'].includes(order.status) ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">#{order.orderId}</span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-900">{formatDate(order.createdAt)}</p>
                                            </div>

                                            {/* Customer Meta */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-[#0c831f] transition-colors">{order.shippingAddress?.name || order.user?.name || 'Customer'}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                        <MapPin size={10} /> {order.shippingAddress?.city || 'Delhi-NCR'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                        <Package size={10} /> {order.items?.length || 0} Items
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="w-28 shrink-0 hidden sm:block">
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusColors[order.status] || 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                                                    {order.status?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div className="w-24 shrink-0 text-right">
                                                <p className="text-sm font-extrabold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="w-10 shrink-0 flex justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/vendor/orders/${order._id}`);
                                                    }}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-sm md:shadow-none bg-gray-50/50"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                            <div className="w-32 shrink-0 flex justify-center">
                                                {action ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateOrderStatus(order._id, action.next);
                                                        }}
                                                        className={`h-7 w-full ${action.color} text-white text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5`}
                                                    >
                                                        <action.icon size={12} /> {action.label}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
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
