import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, ChevronLeft, ChevronRight, XCircle, Loader2, Package, User as UserIcon, Trash2 } from 'lucide-react';
import { getAllOrdersAdmin } from '../../api/orderApi';
import * as customerApi from '../../../../common/api/customerManagementApi';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const getOrderUserId = (order) => order?.user?._id || (typeof order?.user === 'string' ? order.user : null);

const OrderStatusBadge = ({ status }) => {
    const { t } = useTranslation('admin_customers');
    const s = status?.toLowerCase();
    
    const styles = {
        delivered: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        cancelled: 'bg-rose-50 border-rose-100 text-rose-600',
        pending: 'bg-amber-50 border-amber-100 text-amber-600',
        confirmed: 'bg-blue-50 border-blue-100 text-blue-600',
        preparing: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        default: 'bg-slate-50 border-slate-100 text-slate-500'
    };

    const style = styles[s] || styles.default;

    return (
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${style}`}>
            {t(`orders.status.${s}`, { defaultValue: status })}
        </span>
    );
};

const CustomerOrders = () => {
    const { t } = useTranslation('admin_customers');
    const { adminUser } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [deletingId, setDeletingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const limit = 10;

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: searchTerm,
                status: statusFilter === 'all' ? undefined : statusFilter.toLowerCase()
            };
            
            const data = await getAllOrdersAdmin(params);
            
            if (data && data.orders) {
                setOrders(data.orders);
                setPagination(data.pagination);
            } else {
                setOrders([]);
                setPagination({ total: 0, totalPages: 1 });
            }
        } catch (error) {
            // toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchTerm, limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchOrders]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPage(1);
    };

    const selectableOrders = orders.filter((o) => Boolean(getOrderUserId(o)));
    const allSelected = selectableOrders.length > 0 && selectableOrders.every((o) => selectedIds.includes(o._id));

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            const currentIds = selectableOrders.map((o) => o._id);
            setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableOrders.map((o) => o._id)])));
        }
    };

    const handleDeleteAccount = async (order) => {
        const userId = getOrderUserId(order);
        if (!userId) {
            toast.warning(t('orders.alerts.no_account'));
            return;
        }

        const customerName = order.user?.name || t('all.anonymous');
        const result = await showDeleteConfirmation(
            t('all.alerts.delete_confirm_title'),
            t('all.alerts.delete_confirm_text', { name: customerName })
        );
        if (!result.isConfirmed) return;

        try {
            setDeletingId(String(userId));
            await customerApi.deleteCustomer(adminUser.token, userId);
            toast.success(t('all.alerts.delete_success'));
            setSelectedIds((prev) => prev.filter((id) => {
                const matched = orders.find((o) => o._id === id);
                return String(getOrderUserId(matched)) !== String(userId);
            }));
            fetchOrders();
        } catch (error) {
            toast.error(error.message || t('all.errors.delete_failed'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDeleteAccounts = async () => {
        if (selectedIds.length === 0) return;

        const selectedOrders = orders.filter((o) => selectedIds.includes(o._id));
        const userIds = Array.from(new Set(
            selectedOrders.map(getOrderUserId).filter(Boolean).map(String)
        ));

        if (userIds.length === 0) {
            toast.warning(t('orders.alerts.no_account'));
            return;
        }

        const result = await showDeleteConfirmation(
            t('orders.alerts.bulk_delete_confirm_title'),
            t('orders.alerts.bulk_delete_confirm_text', { count: userIds.length })
        );
        if (!result.isConfirmed) return;

        try {
            setBulkDeleting(true);
            const data = await customerApi.bulkDeleteCustomers(adminUser.token, userIds);
            toast.success(t('orders.alerts.bulk_delete_success', {
                count: data.deletedCount ?? userIds.length
            }));
            setSelectedIds([]);
            fetchOrders();
        } catch (error) {
            toast.error(error.message || t('all.errors.delete_failed'));
        } finally {
            setBulkDeleting(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('orders.title')}</h1>
                        <PageInfoTooltip info={pageInfoData.customerOrders} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('orders.subtitle')}</p>
                </div>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm font-semibold text-xs text-slate-600">
                    {pagination.total} Orders
                </div>
            </div>

            {/* Sub Header / Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-sm font-medium"
                            placeholder="Search Order ID, Customer name..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto p-1 bg-slate-100/50 rounded-xl border border-slate-100">
                        {['all', 'Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${statusFilter === s ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {s === 'all' ? 'All' : s}
                            </button>
                        ))}
                    </div>
                    
                    {(searchTerm || statusFilter !== 'all') && (
                        <button onClick={clearFilters} className="p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all border border-rose-100 self-stretch flex items-center justify-center">
                            <XCircle size={18} />
                        </button>
                    )}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">
                            {t('orders.selection.selected', { count: selectedIds.length })}
                        </span>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-xs font-medium text-blue-100 hover:text-white underline"
                        >
                            {t('orders.selection.clear')}
                        </button>
                    </div>
                    <button
                        onClick={handleBulkDeleteAccounts}
                        disabled={bulkDeleting}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                        {bulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        {t('orders.selection.delete_accounts')}
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        disabled={selectableOrders.length === 0}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-40"
                                        aria-label="Select all orders with customer accounts"
                                    />
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('orders.table.order')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('orders.table.customer')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('orders.table.manifest')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('orders.table.amount')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('orders.table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">{t('orders.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400 font-sans tracking-normal">Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? orders.map((o) => {
                                const userId = getOrderUserId(o);
                                const isDeleting = deletingId && userId && deletingId === String(userId);
                                return (
                                <tr key={o._id} className={`group hover:bg-slate-50/30 transition-all ${selectedIds.includes(o._id) ? 'bg-blue-50/40' : ''}`}>
                                    <td className="px-6 py-5">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(o._id)}
                                            onChange={() => toggleSelect(o._id)}
                                            disabled={!userId}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label={`Select order ${o.orderId}`}
                                        />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-blue-600 mb-1">#{o.orderId}</span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                                <Calendar size={12} className="opacity-50" /> 
                                                {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                <UserIcon size={16} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 mb-0.5">{o.user?.name || 'Guest'}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{o.user?.phone || 'No phone'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-slate-50 rounded text-slate-400">
                                                <Package size={14} />
                                            </div>
                                            <div className="text-[11px] font-medium text-slate-600 text-truncate max-w-[280px]">
                                                {o.items?.map(i => i.name || 'Product').join(', ')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <div className="text-xs font-bold text-slate-900">₹{o.totalAmount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <OrderStatusBadge status={o.status} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDeleteAccount(o)}
                                                disabled={!userId || isDeleting || bulkDeleting}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={t('orders.actions.delete_account')}
                                            >
                                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                {t('orders.actions.delete_account')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400 opacity-60">
                                            <XCircle size={40} className="text-slate-300" strokeWidth={1.5} />
                                            <span className="text-xs font-semibold">No orders found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-xs font-medium text-slate-500">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} orders
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronLeft size={16} strokeWidth={2.5} />
                            </button>
                            
                            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-bold text-slate-700">
                                Page {page} <span className="mx-1 text-slate-300">/</span> {pagination.totalPages}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${page === pagination.totalPages ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronRight size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}} />
        </div>
    );
};

export default CustomerOrders;
