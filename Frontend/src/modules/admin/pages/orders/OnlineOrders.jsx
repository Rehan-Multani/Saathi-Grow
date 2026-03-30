import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Eye, Filter, Clock, CreditCard, Store, Zap,
    ChevronLeft, ChevronRight, RefreshCw, IndianRupee, TrendingUp
} from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, updateOrderStatus } from '../../api/orderApi';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const OrderStatusBadge = ({ status }) => {
    const { t, i18n } = useTranslation();
    const map = {
        delivered: { cls: 'bg-green-100 text-green-700 border-green-200' },
        pending: { cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        preparing: { cls: 'bg-blue-100 text-blue-700 border-blue-200' },
        confirmed: { cls: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
        out_for_delivery: { cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        cancelled: { cls: 'bg-red-100 text-red-700 border-red-200' },
        return_requested: { cls: 'bg-orange-100 text-orange-700 border-orange-200' },
        returned: { cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    };
    const s = map[status] || { cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls} whitespace-nowrap`}>
            {t(`dashboard.order_status.${status}`, { defaultValue: status })}
        </span>
    );
};

const PaymentStatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const cls = status === 'paid'
        ? 'bg-green-100 text-green-700'
        : status === 'failed'
            ? 'bg-red-100 text-red-700'
            : 'bg-amber-100 text-amber-700';
    return (
        <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${cls}`}>
            {t(`dashboard.payment_status.${status}`, { defaultValue: status || 'pending' })}
        </span>
    );
};

const OnlineOrders = () => {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Summary stats
    const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 });

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: debouncedSearch,
                paymentMethod: 'online',   // 🔒 Always filter to Razorpay/online orders
                orderSource: 'online',     // 🔒 Exclude POS orders from digital inflow
                status: statusFilter,
                paymentStatus: paymentStatusFilter,
                startDate,
                endDate
            };
            const data = await getAllOrdersAdmin(params);
            if (data?.orders) {
                setOrders(data.orders);
                setPagination(data.pagination || { total: 0, totalPages: 1 });

                // Use backend-computed aggregate stats (full dataset, not just current page)
                const s = data.stats || {};
                setStats({
                    total: s.totalOrders ?? data.pagination?.total ?? data.orders.length,
                    paid: s.totalPaid ?? 0,
                    pending: s.totalPendingPayment ?? 0,
                    revenue: s.totalRevenue ?? 0
                });
            }
        } catch (err) {
            console.error('OnlineOrders fetch error:', err);
            toast.error(t('orders.online.alerts.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, debouncedSearch, statusFilter, paymentStatusFilter, startDate, endDate]);

    const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

    const clearFilters = () => {
        setStatusFilter(''); setPaymentStatusFilter('');
        setStartDate(''); setEndDate('');
        setSearchTerm(''); setPage(1);
        setShowFilterMenu(false);
    };

    const activeFiltersCount = [statusFilter, paymentStatusFilter, startDate, endDate].filter(Boolean).length;

    const handleShowDetails = (order) => { setSelectedOrder(order); setShowModal(true); };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const { value: status } = await Swal.fire({
            title: t('dashboard.update_order_status'),
            input: 'select',
            inputOptions: {
                pending: t('dashboard.order_status.pending'), 
                preparing: t('dashboard.order_status.preparing'), 
                confirmed: t('dashboard.order_status.confirmed'),
                out_for_delivery: t('dashboard.order_status.out_for_delivery'), 
                delivered: t('dashboard.order_status.delivered'), 
                cancelled: t('dashboard.order_status.cancelled')
            },
            inputPlaceholder: t('dashboard.select_status_placeholder'),
            showCancelButton: true,
            inputValue: currentStatus,
            confirmButtonColor: '#7c3aed'
        });
        if (status) {
            try {
                await updateOrderStatus(orderId, status);
                toast.success(t('orders.online.alerts.status_updated'));
                fetchOrders();
            } catch (e) {
                toast.error(e.response?.data?.message || t('dashboard.failed_to_update_status'));
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('orders.online.title')}</h1>
                <PageInfoTooltip info={pageInfoData.onlineOrders} />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: t('orders.online.stats.total_online'), value: stats.total, icon: <Zap size={18} />, color: 'blue' },
                    { label: t('orders.online.stats.paid_orders'), value: stats.paid, icon: <CreditCard size={18} />, color: 'green' },
                    { label: t('orders.online.stats.pending_payment'), value: stats.pending, icon: <Clock size={18} />, color: 'amber' },
                    { label: t('orders.online.stats.total_revenue'), value: `₹${Number(stats.revenue).toFixed(2)}`, icon: <IndianRupee size={18} />, color: 'violet' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-${s.color}-50 text-${s.color}-600 shrink-0`}>
                            {s.icon}
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                            <div className="text-lg font-bold text-gray-800">{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4">
                <div className="flex flex-col xl:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3 mb-2 xl:mb-0">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h5 className="mb-0 font-bold text-gray-800 text-base leading-none">{t('orders.online.title')}</h5>
                                <span className="text-[11px] text-blue-600 font-semibold">{t('orders.online.subtitle')}</span>
                            </div>
                        </div>
                        <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {t('orders.online.order_count', { count: pagination.total || 0 })}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full xl:flex-1 xl:justify-end">
                        {/* Search */}
                        <div className="w-full md:max-w-sm">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                <div className="pl-3 text-gray-400"><Search size={18} /></div>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                    placeholder={t('orders.online.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center justify-center gap-2 px-4 py-2 bg-white border ${activeFiltersCount > 0 ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span>{t('orders.online.filters.btn')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-12 right-0 z-20 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h6 className="font-bold text-gray-800 text-sm">{t('orders.online.filters.title')}</h6>
                                        {activeFiltersCount > 0 && (
                                            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">{t('dashboard.clear_all')}</button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">{t('dashboard.order_status_label', { defaultValue: 'Order Status' })}</label>
                                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block w-full p-2 outline-none" value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
                                                <option value="">{t('orders.online.filters.all_status')}</option>
                                                <option value="pending">{t('dashboard.order_status.pending')}</option>
                                                <option value="confirmed">{t('dashboard.order_status.confirmed')}</option>
                                                <option value="preparing">{t('dashboard.order_status.preparing')}</option>
                                                <option value="out_for_delivery">{t('dashboard.order_status.out_for_delivery')}</option>
                                                <option value="delivered">{t('dashboard.order_status.delivered')}</option>
                                                <option value="cancelled">{t('dashboard.order_status.cancelled')}</option>
                                                <option value="return_requested">{t('dashboard.order_status.return_requested')}</option>
                                                <option value="returned">{t('dashboard.order_status.returned')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">{t('dashboard.payment_status')}</label>
                                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block w-full p-2 outline-none" value={paymentStatusFilter} onChange={handleFilterChange(setPaymentStatusFilter)}>
                                                <option value="">{t('orders.online.filters.all_payment_status')}</option>
                                                <option value="paid">{t('dashboard.payment_status.paid')}</option>
                                                <option value="pending">{t('dashboard.payment_status.pending')}</option>
                                                <option value="failed">{t('dashboard.payment_status.failed')}</option>
                                                <option value="refunded">{t('dashboard.payment_status.refunded', { defaultValue: 'Refunded' })}</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">{t('orders.online.filters.from_date')}</label>
                                                <input type="date" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block w-full p-2 outline-none" value={startDate} onChange={handleFilterChange(setStartDate)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">{t('orders.online.filters.to_date')}</label>
                                                <input type="date" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block w-full p-2 outline-none" value={endDate} onChange={handleFilterChange(setEndDate)} min={startDate} />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowFilterMenu(false)} className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                                        {t('orders.online.filters.apply')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">{t('dashboard.order_id')}</th>
                                <th className="px-6 py-4">{t('dashboard.customer')}</th>
                                <th className="px-6 py-4">{t('dashboard.branch_store_label', { defaultValue: 'Branch / Store' })}</th>
                                <th className="px-6 py-4">{t('dashboard.date')}</th>
                                <th className="px-6 py-4 text-center">{t('orders.online.table.razorpay')}</th>
                                <th className="px-6 py-4 text-center">{t('dashboard.status')}</th>
                                <th className="px-6 py-4 text-right">{t('dashboard.amount')}</th>
                                <th className="px-6 py-4 text-center">{t('dashboard.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-20">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2 text-muted uppercase font-bold text-xs tracking-widest">{t('dashboard.loading_orders', { defaultValue: 'Loading online orders...' })}</span>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-16">
                                        <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">{t('orders.online.empty.no_orders')}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {activeFiltersCount > 0 ? t('orders.online.empty.adjust_filters') : t('orders.online.empty.razorpay_msg')}
                                        </p>
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    {/* Order ID */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-blue-600 font-mono text-sm">
                                                {order.orderId || `#${order._id.slice(-8).toUpperCase()}`}
                                            </span>
                                            {order.razorpayPaymentId && (
                                                <span className="text-[10px] text-gray-400 font-mono truncate max-w-[110px]" title={order.razorpayPaymentId}>
                                                    rzp: {order.razorpayPaymentId.slice(-8)}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{order.user?.name || t('dashboard.guest')}</div>
                                        <div className="text-xs text-gray-400">{order.user?.phone || order.user?.email || '—'}</div>
                                    </td>

                                    {/* Branch / Vendor */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                            <Store size={13} className="text-gray-400 shrink-0" />
                                            <span className="truncate max-w-[130px]">
                                                {order.branchId?.name || order.vendor?.storeName || t('dashboard.global')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {new Date(order.createdAt).toLocaleTimeString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {order.deliverySlot && (
                                            <div className="text-[10px] font-bold text-blue-600 mt-0.5">
                                                🕐 {order.deliverySlot}
                                            </div>
                                        )}
                                    </td>

                                    {/* Razorpay Payment Info */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                                                <Zap size={9} /> {t('orders.online.table.razorpay')}
                                            </span>
                                            <PaymentStatusBadge status={order.paymentStatus} />
                                        </div>
                                    </td>

                                    {/* Order Status */}
                                    <td className="px-6 py-4 text-center">
                                        <OrderStatusBadge status={order.status} />
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-gray-800">₹{order.totalAmount?.toFixed(2)}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-3">
                                            <button
                                                className="p-1.5 rounded-lg bg-violet-50 text-violet-500 hover:bg-violet-100 transition-colors"
                                                onClick={() => handleUpdateStatus(order._id, order.status)}
                                                title={t('dashboard.update_status_label', { defaultValue: 'Update Status' })}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                            </button>
                                            <button
                                                className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                                onClick={() => handleShowDetails(order)}
                                                title={t('dashboard.view_details_label', { defaultValue: 'View Details' })}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            {t('orders.returns.pagination.showing', { defaultValue: 'Showing' })} <span className="font-semibold text-gray-700">{((page - 1) * limit) + 1}</span>–<span className="font-semibold text-gray-700">{Math.min(page * limit, pagination.total)}</span> {t('orders.returns.pagination.of')} <span className="font-semibold text-gray-700">{pagination.total}</span> {t('orders.online.title').toLowerCase()}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border ${page === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-gray-400 px-1">…</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={`p-2 rounded-lg border ${page === pagination.totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`}
                            >
                                <ChevronRight size={18} />
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

export default OnlineOrders;
