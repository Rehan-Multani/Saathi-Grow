import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Eye, RotateCcw, Package,
    ChevronLeft, ChevronRight, Filter,
    Truck, MapPin, Store, Check, Layers, X, Clock, Pencil, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getReturnRequests, handleReturnRequest, createReturnBatch, deleteOrder } from '../../api/orderApi';
import { getDeliveryPartners } from '../../api/adminDeliveryApi';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';

const statusColors = {
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    FinalRejected: 'bg-red-50 text-red-700 border-red-100',
    Scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
    PickedUp: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    Returned: 'bg-slate-50 text-slate-600 border-slate-100',
};

const ReturnRequests = () => {
    const { t } = useTranslation(['admin_orders', 'common']);
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [selectedForBatch, setSelectedForBatch] = useState([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const tabStatusMap = {
        Pending: 'Pending,Rejected',
        Accepted: 'Accepted,Approved',
        Scheduled: 'Scheduled,PickedUp',
        History: 'FinalRejected,Returned'
    };

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await getReturnRequests(
                {
                    page,
                    limit,
                    search: debouncedSearch,
                    status: tabStatusMap[activeTab] || 'Pending'
                },
                { paginated: true }
            );
            setReturnRequests(Array.isArray(data.returns) ? data.returns : []);
            setPagination(data.pagination || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            toast.error(t('common:error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const data = await getDeliveryPartners();
            setPartners(data.filter(p => p.assignmentStatus === 'Free' && p.dutyStatus === 'Online'));
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    useEffect(() => { fetchPartners(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => { fetchReturns(); }, [page, activeTab, debouncedSearch]);

    useEffect(() => { setSelectedForBatch([]); }, [page, activeTab, debouncedSearch]);

    const handleDeleteOrder = async (orderId) => {
        const result = await showDeleteConfirmation(
            t('actions.delete_confirm_title'),
            t('actions.delete_warning', { defaultValue: 'This action cannot be undone.' })
        );
        if (result.isConfirmed) {
            try {
                await deleteOrder(orderId);
                toast.success(t('actions.delete_success'));
                if (selectedRequest?._id === orderId) setSelectedRequest(null);
                fetchReturns();
            } catch (error) {
                toast.error(error.response?.data?.message || t('common:error_occurred'));
            }
        }
    };

    const handleApproval = async (id, action) => {
        let reason = null;
        if (action === 'Rejected') {
            const { value } = await Swal.fire({
                title: t('actions.reject_title', 'Reject Request?'),
                input: 'textarea',
                inputPlaceholder: t('actions.reason_placeholder', 'Enter reason...'),
                showCancelButton: true,
            });
            if (!value) return;
            reason = value;
        } else {
            const confirm = await Swal.fire({
                title: t('actions.approve_title', 'Approve Request?'),
                showCancelButton: true,
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await handleReturnRequest(id, action, reason);
            toast.success(t('actions.update_success'));
            fetchReturns();
            setSelectedRequest(null);
        } catch (err) {
            toast.error(err.response?.data?.message || t('common:error_occurred'));
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedForBatch(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBatchSchedule = async () => {
        if (!selectedPartner) return toast.error(t('actions.select_partner_error', 'Select a partner'));
        
        try {
            setProcessing(true);
            const firstOrder = returnRequests.find(r => r._id === selectedForBatch[0]);
            const destType = firstOrder?.vendor ? 'vendor' : 'branch';
            const destId = firstOrder?.vendor?._id || firstOrder?.branchId?._id;

            await createReturnBatch({
                partnerId: selectedPartner,
                orderIds: selectedForBatch,
                destinationType: destType,
                destinationId: destId
            });
            toast.success(t('actions.batch_success', 'Batch scheduled successfully'));
            setShowBatchModal(false);
            setSelectedForBatch([]);
            fetchReturns();
        } catch (err) {
            toast.error(err.response?.data?.message || t('common:error_occurred'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container-fluid px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{t('return_requests_title', 'Return Requests')}</h1>
                        <PageInfoTooltip data={pageInfoData.returnRequests} />
                    </div>
                    <p className="text-slate-500 text-sm">{t('return_requests_subtitle', 'Manage customer return claims and logistics.')}</p>
                </div>

                <div className="w-full md:w-72 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('search_placeholder')}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm font-medium outline-none focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['Pending', 'Accepted', 'Scheduled', 'History'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t(`tabs.${tab.toLowerCase()}`, tab)}
                        </button>
                    ))}
                </div>

                {activeTab === 'Accepted' && selectedForBatch.length > 0 && (
                    <button 
                        onClick={() => setShowBatchModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <Layers size={14} /> {t('actions.schedule_pickup', 'Schedule Pickup')} ({selectedForBatch.length})
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {activeTab === 'Accepted' && <th className="px-6 py-4 w-10"></th>}
                                <th className="px-6 py-4">{t('table.id')}</th>
                                <th className="px-6 py-4">{t('table.customer')}</th>
                                <th className="px-6 py-4">{t('table.reason')}</th>
                                <th className="px-6 py-4 text-center">{t('table.status')}</th>
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
                            ) : returnRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <RotateCcw size={48} strokeWidth={1.5} className="animate-spin-slow opacity-20 mb-4" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('empty.no_returns', 'No return claims found')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                returnRequests.map(r => (
                                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                                        {activeTab === 'Accepted' && (
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedForBatch.includes(r._id)}
                                                    onChange={() => toggleSelection(r._id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-blue-600 font-mono text-sm">#{r.orderId?.slice(-8).toUpperCase()}</span>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{r.user?.name}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                {r.vendor ? <Store size={12} /> : <MapPin size={12} />}
                                                {r.vendor?.storeName || r.branchId?.name || 'Main Branch'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate">
                                            <div className="font-medium text-slate-700">{r.returnRequest.reason}</div>
                                            <div className="text-[11px] text-slate-400 truncate">{r.returnRequest.description}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusColors[r.returnRequest.status]}`}>
                                                {r.returnRequest.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">₹{r.totalAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => setSelectedRequest(r)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="View Details"><Eye size={16} /></button>
                                                <button onClick={() => handleDeleteOrder(r._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Order"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.total > 0 && (
                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">{t('total_count', { count: pagination.total })}</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"><ChevronLeft size={20} /></button>
                            <span className="text-sm font-bold text-slate-600">{page} / {pagination.totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                )}
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{t('return_details', 'Return Details')}</h3>
                                    <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">#{selectedRequest.orderId}</p>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('table.customer')}</p>
                                    <p className="font-bold text-slate-900">{selectedRequest.user?.name}</p>
                                    <p className="text-xs text-slate-500">{selectedRequest.user?.phone}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{t('table.amount')}</p>
                                    <p className="font-bold text-blue-600">₹{selectedRequest.totalAmount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('return_reason', 'Issue Claimed')}</p>
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-sm font-bold text-slate-800">"{selectedRequest.returnRequest.reason}"</p>
                                    <p className="text-xs text-slate-500 mt-1">{selectedRequest.returnRequest.description}</p>
                                </div>
                            </div>

                            {['Pending', 'Rejected'].includes(selectedRequest.returnRequest.status) && (
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => handleApproval(selectedRequest._id, 'Accepted')}
                                        disabled={processing}
                                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-emerald-700 transition-all"
                                    >
                                        {t('buttons.approve', 'Approve')}
                                    </button>
                                    <button 
                                        onClick={() => handleApproval(selectedRequest._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-rose-700 transition-all"
                                    >
                                        {t('buttons.reject', 'Reject')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showBatchModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">{t('actions.schedule_pickup', 'Schedule Pickup')}</h3>
                            <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase">{t('select_rider', 'Select Rider')}</label>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {partners.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-sm font-medium">No available riders online</div>
                                ) : partners.map(p => (
                                    <button
                                        key={p._id}
                                        onClick={() => setSelectedPartner(p._id)}
                                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${selectedPartner === p._id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                                                <Truck size={16} className={selectedPartner === p._id ? 'text-blue-600' : 'text-slate-400'} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm text-slate-900">{p.name || 'Unnamed Rider'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{p.vehicleType}</p>
                                            </div>
                                        </div>
                                        {selectedPartner === p._id && <Check size={16} className="text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleBatchSchedule}
                            disabled={processing || !selectedPartner}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                            {processing ? t('common:processing') : t('buttons.confirm', 'Confirm Schedule')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnRequests;
