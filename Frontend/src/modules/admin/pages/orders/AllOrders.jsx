import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Eye, Filter, Download, Store, Upload, Clock, ChevronLeft, ChevronRight, Zap, CreditCard, Calendar, Truck, Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OrderDetailsModal from '../../../../common/components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, deleteOrder, updateOrderStatus } from '../../api/orderApi';
import { getDeliverySlots } from '../../api/deliverySlotApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const OrderStatusBadge = ({ status, t }) => {
    const variants = {
        delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        preparing: 'bg-blue-50 text-blue-600 border-blue-100',
        confirmed: 'bg-cyan-50 text-cyan-600 border-cyan-100',
        out_for_delivery: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
        return_requested: 'bg-orange-50 text-orange-600 border-orange-100',
        returned: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${variants[status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            {t(`status.${status}`, status.replace(/_/g, ' '))}
        </span>
    );
};

const AllOrders = () => {
    const { t } = useTranslation(['admin_orders', 'common']);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { adminUser } = useAdminAuth();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    const [searchTerm, setSearchTerm] = useState('');
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
        if (source) setPage(1);
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
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
                setOrders(data);
                setPagination({ total: data.length, totalPages: 1, limit, page: 1 });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error(t('common:error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, limit, debouncedSearch, statusFilter, paymentMethodFilter, paymentStatusFilter, startDate, endDate, deliverySlotFilter, orderSourceFilter]);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1);
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
            title: t('actions.delete_confirm_title'),
            text: t('actions.delete_confirm_text', { id: orderId }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: t('common:yes_confirm'),
        });

        if (result.isConfirmed) {
            try {
                await deleteOrder(orderId);
                toast.success(t('actions.delete_success'));
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || t('common:error_occurred'));
            }
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const options = {
            pending: t('status.pending'),
            confirmed: t('status.confirmed'),
            preparing: t('status.preparing'),
            ready_for_pickup: t('filters.status.ready_for_pickup'),
            out_for_delivery: t('status.out_for_delivery'),
            delivered: t('status.delivered'),
            cancelled: t('status.cancelled')
        };

        const { value: status } = await Swal.fire({
            title: t('actions.update_status_title'),
            input: 'select',
            inputOptions: options,
            inputPlaceholder: t('actions.update_status_placeholder'),
            showCancelButton: true,
            inputValue: currentStatus,
        });

        if (status) {
            try {
                await updateOrderStatus(orderId, status);
                toast.success(t('actions.update_success'));
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || t('common:error_occurred'));
            }
        }
    };

    return (
        <div className="container-fluid px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                        <PageInfoTooltip data={pageInfoData.allOrders} />
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {t('total_count', { count: pagination.total })}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">{t('subtitle')}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Upload size={16} /> {t('batch')}
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                        <Download size={16} /> {t('export')}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                <div className="w-full lg:flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${activeFiltersCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} /> {t('filters.title')}
                            {activeFiltersCount > 0 && <span className="w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center text-[10px] ml-1">{activeFiltersCount}</span>}
                        </button>

                        {showFilterMenu && (
                            <div className="absolute top-12 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-5 z-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-900">{t('filters.title')}</h3>
                                    {activeFiltersCount > 0 && (
                                        <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-600">{t('filters.clear_all')}</button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">{t('filters.status.label')}</label>
                                        <select className="filter-select-simple" value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
                                            <option value="">{t('filters.status.all')}</option>
                                            {Object.keys(t('filters.status', { returnObjects: true })).filter(k => k !== 'label' && k !== 'all').map(key => (
                                                <option key={key} value={key}>{t(`filters.status.${key}`)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase">{t('filters.payment.label')}</label>
                                            <select className="filter-select-simple" value={paymentMethodFilter} onChange={handleFilterChange(setPaymentMethodFilter)}>
                                                <option value="">{t('filters.payment.all')}</option>
                                                <option value="cod">{t('filters.payment.cod')}</option>
                                                <option value="online">{t('filters.payment.online')}</option>
                                                <option value="wallet">{t('filters.payment.wallet')}</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase">{t('filters.p_status.label')}</label>
                                            <select className="filter-select-simple" value={paymentStatusFilter} onChange={handleFilterChange(setPaymentStatusFilter)}>
                                                <option value="">{t('filters.p_status.all')}</option>
                                                <option value="pending">{t('filters.p_status.pending')}</option>
                                                <option value="paid">{t('filters.p_status.paid')}</option>
                                                <option value="failed">{t('filters.p_status.failed')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowFilterMenu(false)}
                                        className="w-full py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-colors mt-2"
                                    >
                                        {t('filters.apply')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                                <th className="px-6 py-4">{t('table.id')}</th>
                                <th className="px-6 py-4">{t('table.customer')}</th>
                                <th className="px-6 py-4">{t('table.date')}</th>
                                <th className="px-6 py-4">{t('table.payment')}</th>
                                <th className="px-6 py-4">{t('table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('table.amount')}</th>
                                <th className="px-6 py-4 text-center">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="8" className="px-6 py-4"><div className="h-10 bg-slate-50 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                #{order.orderId || order._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{order.user?.name || order.posCustomer?.name || 'Guest'}</div>
                                                <div className="text-xs text-slate-400">{order.user?.phone || order.posCustomer?.phone || ''}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {order.paymentStatus?.toUpperCase()}
                                                </span>
                                                <p className="text-slate-400 font-medium mt-0.5">{order.paymentMethod?.toUpperCase()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <OrderStatusBadge status={order.status} t={t} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-slate-900">₹{order.totalAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleUpdateStatus(order._id, order.status)} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-colors"><Edit3 size={16} /></button>
                                                <button onClick={() => handleShowDetails(order)} className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-400 transition-colors"><Eye size={16} /></button>
                                                <button onClick={() => handleDeleteOrder(order._id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center text-slate-300">
                                            <Truck size={64} strokeWidth={1.5} />
                                            <p className="mt-4 text-sm font-bold text-slate-400">{t('empty.title')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.total > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-xs font-bold text-slate-400 uppercase">
                            {t('total_count', { count: pagination.total })}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-slate-600 px-2">{page} / {pagination.totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                <ChevronRight size={16} />
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

            <style dangerouslySetInnerHTML={{ __html: `
                .filter-select-simple { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 8px 10px; font-size: 13px; font-weight: 600; color: #1e293b; outline: none; transition: all 0.2s; }
                .filter-select-simple:focus { border-color: #3b82f6; background: #fff; }
            `}} />
        </div>
    );
};

export default AllOrders;
