import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, MapPin, Store, Edit, Trash2, ChevronLeft, ChevronRight, Phone, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import BranchDetailsModal from '../../components/locations/BranchDetailsModal';
import EditBranchModal from '../../components/locations/EditBranchModal';
import { getBranches, deleteBranch, updateBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';

const Branches = () => {
    const { t } = useTranslation('admin_locations');
    const { adminUser } = useAdminAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchBranchesData = useCallback(async (isRefresh = false) => {
        if (!adminUser?.token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const { branches: branchList, pagination: paginationData } = await getBranches(
                adminUser.token,
                { page, limit, search: searchTerm, includeInactive: true },
                { paginated: true }
            );
            setBranches(Array.isArray(branchList) ? branchList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            // toast.error(t('messages.fetch_error'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [adminUser.token, page, searchTerm, t]);

    useEffect(() => {
        fetchBranchesData();
    }, [fetchBranchesData]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleShowDetails = (branch) => {
        setSelectedBranch(branch);
        setShowDetailsModal(true);
    };

    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setShowEditModal(true);
    };

    const handleSaveBranch = async (updatedData) => {
        try {
            await updateBranch(adminUser.token, selectedBranch._id, updatedData);
            Swal.fire({
                title: t('messages.update_success'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            fetchBranchesData();
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.update_error'));
        }
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(
            t('messages.delete_confirm_title'),
            t('messages.delete_confirm_msg', { name })
        );

        if (result.isConfirmed) {
            try {
                await deleteBranch(adminUser.token, id);
                fetchBranchesData();
                Swal.fire({
                    title: t('messages.delete_success_title'),
                    text: t('messages.delete_success_msg'),
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                toast.error(t('messages.delete_error'));
            }
        }
    };

    const handleToggleStatus = async (branch) => {
        const nextStatus = !branch.isActive;
        try {
            setBranches(prev => prev.map(b => b._id === branch._id ? { ...b, isActive: nextStatus } : b));
            await updateBranch(adminUser.token, branch._id, { isActive: nextStatus });
            toast.success(nextStatus ? 'Branch activated' : 'Branch inactivated — its products are hidden from customers');
        } catch (error) {
            setBranches(prev => prev.map(b => b._id === branch._id ? { ...b, isActive: branch.isActive } : b));
            toast.error(error.message || t('messages.update_error'));
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-[0.05em]">{t('title')}</h1>
                        <PageInfoTooltip data={pageInfoData.allBranches} />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-semibold uppercase tracking-wider">{t('subtitle')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
                        onClick={() => fetchBranchesData(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/admin/locations/branches/add"
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100"
                    >
                        <Plus size={16} />
                        <span>{t('add_new')}</span>
                    </Link>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.entity')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.identity')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.communication')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && !refreshing ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : branches.length > 0 ? (
                                branches.map((b) => (
                                    <tr key={b._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 overflow-hidden">
                                                    {b.logo ? (
                                                        <img src={b.logo} alt="" className="w-full h-full object-cover" />
                                                    ) : <Store size={18} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                                        {b.name}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                                                        <MapPin size={10} className="text-blue-400" /> {b.address?.city}, {b.address?.state}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase">
                                                {b.code || '---'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col items-center justify-center gap-0.5 text-slate-600 font-bold">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Phone size={10} className="text-slate-300" /> {b.phone || '---'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-semibold lowercase">
                                                    {b.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(b)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${b.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                title={b.isActive ? 'Set Inactive' : 'Set Active'}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${b.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <div className={`mt-1 text-[9px] font-bold uppercase tracking-tight ${b.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {b.isActive ? t('status.active') : t('status.inactive')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleShowDetails(b)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(b)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="p-2 text-slate-300 bg-slate-50 rounded-lg cursor-not-allowed opacity-50"
                                                    title="Delete disabled"
                                                    aria-disabled="true"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <Store size={32} className="text-slate-200" />
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
                {!loading && pagination.total > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Showing <span className="text-slate-900 mx-0.5">{((page - 1) * limit) + 1}</span> — <span className="text-slate-900 mx-0.5">{Math.min(page * limit, pagination.total)}</span> of <span className="text-slate-900 mx-0.5">{pagination.total}</span> {t('pagination.active_nodes')}
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
                                                className={`w-8 h-8 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center shadow-sm ${page === p ? 'bg-blue-600 text-white shadow-blue-100 ring-2 ring-blue-500/10' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
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

            <BranchDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                branch={selectedBranch}
                onEdit={handleEdit}
            />
            <EditBranchModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                branch={selectedBranch}
                onSave={handleSaveBranch}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default Branches;
