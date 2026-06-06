import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Briefcase, Edit, Trash2, Key, X, Store, ChevronLeft, ChevronRight, Shield, Mail, Phone, Loader2, UserCircle2, Ban, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StaffEditModal from '../../components/staff/StaffEditModal';
import { getAllStaff, updateStaff, deleteStaff } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllStaff = () => {
    const { t } = useTranslation('admin_staff');
    const { adminUser } = useAdminAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [tempPermissions, setTempPermissions] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchStaffData = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const { staff, pagination: paginationData } = await getAllStaff(
                adminUser.token,
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setStaffList(Array.isArray(staff) ? staff : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit: 10 });
        } catch (error) {
            toast.error(t('all.alerts.error'));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, searchTerm, t]);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const handleOpenPermissionModal = (staff) => {
        setSelectedStaff(staff);
        setTempPermissions(staff.permissions || []);
        setShowPermissionModal(true);
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(
            t('all.alerts.delete_confirm'),
            `${name} will be removed from the system.`
        );
        if (result.isConfirmed) {
            try {
                await deleteStaff(adminUser.token, id);
                fetchStaffData();
                showSuccessAlert(t('all.alerts.delete_success'));
            } catch (error) {
                showErrorAlert(error.message || 'Failed to remove staff');
            }
        }
    };

    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setShowEditModal(true);
    };

    const handleSaveStaff = async (updatedData) => {
        try {
            await updateStaff(adminUser.token, selectedStaff._id, updatedData);
            toast.success(t('edit.alerts.success'));
            fetchStaffData();
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || t('edit.alerts.error'));
        }
    };

    const handlePermissionToggle = (perm) => {
        if (tempPermissions.includes(perm)) {
            setTempPermissions(tempPermissions.filter(p => p !== perm));
        } else {
            setTempPermissions([...tempPermissions, perm]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedStaff) return;
        try {
            await updateStaff(adminUser.token, selectedStaff._id, { permissions: tempPermissions });
            toast.success(t('all.alerts.status_success'));
            fetchStaffData();
            setShowPermissionModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update permissions');
        }
    };

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const PERMISSIONS_DEF = [
        { id: 'MANAGE_POS_BILLING', label: t('permissions.MANAGE_POS_BILLING', 'POS Billing') },
        { id: 'VIEW_ORDERS', label: t('permissions.VIEW_ORDERS', 'View Orders') },
        { id: 'MANAGE_ORDERS', label: t('permissions.MANAGE_ORDERS', 'Manage Orders') },
        { id: 'MANAGE_REFUNDS_RETURNS', label: t('permissions.MANAGE_REFUNDS_RETURNS', 'Manage Returns') },
        { id: 'MANAGE_PRODUCTS', label: t('permissions.MANAGE_PRODUCTS', 'Manage Products') },
        { id: 'VIEW_CUSTOMERS', label: t('permissions.VIEW_CUSTOMERS', 'Manage Customers') },
        { id: 'MANAGE_INVENTORY', label: t('permissions.MANAGE_INVENTORY', 'Manage Inventory') },
        { id: 'MANAGE_STAFF', label: t('permissions.MANAGE_STAFF', 'Staff Control') },
        { id: 'VIEW_REPORTS', label: t('permissions.VIEW_REPORTS', 'View Reports') }
    ];

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('all.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.manageStaff} />
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">{totalFiltered} Members</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('all.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('all.search_placeholder')}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-sm font-medium shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/admin/staff/add"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md shadow-blue-50 active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} /> {t('all.add_btn')}
                    </Link>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('all.table.name')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('all.table.role')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">Branch</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('all.table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right">{t('all.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">Loading team members...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : staffList.length > 0 ? staffList.map((s) => (
                                <tr key={s._id} className="hover:bg-slate-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm border border-slate-200 uppercase">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 leading-tight">{s.name}</div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-1">
                                                    <Mail size={12} className="opacity-60" /> {s.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 w-fit">
                                                {s.role}
                                            </span>
                                            {s.permissions?.length > 0 && (
                                                <span className="text-[9px] text-slate-400 font-semibold uppercase">{s.permissions.length} Permissions</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {s.branchId ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                <Store size={14} className="text-slate-400" /> {s.branchId.name}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Global Access</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${s.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {s.isActive ? t('all.status.active') : t('all.status.inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleOpenPermissionModal(s)}
                                                className="p-2.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                title="Permissions"
                                            >
                                                <Key size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="p-2.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s._id, s.name)}
                                                className={`p-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ${s.role === 'Admin' ? 'invisible' : ''}`}
                                                disabled={s.role === 'Admin'}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Briefcase size={40} className="text-slate-200" />
                                            <p className="text-xs font-semibold">{t('all.no_staff')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalFiltered > 0 && (
                    <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-medium text-slate-500 italic">
                            Showing {staffList.length} of {totalFiltered} team members
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
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
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-lg border transition-all ${page === totalPages ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Permissions Modal */}
            {showPermissionModal && selectedStaff && (
                <div className="fixed inset-0 z-[1070] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowPermissionModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{t('add.form.label_permissions')}</h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{selectedStaff.name}</p>
                            </div>
                            <button onClick={() => setShowPermissionModal(false)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"><X size={18} strokeWidth={2.5} /></button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[440px] overflow-y-auto custom-scrollbar">
                            {PERMISSIONS_DEF.map((perm) => (
                                <div
                                    key={perm.id}
                                    onClick={() => handlePermissionToggle(perm.id)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${tempPermissions.includes(perm.id) ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-50' : 'bg-slate-50/50 border-slate-100 hover:border-blue-200 text-slate-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tempPermissions.includes(perm.id) ? 'bg-white/20' : 'bg-white border border-slate-100 shadow-sm'}`}>
                                            <Shield size={14} className={tempPermissions.includes(perm.id) ? 'text-white' : 'text-slate-400'} />
                                        </div>
                                        <span className={`text-xs font-bold`}>{perm.label}</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${tempPermissions.includes(perm.id) ? 'bg-white/30' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${tempPermissions.includes(perm.id) ? 'right-0.5' : 'left-0.5'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-50 flex gap-3 bg-slate-50/10">
                            <button onClick={() => setShowPermissionModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
                            <button onClick={handleSavePermissions} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-50 transition-all">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <StaffEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                staff={selectedStaff}
                onSave={handleSaveStaff}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AllStaff;
