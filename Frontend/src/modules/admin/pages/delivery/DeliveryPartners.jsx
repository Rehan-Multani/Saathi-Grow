import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Truck, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Filter, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DeliveryPartnerEditModal from '../../components/delivery/DeliveryPartnerEditModal';
import DeleteRiderModal from '../../components/delivery/DeleteRiderModal';
import Swal from 'sweetalert2';
import * as api from '../../api/adminDeliveryApi';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const DeliveryPartners = () => {
    const { t } = useTranslation('admin_delivery');
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    // Role check - hide sensitive actions from vendors
    const isVendor = window.location.pathname.startsWith('/vendor');
    const portalPrefix = isVendor ? '/vendor' : '/admin';

    const fetchPartners = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const { partners: partnerList, pagination: paginationData } = await api.getDeliveryPartners(
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setPartners(Array.isArray(partnerList) ? partnerList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            Swal.fire({
                title: t('partners.loading_failed'),
                icon: 'error',
                confirmButtonColor: '#3b82f6'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [page, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (showEditModal || showDeleteModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showEditModal, showDeleteModal]);

    const handleDeleteClick = (partner) => {
        setPartnerToDelete(partner);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!partnerToDelete?._id) return;
        setDeleting(true);
        try {
            await api.deleteDeliveryPartner(partnerToDelete._id);
            setShowDeleteModal(false);
            setPartnerToDelete(null);
            fetchPartners();
            Swal.fire({
                title: t('partners.delete_success'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                title: 'Failed to delete rider',
                icon: 'error'
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleEdit = async (partner) => {
        setSelectedPartner(partner);
        setShowEditModal(true);
        try {
            const full = await api.getDeliveryPartnerById(partner._id);
            setSelectedPartner(full);
        } catch (err) {
            console.error('Failed to load partner details for edit:', err);
        }
    };

    const handleSave = async (updatedPartner) => {
        try {
            await api.updateDeliveryPartner(updatedPartner._id, {
                authStatus: updatedPartner.authStatus,
                maxActiveOrders: updatedPartner.maxActiveOrders
            });
            fetchPartners();
            Swal.fire({
                title: t('partners.update_success'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            Swal.fire({
                title: 'Update failed',
                icon: 'error'
            });
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('partners.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.allDeliveryPartners} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('partners.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('partners.search_placeholder')}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-xs font-bold text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => fetchPartners(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    {!isVendor && (
                        <Link
                            to={`${portalPrefix}/delivery/partners/add`}
                            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100"
                        >
                            <Plus size={16} />
                            <span>{t('partners.add_new')}</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* List Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('partners.table.name')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('partners.table.type')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('partners.table.contact')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('partners.table.duty')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('partners.table.assignment')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('partners.table.status')}</th>
                                {!isVendor && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">{t('partners.table.actions')}</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && !refreshing ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg"></div>
                                                <div className="space-y-2 flex-grow">
                                                    <div className="h-4 bg-slate-50 rounded w-1/4"></div>
                                                    <div className="h-3 bg-slate-50 rounded w-1/3"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : partners.length > 0 ? (
                                partners.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 overflow-hidden">
                                                    {p.profileImage ? (
                                                        <img src={p.profileImage} className="w-full h-full object-cover" />
                                                    ) : <Truck size={18} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <Link
                                                        to={`${portalPrefix}/delivery/partners/${p._id}`}
                                                        className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors block leading-tight uppercase tracking-tight"
                                                    >
                                                        {p.name}
                                                    </Link>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">ID: {p.uniqueId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg whitespace-nowrap uppercase tracking-tight">
                                                {p.vehicleType || 'Personal'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-bold">
                                                <Phone size={12} className="text-slate-300" />
                                                {p.phone}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                                                p.dutyStatus === 'Online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                            }`}>
                                                {p.dutyStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                                                p.assignmentStatus === 'Free' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {p.assignmentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                                                p.authStatus === 'Active' ? 'bg-emerald-600 text-white border-emerald-600' : p.authStatus === 'Suspended' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-400 text-white border-slate-400'
                                            }`}>
                                                {p.authStatus}
                                            </span>
                                        </td>
                                        {!isVendor && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                        title="Edit Rider"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(p)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                                        title="Delete Rider"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isVendor ? "6" : "7"} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <Truck size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('partners.no_partners')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {t('partners.pagination.showing')} <span className="text-slate-900 mx-0.5">{((page - 1) * limit) + 1}</span> — <span className="text-slate-900 mx-0.5">{Math.min(page * limit, pagination.total)}</span> of <span className="text-slate-900 mx-0.5">{pagination.total}</span> {t('partners.pagination.partners')}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                className={`p-2 rounded-xl transition-all border shadow-sm ${page === 1 ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 active:scale-95'}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-1.5 hidden sm:flex">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
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
                                        return <span key={p} className="text-slate-300 px-0.5 font-bold">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                className={`p-2 rounded-xl transition-all border shadow-sm ${page === pagination.totalPages ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 active:scale-95'}`}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DeliveryPartnerEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                partner={selectedPartner}
                onSave={handleSave}
            />

            <DeleteRiderModal
                show={showDeleteModal}
                onHide={() => {
                    if (!deleting) {
                        setShowDeleteModal(false);
                        setPartnerToDelete(null);
                    }
                }}
                riderName={partnerToDelete?.name || ''}
                onConfirm={handleDeleteConfirm}
                loading={deleting}
            />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default DeliveryPartners;
