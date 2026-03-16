import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search, Eye, Filter, Download, Store, Upload, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, deleteOrder, updateOrderStatus } from '../../api/orderApi';
import { getDeliverySlots } from '../../api/deliverySlotApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const OrderStatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const variants = {
        delivered: 'bg-green-100 text-green-700',
        pending: 'bg-amber-100 text-amber-700',
        preparing: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-cyan-100 text-cyan-700',
        out_for_delivery: 'bg-indigo-100 text-indigo-700',
        cancelled: 'bg-red-100 text-red-700',
        return_requested: 'bg-orange-100 text-orange-700',
        returned: 'bg-gray-100 text-gray-700',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'} whitespace-nowrap uppercase`}>
            {t(`dashboard.order_status.${status}`, { defaultValue: status.replace(/_/g, ' ') })}
        </span>
    );
};

const AllOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { adminUser } = useAdminAuth();

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
        setOrderSourceFilter(source || '');
        if (source) {
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
            Swal.fire(t('common.error'), t('dashboard.failed_to_load_orders'), 'error');
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
            title: t('dashboard.are_you_sure'),
            text: t('dashboard.delete_order_warning'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('dashboard.yes_delete_it')
        });

        if (result.isConfirmed) {
            try {
                await deleteOrder(orderId);
                toast.success(t('dashboard.order_deleted_success'));
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || t('dashboard.failed_to_delete_order'));
            }
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const isAdmin = adminUser?.role === 'Admin';
        
        const adminOptions = {
            pending: t('dashboard.order_status.pending'),
            confirmed: t('dashboard.order_status.confirmed'),
            preparing: t('dashboard.order_status.preparing'),
            ready_for_pickup: t('dashboard.order_status.ready_for_pickup'),
            out_for_delivery: t('dashboard.order_status.out_for_delivery'),
            delivered: t('dashboard.order_status.delivered'),
            cancelled: t('dashboard.order_status.cancelled')
        };

        const staffOptions = {
            preparing: `${t('dashboard.order_status.preparing')} (${t('dashboard.order_status.packing')})`,
            ready_for_pickup: t('dashboard.order_status.ready_for_pickup'),
            cancelled: t('dashboard.order_status.cancelled')
        };

        const { value: status } = await Swal.fire({
            title: t('dashboard.update_order_status'),
            input: 'select',
            inputOptions: isAdmin ? adminOptions : staffOptions,
            inputPlaceholder: t('dashboard.select_status_placeholder'),
            showCancelButton: true,
            inputValue: currentStatus
        });

        if (status) {
            try {
                await updateOrderStatus(orderId, status);
                toast.success(t('dashboard.status_updated_success'));
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || t('dashboard.failed_to_update_status'));
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
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
                                    placeholder={t('dashboard.search_orders_placeholder')}
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
                                className={`w-full flex justify-center items-center gap-2 px-4 py-2 bg-white border ${showFilterMenu || activeFiltersCount > 0 ? 'border-violet-500 text-violet-600 bg-violet-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span>{t('dashboard.filters')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-12 right-0 left-0 sm:left-auto z-20 w-full sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-in fade-in zoom-in-95 duration-200">
                                    <h6 className="font-black text-gray-800 mb-4 text-sm flex justify-between items-center uppercase tracking-wider">
                                        {t('dashboard.advanced_filters')}
                                        {activeFiltersCount > 0 && (
                                            <button onClick={clearFilters} className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest">{t('dashboard.clear_all')}</button>
                                        )}
                                    </h6>

                                    <div className="space-y-4 text-start">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.order_status_label', { defaultValue: 'Order Status' })}</label>
                                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
                                                <option value="">{t('dashboard.all_status')}</option>
                                                <option value="pending">{t('dashboard.order_status.pending')}</option>
                                                <option value="confirmed">{t('dashboard.order_status.confirmed')}</option>
                                                <option value="preparing">{t('dashboard.order_status.preparing')}</option>
                                                <option value="out_for_delivery">{t('dashboard.order_status.out_for_delivery')}</option>
                                                <option value="delivered">{t('dashboard.order_status.delivered')}</option>
                                                <option value="cancelled">{t('dashboard.order_status.cancelled')}</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.payment_method')}</label>
                                                <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={paymentMethodFilter} onChange={handleFilterChange(setPaymentMethodFilter)}>
                                                    <option value="">{t('dashboard.all_methods')}</option>
                                                    <option value="cod">COD</option>
                                                    <option value="online">Online</option>
                                                    <option value="wallet">Wallet</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.payment_status')}</label>
                                                <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={paymentStatusFilter} onChange={handleFilterChange(setPaymentStatusFilter)}>
                                                    <option value="">{t('dashboard.all_payment_status')}</option>
                                                    <option value="pending">{t('dashboard.order_status.pending')}</option>
                                                    <option value="paid">{t('dashboard.order_status.paid')}</option>
                                                    <option value="failed">{t('dashboard.order_status.failed')}</option>
                                                    <option value="refunded">{t('dashboard.order_status.refunded')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.start_date')}</label>
                                                <input type="date" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={startDate} onChange={handleFilterChange(setStartDate)} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.end_date')}</label>
                                                <input type="date" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-violet-500 block w-full p-2 outline-none" value={endDate} onChange={handleFilterChange(setEndDate)} min={startDate} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">{t('dashboard.order_source')}</label>
                                            <select
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-violet-500 font-bold outline-none"
                                                value={orderSourceFilter}
                                                onChange={handleFilterChange(setOrderSourceFilter)}
                                            >
                                                <option value="">{t('dashboard.all_sources')}</option>
                                                <option value="online">{t('dashboard.channels.online')} ({t('dashboard.channels.online_desc')})</option>
                                                <option value="pos">{t('dashboard.channels.pos')} ({t('dashboard.channels.pos_desc')})</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">{t('dashboard.delivery_slot', { defaultValue: 'Delivery Slot' })}</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-violet-500 block w-full p-2 outline-none"
                                                value={deliverySlotFilter}
                                                onChange={handleFilterChange(setDeliverySlotFilter)}
                                            >
                                                <option value="">{t('dashboard.all_slots')}</option>
                                                <option value="immediate">{t('dashboard.immediate_delivery')}</option>
                                                {deliverySlots.map(slot => (
                                                    <option key={slot._id} value={slot._id}>{slot.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>
                                    <div className="mt-5">
                                        <button onClick={() => setShowFilterMenu(false)} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-violet-200 transition-all">{t('dashboard.apply_filters')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[650px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-5">{t('dashboard.order_id')}</th>
                                <th className="px-6 py-5">{t('dashboard.customer')}</th>
                                <th className="px-6 py-5">{t('dashboard.branch_vendor')}</th>
                                <th className="px-6 py-5">{t('dashboard.date')}</th>
                                <th className="px-6 py-5">{t('dashboard.payment')}</th>
                                <th className="px-6 py-5">{t('dashboard.status')}</th>
                                <th className="px-6 py-5 text-right">{t('dashboard.total_amount')}</th>
                                <th className="px-6 py-5 text-center">{t('dashboard.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4">
                                            <Spinner animation="border" variant="primary" size="sm" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('dashboard.loading_orders')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-black text-violet-600 text-sm tracking-tight">{order.orderId || order._id.slice(-8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{order.user?.name || order.posCustomer?.name || t('dashboard.guest')}</div>
                                        <div className="text-[10px] font-bold text-gray-400">
                                            {order.user?.email || order.user?.phone || order.posCustomer?.phone || order.posCustomer?.email || ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700 text-sm font-bold">
                                            <Store size={14} className="text-gray-300 shrink-0" />
                                            <span className="truncate max-w-[150px]">{order.branchId?.name || order.vendor?.storeName || t('dashboard.global')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        <div className="font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        {order.deliverySlot ? (
                                            <div className="text-[9px] font-black text-violet-500 uppercase tracking-tighter mt-1 bg-violet-50 inline-block px-1.5 py-0.5 rounded">
                                                {t('dashboard.slot_labels.slot_prefix')}: {order.deliverySlot}
                                            </div>
                                        ) : order.isImmediate && (
                                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded border border-emerald-100">
                                                {t('dashboard.slot_labels.slot_prefix')}: {t('dashboard.slot_labels.immediate')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {order.paymentMethod === 'online' && <span className="px-2 py-0.5 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 text-[9px] font-black tracking-widest uppercase">{t('dashboard.payment_methods.online')}</span>}
                                            {order.paymentMethod === 'cod' && <span className="px-2 py-0.5 rounded-lg border border-gray-100 bg-gray-50 text-gray-600 text-[9px] font-black tracking-widest uppercase">{t('dashboard.payment_methods.cod')}</span>}
                                            {order.paymentMethod === 'wallet' && <span className="px-2 py-0.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 text-[9px] font-black tracking-widest uppercase">{t('dashboard.payment_methods.wallet')}</span>}

                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black tracking-[0.2em] uppercase ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : order.paymentStatus === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {t(`dashboard.order_status.${order.paymentStatus || 'pending'}`, { defaultValue: order.paymentStatus || 'pending' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900">
                                        <div className="text-sm">₹{order.totalAmount}</div>
                                        {order.discountAmount > 0 && (
                                            <div className="text-[9px] text-rose-500 font-bold uppercase tracking-tight mt-0.5">
                                                -{order.discountAmount} ({order.promoCode})
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                                onClick={() => handleUpdateStatus(order._id, order.status)}
                                                title={t('dashboard.update_status_label')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                onClick={() => handleShowDetails(order)}
                                                title={t('dashboard.view_details_label')}
                                            >
                                                <Eye size={18} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                onClick={() => handleDeleteOrder(order._id)}
                                                title={t('dashboard.delete_order_label')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && orders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                                                <Search size={32} />
                                            </div>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('dashboard.no_matching_orders')}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-t border-gray-50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {t('dashboard.showing')} <span className="text-gray-900">{( (page - 1) * limit) + 1}</span> {t('dashboard.to')} <span className="text-gray-900">{Math.min(page * limit, pagination.total)}</span> {t('dashboard.of')} <span className="text-gray-900">{pagination.total}</span> {t('dashboard.orders_management')}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2.5 rounded-xl border-2 transition-all ${page === 1 ? 'border-gray-50 text-gray-200 cursor-not-allowed' : 'border-gray-100 text-gray-600 hover:border-violet-200 hover:bg-violet-50'}`}
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                            <div className="flex items-center gap-2">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    const isFirstPage = p === 1;
                                    const isLastPage = p === pagination.totalPages;
                                    const isNearCurrent = Math.abs(page - p) <= 1;

                                    if (isFirstPage || isLastPage || isNearCurrent) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${page === p ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-gray-300 font-black">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={`p-2.5 rounded-xl border-2 transition-all ${page === pagination.totalPages ? 'border-gray-50 text-gray-200 cursor-not-allowed' : 'border-gray-100 text-gray-600 hover:border-violet-200 hover:bg-violet-50'}`}
                            >
                                <ChevronRight size={18} strokeWidth={2.5} />
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
