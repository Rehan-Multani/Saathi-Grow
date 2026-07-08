import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, ImageIcon, Info, ChevronLeft, ChevronRight, FileText, Package, RefreshCw, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryEditModal from '../../components/products/CategoryEditModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories, deleteCategory, updateCategory } from '../../api/categoryApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const CategoryStatusBadge = ({ status }) => {
    const { t } = useTranslation('admin_categories');
    const active = status === 'Active';
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {active ? t('status.active') : t('status.draft')}
        </span>
    );
};

const AllCategories = () => {
    const { t } = useTranslation('admin_categories');
    const { adminUser } = useAdminAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchCategories = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const data = await getCategories(adminUser.token, { page, limit, search: searchTerm });
            const nextCategories = Array.isArray(data?.categories) ? data.categories : (Array.isArray(data) ? data : []);
            const nextPagination = data?.pagination || {
                total: nextCategories.length,
                totalPages: Math.ceil(nextCategories.length / limit) || 1,
                page,
                limit
            };
            setCategories(nextCategories);
            setPagination(nextPagination);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // toast.error(t('messages.load_failed'));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, searchTerm, t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;

    useEffect(() => { setPage(1); }, [searchTerm]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleSave = async (updatedCategoryData) => {
        try {
            const updated = await updateCategory(adminUser.token, selectedCategory._id, updatedCategoryData);
            setCategories(categories.map(c => c._id === updated._id ? updated : c));
            toast.success(t('messages.update_success'));
            setShowEditModal(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.message || t('messages.update_failed'));
        }
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(t('messages.delete_confirm_title'), t('messages.delete_confirm_text', { name }));
        if (result.isConfirmed) {
            try {
                await deleteCategory(adminUser.token, id);
                fetchCategories();
                showSuccessAlert(t('messages.delete_success'));
            } catch (error) {
                showErrorAlert('Error', error.message);
            }
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-[0.05em]">{t('title')}</h1>
                        <PageInfoTooltip data={pageInfoData.allCategories} />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-semibold uppercase tracking-wider">{t('subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-sm font-medium shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {adminUser?.role === 'Admin' && (
                        <Link 
                            to="/admin/categories/add" 
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md shadow-blue-50 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={18} /> {t('add_new')}
                        </Link>
                    )}
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('table.info')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('table.slug')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">{t('loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center p-2 border border-slate-100"
                                                    style={{ backgroundColor: c.bgColor || '#f8fafc' }}
                                                >
                                                    {c.image ? <img src={c.image} className="max-h-full max-w-full object-contain" alt="" /> : <Package size={20} className="text-slate-300" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-tight">
                                                        {c.name}
                                                        {c.description && (
                                                            <div className="relative group/info">
                                                                <Info size={14} className="text-slate-200 cursor-help hover:text-blue-500 transition-colors" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 shadow-xl font-medium">
                                                                    {c.description}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{c._id.slice(-8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tight">/{c.slug}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold">
                                            <CategoryStatusBadge status={c.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    onClick={() => handleEdit(c)} 
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95" 
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/admin/category-pages/add?categoryId=${c._id}`)} 
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-95" 
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(c._id, c.name)} 
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-95" 
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Layers className="text-slate-200" size={32} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">{searchTerm ? t('no_matches') : t('no_categories')}</h4>
                                        <p className="text-xs font-medium text-slate-400 mt-1">{searchTerm ? 'Try adjusting your search query' : 'Start by building your first collection'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalFiltered > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-medium text-slate-500 italic">
                            {t('pagination.showing')} {((page - 1) * limit) + 1}-{Math.min(page * limit, totalFiltered)} of {totalFiltered} entries
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`p-2 rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-9 h-9 text-xs font-bold rounded-lg transition-all ${page === (i + 1) ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`p-2 rounded-lg border transition-all ${page === totalPages ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CategoryEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                category={selectedCategory}
                onSave={handleSave}
            />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AllCategories;
