import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MapPin, Store, Edit, Trash2, Info, ChevronLeft, ChevronRight, Hash, PhoneCall, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import BranchDetailsModal from '../../components/locations/BranchDetailsModal';
import EditBranchModal from '../../components/locations/EditBranchModal';
import { getBranches, deleteBranch, updateBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const Branches = () => {
    const { adminUser } = useAdminAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchBranchesData = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const { branches: branchList, pagination: paginationData } = await getBranches(
                adminUser.token,
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setBranches(Array.isArray(branchList) ? branchList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error('Failed up load branch network registry');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, searchTerm]);

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
            toast.success('Branch network synchronized successfully');
            fetchBranchesData();
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update network node');
        }
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation('Decommission Branch?', `Are you sure you want to shut down ${name}? This will affect all local logistics.`);
        if (result.isConfirmed) {
            try {
                await deleteBranch(adminUser.token, id);
                fetchBranchesData();
                showSuccessAlert('Decommissioned!', 'Branch node removed from active network.');
            } catch (error) {
                showErrorAlert('Operation Failed', error.response?.data?.message || 'Failed to decommission node');
            }
        }
    };

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Enterprise Network</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Branch Registry</h1>
                        <PageInfoTooltip data={pageInfoData.allBranches} />
                    </div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Global distribution nodes & local logistics hubs</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, city or branch code..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all shadow-sm shadow-slate-200/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/admin/locations/branches/add"
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={18} /> New Node
                    </Link>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Network Entity</th>
                                <th className="px-8 py-5">Node Identity</th>
                                <th className="px-8 py-5">Communication</th>
                                <th className="px-8 py-5 text-center">Protocol State</th>
                                <th className="px-8 py-5 text-right">Operational Port</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : branches.length > 0 ? (
                                branches.map((b) => (
                                    <tr key={b._id} className="group hover:bg-slate-50/50 transition-colors duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform">
                                                    <Store size={22} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 mb-0.5">{b.name}</div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                        <MapPin size={10} className="text-emerald-500" /> {b.address?.city}, {b.address?.state}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl w-fit group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                                                <Hash size={12} className="text-slate-400" />
                                                <span className="text-[11px] font-black text-slate-800 font-mono tracking-wider">{b.code || 'SYS-NODE'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 font-mono">
                                                <PhoneCall size={14} className="text-slate-300" /> {b.phone || '+91-XXXXXXXXXX'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                b.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-900/5' : 
                                                'bg-slate-100 text-slate-400 border-slate-200'
                                            }`}>
                                                {b.isActive ? 'Operational' : 'Restricted'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2.5">
                                                <button
                                                    onClick={() => handleShowDetails(b)}
                                                    className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center border border-blue-100 group-hover:scale-110 active:scale-95"
                                                    title="Network Intelligence"
                                                >
                                                    <Activity size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(b)}
                                                    className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 flex items-center justify-center border border-amber-100 group-hover:scale-110 active:scale-95"
                                                    title="Modify Node"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(b._id, b.name)}
                                                    className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-300 flex items-center justify-center border border-rose-100 group-hover:scale-110 active:scale-95"
                                                    title="Shut Down Node"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30 grayscale">
                                            <Store size={80} strokeWidth={1} />
                                            <p className="mt-4 text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Global Network Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900">{branches.length}</span> of <span className="text-slate-900">{totalFiltered}</span> active distribution nodes
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${page === p ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-slate-300 font-bold px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default Branches;
