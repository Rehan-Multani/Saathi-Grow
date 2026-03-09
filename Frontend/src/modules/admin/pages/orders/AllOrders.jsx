import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Eye, Filter, Download, Store, Upload, Clock } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, deleteOrder, updateOrderStatus } from '../../api/orderApi';
import { getDeliverySlots } from '../../api/deliverySlotApi';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const OrderStatusBadge = ({ status }) => {
    const variants = {
        delivered: 'bg-green-100 text-green-700',
        pending: 'bg-amber-100 text-amber-700',
        preparing: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-cyan-100 text-cyan-700',
        out_for_delivery: 'bg-indigo-100 text-indigo-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'} whitespace-nowrap uppercase`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Pagination & Filters State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    const [searchTerm, setSearchTerm] = useState('');
    // For debounced searching
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deliverySlotFilter, setDeliverySlotFilter] = useState('');
    const [orderSourceFilter, setOrderSourceFilter] = useState('');
    const [deliverySlots, setDeliverySlots] = useState([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const source = searchParams.get('source');
        if (source) {
            setOrderSourceFilter(source);
            setPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const data = await getDeliverySlots();
                setDeliverySlots(data);
            } catch (error) {
                console.error('Failed to fetch delivery slots:', error);
            }
        };
        fetchSlots();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter,
                paymentMethod: paymentMethodFilter,
                paymentStatus: paymentStatusFilter,
                startDate,
                endDate,
                orderSource: orderSourceFilter,
                ...(deliverySlotFilter && deliverySlotFilter !== 'immediate' ? { deliverySlotId: deliverySlotFilter } : {}),
                ...(deliverySlotFilter === 'immediate' ? { isImmediate: 'true' } : {})
            };
            const data = await getAllOrdersAdmin(params);
            if (data && data.orders) {
                setOrders(data.orders);
                setPagination(data.pagination);
            } else if (Array.isArray(data)) {
                // Fallback if array gets returned
                setOrders(data);
                setPagination({ total: data.length, totalPages: 1, limit, page: 1 });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            Swal.fire('Error', 'Could not load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, limit, debouncedSearch, statusFilter, paymentMethodFilter, paymentStatusFilter, startDate, endDate, deliverySlotFilter, orderSourceFilter]);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1); // Reset page on filter change
    };

    const clearFilters = () => {
        setStatusFilter('');
        setPaymentMethodFilter('');
        setPaymentStatusFilter('');
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
        setDeliverySlotFilter('');
        setOrderSourceFilter('');
        setPage(1);
        setShowFilterMenu(false);
    };

    const activeFiltersCount = [statusFilter, paymentMethodFilter, paymentStatusFilter, startDate, endDate, deliverySlotFilter, orderSourceFilter].filter(Boolean).length;

    const handleShowDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleDeleteOrder = async (orderId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this! All associated transactions will remain but order object will be wiped.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteOrder(orderId);
                toast.success('Order deleted successfully');
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete order');
            }
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const { value: status } = await Swal.fire({
            title: 'Update Order Status',
            input: 'select',
            inputOptions: {
                pending: 'Pending',
                preparing: 'Preparing',
                confirmed: 'Confirmed',
                out_for_delivery: 'Out for Delivery',
                delivered: 'Delivered',
                cancelled: 'Cancelled'
            },
            inputPlaceholder: 'Select a status',
            showCancelButton: true,
            inputValue: currentStatus
        });

        if (status) {
            try {
                await updateOrderStatus(orderId, status);
                toast.success('Status updated successfully');
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update status');
            }
        }
    };

    return (
        <div className="p-6">
            {/* Action Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col xl:flex-row justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-3 w-full xl:flex-1 relative">
                        <div className="w-full md:max-w-md text-start">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-all">
                                <div className="pl-3 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                    placeholder="Search Order ID, Customer Name, Email, Phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex w-full xl:w-auto gap-3">
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`w-full flex justify-center items-center gap-2 px-4 py-2 bg-white border ${showFilterMenu || activeFiltersCount > 0 ? 'border-violet-500 text-violet-600 bg-violet-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-12 right-0 left-0 sm:left-auto z-20 w-full sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-in fade-in zoom-in-95 duration-200">
                                    <h6 className="font-bold text-gray-800 mb-4 text-sm flex justify-between items-center">
                                        Advanced Filters
                                        {activeFiltersCount > 0 && (
                                            <button onClick={clearFilters} className="text-xs font-normal text-red-500 hover:text-red-700">Clear All</button>
                                        )}
                                    </h6>

                                    <div className="space-y-4 text-start">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Order Status</label>
                                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
                                                <option value="">All Statuses</option>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="out_for_delivery">Out for Delivery</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                                                <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={paymentMethodFilter} onChange={handleFilterChange(setPaymentMethodFilter)}>
                                                    <option value="">All Methods</option>
                                                    <option value="cod">COD</option>
                                                    <option value="online">Online</option>
                                                    <option value="wallet">Wallet</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
                                                <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={paymentStatusFilter} onChange={handleFilterChange(setPaymentStatusFilter)}>
                                                    <option value="">All Statuses</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                                <input type="date" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={startDate} onChange={handleFilterChange(setStartDate)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                                <input type="date" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={endDate} onChange={handleFilterChange(setEndDate)} min={startDate} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Order Source</label>
                                            <select
                                                className="w-full bg-gray-50 border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-violet-500 font-medium"
                                                value={orderSourceFilter}
                                                onChange={handleFilterChange(setOrderSourceFilter)}
                                            >
                                                <option value="">All Sources</option>
                                                <option value="online">Online (App/Web)</option>
                                                <option value="pos">POS (Walk-in)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Delivery Slot</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-violet-500 block w-full p-2 outline-none"
                                                value={deliverySlotFilter}
                                                onChange={handleFilterChange(setDeliverySlotFilter)}
                                            >
                                                <option value="">All Slots</option>
                                                <option value="immediate">Immediate Delivery (ASAP)</option>
                                                {deliverySlots.map(slot => (
                                                    <option key={slot._id} value={slot._id}>{slot.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>
                                    <div className="mt-5">
                                        <button onClick={() => setShowFilterMenu(false)} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Apply Filters</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={fetchOrders} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            <Clock size={18} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Branch/Vendor</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-20">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2 text-muted">Loading orders...</span>
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-violet-600">{order.orderId || order._id.slice(-8)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        <div>{order.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-muted">{order.user?.email || order.user?.phone || ''}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                            <Store size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate max-w-[150px]">{order.branchId?.name || order.vendor?.storeName || 'Global'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        {order.deliverySlot ? (
                                            <div className="text-[10px] font-black text-violet-600 uppercase tracking-tighter mt-0.5">
                                                Slot: {order.deliverySlot}
                                            </div>
                                        ) : order.isImmediate && (
                                            <div className="text-[10px] font-black text-violet-600 uppercase tracking-tighter mt-0.5">
                                                Slot: IMMEDIATE
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {order.paymentMethod === 'online' && <span className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">Online</span>}
                                            {order.paymentMethod === 'cod' && <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 text-[10px] font-bold tracking-wider uppercase">COD</span>}
                                            {order.paymentMethod === 'wallet' && <span className="px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700 text-[10px] font-bold tracking-wider uppercase">Wallet</span>}

                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.paymentStatus || 'pending'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">₹{order.totalAmount}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-3">
                                            <button
                                                className="p-1 text-violet-500 hover:text-violet-700 transition-colors"
                                                onClick={() => handleUpdateStatus(order._id, order.status)}
                                                title="Change Status"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            </button>
                                            <button
                                                className="p-1 text-gray-400 hover:text-violet-600 transition-colors"
                                                onClick={() => handleShowDetails(order)}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                onClick={() => handleDeleteOrder(order._id)}
                                                title="Delete Order"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && orders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No matching orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="bg-white border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{((page - 1) * limit) + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(page * limit, pagination.total)}</span> of <span className="font-semibold text-gray-700">{pagination.total}</span> orders
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border ${page === 1 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    // Complex pagination logic to show max 5 buttons securely
                                    const p = i + 1;
                                    if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-gray-400">...</span>
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={`p-2 rounded-lg border ${page === pagination.totalPages ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <OrderDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                order={selectedOrder}
                onOrderUpdate={fetchOrders}
            />
        </div>
    );
};

export default AllOrders;
