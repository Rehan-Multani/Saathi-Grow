import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, Info, ChevronLeft, ChevronRight, FileText, Package, RefreshCw, Layers, Upload, Download, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CategoryEditModal from '../../components/products/CategoryEditModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories, deleteCategory, updateCategory, bulkUploadCategories } from '../../api/categoryApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import * as XLSX from 'xlsx';

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
    const [searchParams, setSearchParams] = useSearchParams();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchTerm = searchParams.get('search') || '';
    const [localSearch, setLocalSearch] = useState(searchTerm);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const updateParams = useCallback((newParams) => {
        setSearchParams((prev) => {
            Object.entries(newParams).forEach(([key, value]) => {
                if (value && value !== 'all') prev.set(key, String(value));
                else prev.delete(key);
            });
            return prev;
        });
    }, [setSearchParams]);

    const fetchCategories = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const params = { page, limit };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            const data = await getCategories(adminUser.token, params);
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
        } finally {
            setLoading(false);
        }
    }, [adminUser?.token, page, searchTerm, limit]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localSearch !== searchTerm) updateParams({ search: localSearch, page: 1 });
        }, 500);
        return () => clearTimeout(timeout);
    }, [localSearch, searchTerm, updateParams]);

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    const startItem = totalFiltered === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, totalFiltered);

    const getPageNumbers = () => {
        const pages = [];
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }
        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, start + maxButtons - 1);
        start = Math.max(1, end - maxButtons + 1);
        if (start > 1) pages.push(1, start > 2 ? '...' : 2);
        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }
        if (end < totalPages) pages.push(end < totalPages - 1 ? '...' : totalPages - 1, totalPages);
        return [...new Set(pages)];
    };

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

    const downloadExcelTemplate = () => {
        const headers = ['name', 'slug', 'description', 'tags', 'status', 'bgColor', 'image'];
        const example = [
            'Vegetables', 'vegetables', 'Fresh vegetables and greens', 'veg,fresh,organic', 'Active', '#DBEAFE', ''
        ];
        const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
        XLSX.writeFile(workbook, 'Saathigro_bulk_category_template.xlsx');
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return toast.warning(t('bulk.no_file'));
        setBulkLoading(true);
        try {
            const data = await bulkUploadCategories(adminUser.token, bulkFile);
            const created = data.created || 0;
            const updated = data.updated || 0;
            const skipped = data.skipped || 0;
            const errors = data.errors || [];
            const summary = `${created} created, ${updated} updated${skipped > 0 ? `, ${skipped} skipped` : ''}`;

            if (created + updated > 0) toast.success(summary, { autoClose: 5000 });
            else if (skipped > 0) toast.warning(summary, { autoClose: 5000 });
            else toast.info(summary, { autoClose: 5000 });

            if (errors.length > 0) {
                const preview = errors.slice(0, 5);
                const remaining = errors.length - preview.length;
                toast.warning(
                    <div className="text-sm">
                        <p className="font-bold mb-1">{errors.length} issue{errors.length > 1 ? 's' : ''}</p>
                        <ul className="list-disc pl-4 space-y-0.5 max-h-40 overflow-y-auto">
                            {preview.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                        {remaining > 0 && <p className="mt-1 text-xs opacity-80">…and {remaining} more</p>}
                    </div>,
                    { autoClose: 12000 }
                );
            }

            setShowBulkModal(false);
            setBulkFile(null);
            fetchCategories();
        } catch (err) {
            toast.error(err.message || t('bulk.upload_failed'));
        } finally {
            setBulkLoading(false);
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
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>
                    {adminUser?.role === 'Admin' && (
                        <>
                            <button
                                onClick={() => setShowBulkModal(true)}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                            >
                                <Upload size={18} /> {t('bulk_upload')}
                            </button>
                            <Link
                                to="/admin/categories/add"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md shadow-blue-50 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={18} /> {t('add_new')}
                            </Link>
                        </>
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
                        <div className="text-xs font-medium text-slate-500">
                            {t('pagination.showing_range', {
                                start: startItem,
                                end: endItem,
                                total: totalFiltered,
                                defaultValue: `Showing ${startItem}–${endItem} of ${totalFiltered}`
                            })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                disabled={page === 1}
                                className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {getPageNumbers().map((p, i) => (
                                p === '...' ? (
                                    <span key={`dots-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => updateParams({ page: p })}
                                        className={`min-w-[34px] h-[34px] px-2 rounded-lg text-sm font-semibold transition-all ${
                                            p === page
                                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
                                                : 'border border-slate-200 text-slate-600 hover:bg-white bg-white'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            ))}
                            <button
                                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                disabled={page === totalPages}
                                className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CategoryEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                category={selectedCategory}
                onSave={handleSave}
            />

            {showBulkModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[88vh]">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">{t('bulk.title')}</h2>
                                    <p className="text-xs text-slate-400 font-medium">{t('bulk.subtitle')}</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowBulkModal(false); setBulkFile(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto flex-1">
                            <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">{t('bulk.step1_title')}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{t('bulk.step1_desc')}</p>
                                </div>
                                <button
                                    onClick={downloadExcelTemplate}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-sm"
                                >
                                    <Download size={14} /> {t('bulk.download')}
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">{t('bulk.columns_title')}</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['name*', 'slug', 'description', 'tags', 'status', 'bgColor', 'image'].map((col) => (
                                        <span key={col} className={`text-[10px] px-2 py-1 rounded-lg font-bold text-center ${col.includes('*') ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                            {col}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-rose-500 font-semibold mt-2">{t('bulk.required_note')}</p>
                                <p className="text-[10px] text-slate-500 mt-1.5">{t('bulk.image_note')}</p>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-slate-800 mb-2">{t('bulk.step2_title')}</p>
                                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${bulkFile ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        {bulkFile ? (
                                            <>
                                                <FileText size={24} className="text-green-500" />
                                                <p className="text-sm font-bold text-green-700">{bulkFile.name}</p>
                                                <p className="text-xs text-slate-400">{t('bulk.change_file')}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-slate-400" />
                                                <p className="text-sm font-bold text-slate-600">{t('bulk.select_file')}</p>
                                                <p className="text-xs text-slate-400">{t('bulk.file_types')}</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        className="hidden"
                                        onChange={(e) => setBulkFile(e.target.files[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-slate-100">
                            <button onClick={() => { setShowBulkModal(false); setBulkFile(null); }} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                                {t('form.cancel')}
                            </button>
                            <button
                                onClick={handleBulkUpload}
                                disabled={!bulkFile || bulkLoading}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                            >
                                {bulkLoading ? <><RefreshCw size={16} className="animate-spin" /> {t('bulk.uploading')}</> : <><Upload size={16} /> {t('bulk.upload_btn')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AllCategories;
