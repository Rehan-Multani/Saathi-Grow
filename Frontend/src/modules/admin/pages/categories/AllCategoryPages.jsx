import React, { useCallback, useEffect, useState } from 'react';
import { Edit, ExternalLink, FileText, Plus, Trash2, Layers, Search, ChevronLeft, ChevronRight, Package, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTranslation } from 'react-i18next';
import { deleteCategoryPage, getCategoryPages } from '../../api/categoryPageApi';
import { showDeleteConfirmation, showErrorAlert, showSuccessAlert } from '../../../../common/utils/alertUtils';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllCategoryPages = () => {
  const { t } = useTranslation('admin_categories');
  const { adminUser } = useAdminAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPages = useCallback(async () => {
    if (!adminUser?.token) return;
    setLoading(true);
    try {
      const data = await getCategoryPages(adminUser.token);
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      // toast.error(error.message || t('messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [adminUser.token, t]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const filtered = pages.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = p.category?.name?.toLowerCase()?.includes(term) || false;
    const slugMatch = p.category?.slug?.toLowerCase()?.includes(term) || false;
    return nameMatch || slugMatch;
  });

  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation(
      t('messages.delete_confirm_title'),
      t('landing_pages.messages.delete_confirm_text', { name })
    );
    if (!result.isConfirmed) return;

    try {
      await deleteCategoryPage(adminUser.token, id);
      setPages((prev) => prev.filter((item) => item._id !== id));
      await showSuccessAlert(
        t('messages.delete_success'),
        t('landing_pages.messages.delete_success', { defaultValue: 'Removed successfully' })
      );
    } catch (error) {
      showErrorAlert('Error', error.message);
    }
  };

  return (
    <div className="container-fluid py-8 bg-slate-50/30 min-h-screen px-4 md:px-8 max-w-7xl mx-auto font-sans">
      {/* Header Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-100 hidden md:block">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('landing_pages.title')}</h1>
                <PageInfoTooltip data={pageInfoData.allCategoryPages} />
              </div>
              <p className="text-slate-500 text-sm mt-1 font-medium">{t('landing_pages.subtitle')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Link to="/admin/category-pages/add" className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
              <Plus size={20} strokeWidth={3} /> {t('landing_pages.add_new')}
            </Link>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('landing_pages.table.category')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t('table.status')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t('landing_pages.table.sections')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t('landing_pages.table.updated')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right underline decoration-dotted">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="saathi-spinner mx-auto mb-4"></div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t('landing_pages.loading')}</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((page) => (
                  <tr key={page._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm">
                                {page.category?.image ? <img src={page.category.image} className="max-h-full max-w-full object-contain" /> : <Package size={22} className="text-slate-200" />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[15px] font-bold text-slate-900 tracking-tight">{page.category?.name || '---'}</div>
                                <div className="text-[11px] font-bold text-blue-500 bg-blue-50/50 px-2 rounded-lg inline-block mt-1 tracking-tight border border-blue-100/50">/{page.category?.slug || '---'}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${page.status === 'published' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        {t(`status.${page.status}`)}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex items-center justify-center gap-2 font-black text-slate-700">
                          <Layers size={14} className="text-slate-300" />
                          <span className="text-sm">{page.sections?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                                <Clock size={12} className="text-slate-300" />
                                {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex justify-end gap-2 pr-2">
                        <button
                          onClick={() => window.open(`/category/${page.category?.slug}`, '_blank')}
                          className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-[1.25rem] transition-all active:scale-90"
                          title={t('landing_pages.preview_live')}
                        >
                          <ExternalLink size={20} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/category-pages/edit/${page._id}`)}
                          className="p-3 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-[1.25rem] transition-all active:scale-90"
                          title={t('form.title_edit')}
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(page._id, page.category?.name || 'this category')}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[1.25rem] transition-all active:scale-90"
                          title={t('messages.delete_confirm_title')}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center text-slate-400">
                    <div className="bg-slate-50 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                        <FileText size={32} className="text-slate-200" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.25em]">{searchTerm ? t('no_matches') : t('landing_pages.no_pages')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .saathi-spinner { width: 32px; height: 32px; border: 3px solid #f8fafc; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default AllCategoryPages;
