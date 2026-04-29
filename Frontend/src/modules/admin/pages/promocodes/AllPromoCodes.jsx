import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Ticket, Copy, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import PromoCodeEditModal from '../../components/promocodes/PromoCodeEditModal';
import { getPromoCodes, deletePromoCode, updatePromoCode } from '../../api/promoCodeApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllPromoCodes = () => {
    const { t } = useTranslation('admin_promocodes');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchPromos = useCallback(async (isRefresh = false) => {
        if (!adminUser?.token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const result = await getPromoCodes(adminUser.token);
            setPromos(result.data || []);
        } catch (error) {
            console.warn('Promo Codes fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [adminUser?.token]);

    useEffect(() => {
        fetchPromos();
    }, [adminUser?.token]); // Only fetch when token actually changes

    const filtered = promos.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedPromos = filtered.slice((page - 1) * limit, page * limit);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        Swal.fire({
            title: t('copy_success'),
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleEdit = (promo) => {
        setSelectedPromo(promo);
        setShowEditModal(true);
    };

    const handleSave = async (updatedPromo) => {
        try {
            await updatePromoCode(adminUser.token, updatedPromo._id, updatedPromo);
            fetchPromos();
            setShowEditModal(false);
            Swal.fire({
                title: t('messages.update_success'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            // toast.error(error.message || t('messages.fetch_error'));
        }
    };

    const handleDelete = (id, code) => {
        Swal.fire({
            title: t('messages.delete_confirm_title'),
            text: t('messages.delete_confirm_msg', { code }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deletePromoCode(adminUser.token, id);
                    fetchPromos();
                    Swal.fire({
                        title: 'Deleted!',
                        text: t('messages.delete_success'),
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    toast.error(error.message || 'Delete failed');
                }
            }
        });
    };

    const renderStatusBadge = (p) => {
        const now = new Date();
        const validUntil = new Date(p.validUntil);
        const validFrom = new Date(p.validFrom);

        let config = { text: t('status.active'), class: 'bg-emerald-600 text-white border-emerald-600' };

        if (!p.isActive) {
            config = { text: t('status.inactive'), class: 'bg-slate-400 text-white border-slate-400' };
        } else if (now < validFrom) {
            config = { text: t('status.upcoming'), class: 'bg-blue-600 text-white border-blue-600' };
        } else if (now > validUntil) {
            config = { text: t('status.expired'), class: 'bg-rose-600 text-white border-rose-600' };
        } else if (p.usageLimitTotal > 0 && p.usedCount >= p.usageLimitTotal) {
            config = { text: t('status.limit_reached'), class: 'bg-slate-800 text-white border-slate-800' };
        }

        return (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${config.class}`}>
                {config.text}
            </span>
        );
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-[0.05em]">{t('title')}</h1>
                        <PageInfoTooltip data={pageInfoData.allPromoCodes} />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-semibold uppercase tracking-wider">{t('subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-xs font-bold text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => fetchPromos(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/promocodes/create')}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100"
                    >
                        <Plus size={16} />
                        <span>{t('add_new')}</span>
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.code')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.type')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.value')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.usage')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.min_order')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && !refreshing ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4">
                                            <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedPromos.length > 0 ? (
                                paginatedPromos.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                    <Ticket size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.code}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {p._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg whitespace-nowrap uppercase tracking-tight">
                                                {p.discountType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-900">
                                                {p.discountType === 'Percentage' ? `${p.discountValue}%` : 
                                                 p.discountType === 'FreeShipping' ? 'FREE' : `₹${p.discountValue}`}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="text-[10px] font-bold text-slate-600">
                                                    {p.usedCount} / {p.usageLimitTotal === 0 ? '∞' : p.usageLimitTotal}
                                                </div>
                                                <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500" 
                                                        style={{ width: `${p.usageLimitTotal === 0 ? (p.usedCount > 0 ? 100 : 0) : Math.min((p.usedCount / p.usageLimitTotal) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">
                                            ₹{p.minOrderValue}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {renderStatusBadge(p)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleCopy(p.code)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    title="Copy Code"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id, p.code)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <Ticket size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('empty_state')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalFiltered > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Showing <span className="text-slate-900 mx-0.5">{((page - 1) * limit) + 1}</span> — <span className="text-slate-900 mx-0.5">{Math.min(page * limit, totalFiltered)}</span> of <span className="text-slate-900 mx-0.5">{totalFiltered}</span> Codes
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-xl transition-all border shadow-sm ${page === 1 ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 active:scale-95'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <div className="flex items-center gap-1.5 hidden sm:flex">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-8 h-8 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center shadow-sm ${page === p ? 'bg-blue-600 text-white shadow-blue-100 shadow-md ring-2 ring-blue-500/10' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-slate-300 font-bold px-0.5">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-xl transition-all border shadow-sm ${page === totalPages ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 active:scale-95'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <PromoCodeEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                promoCode={selectedPromo}
                onSave={handleSave}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AllPromoCodes;
