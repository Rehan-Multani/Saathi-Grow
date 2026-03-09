import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, CheckCircle, Package, Truck, Clock, Filter, Eye, MoreVertical, MapPin, Calendar, DollarSign, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency, formatDate } from '../../utils/formatDate';

const AllOrders = () => {
    const { orders, updateOrderStatus } = useVendor();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    // Reset page to 1 on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filter === 'All' || o.status === filter.toLowerCase() || (filter === 'Pending' && (o.status === 'confirmed' || o.status === 'pending'));
        const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="space-y-4 lg:space-y-4 pb-20 md:pb-0">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-2 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Order Management</h1>
                    <p className="text-xs text-gray-500 font-medium">Track and process all shop orders</p>
                </div>
                <div className="relative flex-1 max-w-md w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search order ID or customer name..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Performance Tiles (Updated to match StockManagement style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Pending', val: orders.filter(o => o.status === 'confirmed' || o.status === 'pending').length, icon: Clock, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'To Pack', val: orders.filter(o => o.status === 'preparing').length, icon: Package, iconColor: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Ready', val: orders.filter(o => o.status === 'ready_for_pickup').length, icon: Truck, iconColor: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Revenue', val: formatCurrency(orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.totalAmount : sum, 0)), icon: DollarSign, iconColor: 'text-[#0c831f]', bg: 'bg-[#0c831f]/10' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${s.bg} ${s.iconColor}`}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</p>
                            <p className="text-lg font-extrabold text-gray-900">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider relative">
                                    <button
                                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                                        className={`flex items-center gap-1 hover:text-gray-900 transition-colors uppercase ${filter !== 'All' ? 'text-[#0c831f]' : ''}`}
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
                                </th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">View</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentOrders.map((order) => {
                                const action = nextAction(order.status);
                                return (
                                    <tr
                                        key={order._id}
                                        onClick={() => navigate(`/vendor/orders/${order._id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        {/* Order Identity */}
                                        <td className="px-4 py-3 lg:py-3">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${['pending', 'confirmed'].includes(order.status) ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">#{order.orderId}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900">{formatDate(order.createdAt)}</p>
                                        </td>

                                        {/* Customer Meta */}
                                        <td className="px-4 py-3 lg:py-3">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-[#0c831f] transition-colors">{order.shippingAddress?.name || order.user?.name || 'Customer'}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                                    <MapPin size={10} /> {order.shippingAddress?.city || 'Delhi-NCR'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                                    <Package size={10} /> {order.items?.length || 0} Items
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-4 py-3 lg:py-3 hidden sm:table-cell">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status] || 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                                                {order.status?.replace('_', ' ')}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-3 lg:py-3 text-right">
                                            <p className="text-sm font-extrabold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        </td>

                                        {/* Quick Actions */}
                                        <td className="px-4 py-3 lg:py-3 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/vendor/orders/${order._id}`);
                                                }}
                                                className="w-7 h-7 mx-auto flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-sm md:shadow-none bg-gray-50/50"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 lg:py-3">
                                            {action ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateOrderStatus(order._id, action.next);
                                                    }}
                                                    className={`h-7 px-3 w-full max-w-[120px] mx-auto ${action.color} text-white text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5`}
                                                >
                                                    <action.icon size={12} /> {action.label}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-7 h-7 mx-auto flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <Package size={32} className="text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching orders found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {true && (
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 gap-3 mt-4">
                    <span className="text-xs text-gray-500 font-medium">
                        Showing {filteredOrders.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-hide">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg border transition-all ${currentPage === 1 ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages || 1 }).map((_, i) => {
                                const pageNumber = i + 1;
                                // Condense rendering logic to show ends and neighborhood of current page
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === (totalPages || 1) ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === pageNumber
                                                    ? 'bg-[#0c831f] text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                } else if (
                                    pageNumber === currentPage - 2 ||
                                    pageNumber === currentPage + 2
                                ) {
                                    return <span key={pageNumber} className="text-gray-400 text-xs px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-1.5 rounded-lg border transition-all ${currentPage === totalPages || totalPages === 0 ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllOrders;
