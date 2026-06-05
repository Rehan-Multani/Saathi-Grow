import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Plus, Edit, Trash2, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchAllLegalPages, createLegalPage, updateLegalPage, deleteLegalPage } from '../../api/legalApi';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const LegalManagement = () => {
    const { t } = useTranslation('admin_policies');
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        targetAudience: [],
        isActive: true
    });

    const audienceOptions = ['User', 'Vendor', 'Delivery Partner', 'Staff', 'Store Manager'];

    const loadPages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllLegalPages();
            setPages(data);
        } catch (error) {
            // toast.error(error.message || 'Failed to load legal pages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPages();
    }, [loadPages]);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const handleEdit = (page) => {
        setSelectedPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            targetAudience: page.targetAudience,
            isActive: page.isActive
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedPage(null);
        setFormData({
            title: '',
            slug: '',
            content: '',
            targetAudience: [],
            isActive: true
        });
        setShowModal(true);
    };

    const handleDelete = async (id, title) => {
        const result = await showDeleteConfirmation('Delete Legal Page?', `Are you sure you want to remove "${title}"?`);
        if (result.isConfirmed) {
            try {
                await deleteLegalPage(id);
                setPages(pages.filter(p => p._id !== id));
                toast.success('Page deleted successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to delete page');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.targetAudience.length === 0) {
            return toast.warning('Please select at least one target audience');
        }

        try {
            if (selectedPage) {
                const updated = await updateLegalPage(selectedPage._id, formData);
                setPages(pages.map(p => p._id === updated._id ? updated : p));
                toast.success('Page updated successfully');
            } else {
                const created = await createLegalPage(formData);
                setPages([created, ...pages]);
                toast.success('Page created successfully');
            }
            setShowModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to save page');
        }
    };

    const toggleAudience = (role) => {
        setFormData(prev => ({
            ...prev,
            targetAudience: prev.targetAudience.includes(role)
                ? prev.targetAudience.filter(r => r !== role)
                : [...prev.targetAudience, role]
        }));
    };

    const filtered = pages.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || p.targetAudience.includes(selectedRole);
        return matchesSearch && matchesRole;
    });

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
                        <PageInfoTooltip data={pageInfoData.legalManagement} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('subtitle')}</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search policies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-black uppercase text-slate-700 outline-none focus:border-blue-500 shadow-sm transition-all placeholder:normal-case placeholder:font-normal"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        <span>{t('add_btn')}</span>
                    </button>
                </div>
            </div>

            {/* Role Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('filter_role')}</span>
                <div className="flex flex-wrap gap-2">
                    {['All', ...audienceOptions].map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border ${
                                selectedRole === role
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                        >
                            {role === 'All' ? t('all_roles') : role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Policy Documents</h5>
                </div>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={32} className="text-blue-600 animate-spin" />
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Fetching Policies...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-slate-600 uppercase text-[11px] tracking-widest">
                                    <th className="px-8 py-5">{t('table.title')}</th>
                                    <th className="px-6 py-5">{t('table.roles')}</th>
                                    <th className="px-6 py-5 text-center">{t('table.status')}</th>
                                    <th className="px-6 py-5 text-center">{t('table.updated')}</th>
                                    <th className="px-8 py-5 text-right">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold">
                                {filtered.length > 0 ? filtered.map((page) => (
                                    <tr key={page._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{page.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 opacity-70">/{page.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-none align-middle">
                                            <div className="flex flex-wrap gap-1.5 align-middle">
                                                {page.targetAudience.map(role => (
                                                    <span key={role} className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-md border border-slate-200 align-middle">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center align-middle">
                                            {page.isActive ? (
                                                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight align-middle mb-[6px]">
                                                    <CheckCircle size={10} /> {t('status.active')}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1 bg-rose-50 text-rose-500 border border-rose-100 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight align-middle mb-[6px]">
                                                    <XCircle size={10} /> {t('status.inactive')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center text-[11px] font-black text-slate-600 uppercase align-middle">
                                            {new Date(page.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right align-middle text-slate-500">
                                            <div className="flex justify-end gap-2 align-middle">
                                                <button
                                                    onClick={() => handleEdit(page)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(page._id, page.title)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-none">No policies found matching criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm px-4 md:px-0">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">{selectedPage ? t('modal.edit_title') : t('modal.add_title')}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="policy-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('modal.label_title')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder={t('modal.placeholder_title')}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:font-normal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('modal.label_slug')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') })}
                                            placeholder={t('modal.placeholder_slug')}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:font-normal font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t('modal.label_audience')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {audienceOptions.map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => toggleAudience(role)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                                                    formData.targetAudience.includes(role)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('modal.label_content')}</label>
                                    <textarea
                                        required
                                        rows="10"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder={t('modal.placeholder_content')}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all leading-relaxed resize-y scrollbar-thin"
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            name="toggle"
                                            id="toggle"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out ${formData.isActive ? 'transform translate-x-6 border-blue-600' : 'border-slate-300'}`}
                                            style={{ top: '2px', left: '2px' }}
                                        />
                                        <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${formData.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}></label>
                                    </div>
                                    <label htmlFor="toggle" className="text-xs font-black text-slate-700 uppercase tracking-tight cursor-pointer select-none">
                                        {t('modal.label_active')}
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                {t('modal.cancel')}
                            </button>
                            <button
                                type="submit"
                                form="policy-form"
                                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                            >
                                {selectedPage ? t('modal.save') : t('modal.create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LegalManagement;
