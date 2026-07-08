import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, Tag, ChevronLeft, ChevronRight, Globe, Info, Package, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getBrands, deleteBrand, updateBrand } from '../../api/brandApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import BrandEditModal from '../../components/products/BrandEditModal';
import { formatBrandCategories } from '../../../../common/utils/brandUtils';

const BrandStatusBadge = ({ status }) => {
    const { t } = useTranslation('admin_categories');
    const active = status === 'Active';
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {active ? t('status.active') : t('status.inactive')}
        </span>
    );
};

const AllBrands = () => {
    const { t } = useTranslation('admin_categories');
    const { adminUser } = useAdminAuth();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);

    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchBrands = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const data = await getBrands(adminUser.token, { page, limit, search: searchTerm });
            const nextBrands = Array.isArray(data?.brands) ? data.brands : (Array.isArray(data) ? data : []);
            const nextPagination = data?.pagination || {
                total: nextBrands.length,
                totalPages: Math.ceil(nextBrands.length / limit) || 1,
                page,
                limit
            };
            setBrands(nextBrands);
            setPagination(nextPagination);
        } catch (error) {
            // toast.error(t('loading_failed'));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, searchTerm, t]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;

    useEffect(() => { setPage(1); }, [searchTerm]);

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(t('messages.delete_confirm_title'), t('messages.delete_confirm_text', { name }));
        if (result.isConfirmed) {
            try {
                await deleteBrand(adminUser.token, id);
                fetchBrands();
                showSuccessAlert(t('messages.delete_success'));
            } catch (error) {
                showErrorAlert('Error', error.message);
            }
        }
    };

    const handleEdit = (brand) => {
        setSelectedBrand(brand);
        setShowEditModal(true);
    };

    const handleSave = async (updatedBrandData) => {
        try {
            const updated = await updateBrand(adminUser.token, selectedBrand._id, updatedBrandData);
            setBrands(brands.map(b => b._id === updated._id ? updated : b));
            toast.success(t('messages.update_success'));
            setShowEditModal(false);
            fetchBrands();
        } catch (error) {
            toast.error(error.message || 'Failed to update brand');
        }
    };

    return (
        <div className="container-fluid py-8 bg-slate-50/30 min-h-screen px-4 md:px-8">
            {/* Header Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-100 hidden md:block">
                            <Tag size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('brands.title')}</h1>
                                <PageInfoTooltip data={pageInfoData.allBrands} />
                            </div>
                            <p className="text-slate-500 text-sm mt-1 font-medium">{t('brands.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-[13px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {adminUser?.role === 'Admin' && (
                            <Link to="/admin/brands/add" className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                                <Plus size={18} strokeWidth={3} /> {t('brands.add_new')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('brands.table.brand')}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('brands.table.category')}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('brands.table.details')}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t('table.status')}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right pr-12">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="saathi-spinner mx-auto mb-4"></div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest tracking-widest">{t('loading')}</p>
                                    </td>
                                </tr>
                            ) : brands.length > 0 ? (
                                brands.map((b) => (
                                    <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                                    {b.logo ? <img src={b.logo} className="max-h-full max-w-full object-contain" /> : <Tag size={18} className="text-slate-200" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-black text-slate-800 tracking-tight uppercase">{b.name}</div>
                                                    <div className="text-[9px] font-mono font-bold text-slate-300 mt-1 tracking-tight select-all">{b._id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                                                {formatBrandCategories(b.category)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {b.website && (
                                                    <a href={b.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors group/web w-fit">
                                                        <Globe size={12} className="group-hover/web:rotate-12 transition-transform" />
                                                        <span className="underline decoration-dotted decoration-slate-200 truncate max-w-[150px]">{b.website.replace(/^https?:\/\//, '')}</span>
                                                    </a>
                                                )}
                                                {b.description ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Info size={12} className="text-slate-300 shrink-0" />
                                                        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[200px]">{b.description}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] italic text-slate-300">{t('brands.no_description')}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <BrandStatusBadge status={b.status} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-1.5 pr-2">
                                                <button 
                                                    onClick={() => handleEdit(b)} 
                                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90" 
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Edit size={17} strokeWidth={2.5} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(b._id, b.name)} 
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90" 
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Trash2 size={17} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner group">
                                            <Tag size={32} className="text-slate-200 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{searchTerm ? t('no_matches') : t('no_categories')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalFiltered > 0 && (
                    <div className="px-8 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                            {t('pagination.showing')} {((page - 1) * limit) + 1} - {Math.min(page * limit, totalFiltered)} of {totalFiltered} {t('brands.title')}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex gap-1.5 items-center">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                                    disabled={page === 1} 
                                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 disabled:opacity-20 transition-all border border-transparent hover:border-slate-100"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10  h-10 text-[11px] font-black rounded-xl transition-all ${page === (i + 1) ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                    disabled={page === totalPages} 
                                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 disabled:opacity-20 transition-all border border-transparent hover:border-slate-100"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BrandEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                brand={selectedBrand}
                onSave={handleSave}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .saathi-spinner { width: 32px; height: 32px; border: 3px solid #f8fafc; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AllBrands;
