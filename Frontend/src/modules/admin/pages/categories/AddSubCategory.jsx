import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Image as ImageIcon, Layers, ArrowLeft, RefreshCw, Sparkles, Package, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createSubCategory } from '../../api/subcategoryApi';
import { getCategories } from '../../api/categoryApi';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AddSubCategory = () => {
    const { t } = useTranslation('admin_categories');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category: '',
        status: 'Active',
        description: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(adminUser.token);
                setCategories(data.filter(c => c.status === 'Active'));
            } catch (error) {
                // toast.error(t('loading_failed'));
            } finally {
                setCategoriesLoading(false);
            }
        };
        if (adminUser?.token) fetchCategories();
    }, [adminUser.token, t]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error(t('messages.image_size_error'));
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.category) {
            return toast.error(t('messages.name_required'));
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('category', formData.category);
            data.append('status', formData.status);
            data.append('description', formData.description);
            if (imageFile) data.append('image', imageFile);

            await createSubCategory(adminUser.token, data);
            toast.success(t('messages.create_success'));
            navigate('/admin/subcategories');
        } catch (error) {
            toast.error(error.message || 'Failed to create subcategory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/subcategories')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 hover:border-blue-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('subcategories.add_new')}</h1>
                        <p className="text-slate-500 text-[11px] font-medium leading-tight">{t('subcategories.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => navigate('/admin/subcategories')} 
                        className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        {t('form.cancel')}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: General Info */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                <Layers size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 inline-block">1. {t('form.general_info')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('subcategories.form.parent_label')} <span className="text-rose-500">*</span></label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
                                    required
                                    disabled={categoriesLoading || loading}
                                >
                                    <option value="">{t('subcategories.form.parent_placeholder')}</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('form.name_label')} <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700" 
                                    placeholder={t('form.name_placeholder')} 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('form.slug_label')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">/</span>
                                    <input 
                                        type="text" 
                                        name="slug" 
                                        value={formData.slug} 
                                        onChange={handleChange} 
                                        className="w-full pl-8 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-400"
                                        placeholder={t('form.slug_placeholder')}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase italic px-1">{t('form.slug_hint')}</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('form.desc_label')}</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows={5} 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-medium resize-none"
                                    placeholder={t('form.desc_placeholder')} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Media & Publish */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <ImageIcon size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 inline-block">2. {t('form.image')}</h3>
                        </div>

                        <div className="relative group w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all shadow-inner">
                            {imagePreview ? (
                                <img src={imagePreview} className="w-4/5 h-4/5 object-contain p-4 transition-transform group-hover:scale-105" alt="Preview" />
                            ) : (
                                <div className="space-y-3 text-center">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 text-blue-500">
                                        <Upload size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-900">{t('form.upload_hint')}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{t('form.upload_types')}</p>
                                    </div>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" disabled={loading} />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('form.preview')}</span>
                             <div className="flex items-center gap-3 w-full bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                 <div className="w-10 h-10 rounded-lg bg-slate-50 shadow-sm flex items-center justify-center p-2 border border-slate-100">
                                     {imagePreview ? <img src={imagePreview} className="max-h-full max-w-full object-contain" alt="" /> : <Package size={16} className="text-slate-200" />}
                                 </div>
                                 <div className="min-w-0">
                                     <div className="text-[11px] font-bold text-slate-900 truncate uppercase tracking-tight">{formData.name || 'Title...'}</div>
                                     <div className="text-[9px] font-bold text-blue-500 uppercase mt-0.5 tracking-tighter opacity-60">Subcategory</div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 border border-blue-700">
                                <Sparkles size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-800 inline-block">3. {t('form.publishing')}</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('form.visibility')}</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700" disabled={loading}>
                                    <option value="Active">{t('status.active')}</option>
                                    <option value="Inactive">{t('status.inactive')}</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || categoriesLoading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                {loading ? t('form.saving') : t('form.save_publish')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AddSubCategory;
