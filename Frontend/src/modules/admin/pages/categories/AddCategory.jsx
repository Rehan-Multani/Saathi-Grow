import React, { useState } from 'react';
import { Save, X, Upload, Palette, Image as ImageIcon, Sparkles, ArrowLeft, RefreshCw, Check, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createCategory } from '../../api/categoryApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const PRESET_COLORS = [
    '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FAE8FF', '#F1F5F9',
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#ffffff', '#000000'
];

const AddCategory = () => {
    const { t } = useTranslation('admin_categories');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: 'Active',
        description: '',
        bgColor: '#DBEAFE'
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error(t('messages.image_size_error'));
            }
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
        if (!formData.name) return toast.error(t('messages.name_required'));

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('status', formData.status);
            data.append('description', formData.description);
            data.append('bgColor', formData.bgColor);
            if (imageFile) data.append('image', imageFile);

            await createCategory(adminUser.token, data);
            toast.success(t('messages.create_success'));
            navigate('/admin/categories');
        } catch (error) {
            toast.error(error.message || 'Failed to create category');
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
                        onClick={() => navigate('/admin/categories')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 hover:border-blue-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('form.title_add')}</h1>
                        <p className="text-slate-500 text-[11px] font-medium leading-tight">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => navigate('/admin/categories')} 
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
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Layers size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 inline-block">1. {t('form.general_info')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 md:col-span-2">
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

                            <div className="space-y-1.5 md:col-span-2">
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

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('form.desc_label')}</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows={4} 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-medium resize-none"
                                    placeholder={t('form.desc_placeholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Styling */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                                <Palette size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-purple-500 inline-block">2. {t('form.styling')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, bgColor: color }))}
                                        className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${formData.bgColor === color ? 'border-purple-600 shadow-lg' : 'border-white shadow-sm'}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {formData.bgColor === color && <Check size={16} className={`${color === '#000000' ? 'text-white' : 'text-slate-900'}`} strokeWidth={3} />}
                                    </button>
                                ))}
                                <div className="w-10 h-10 relative rounded-xl border-2 border-slate-100 overflow-hidden group shadow-sm">
                                    <input 
                                        type="color" 
                                        name="bgColor" 
                                        value={formData.bgColor} 
                                        onChange={handleChange} 
                                        className="absolute inset-0 w-full h-full cursor-pointer scale-150" 
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-[150px]">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">HEX:</span>
                                <span className="text-xs font-bold text-slate-700 tracking-wider underline decoration-dotted decoration-slate-300">{formData.bgColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Media & Publish */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                <ImageIcon size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 inline-block">3. {t('form.image')}</h3>
                        </div>

                        <div 
                            className="relative group w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
                            style={{ backgroundColor: formData.bgColor }}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-105" alt="Preview" />
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

                        <div className="space-y-4 pt-2">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('form.preview')}</span>
                                <div className="flex items-center gap-3 w-full bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center p-2" style={{ backgroundColor: formData.bgColor }}>
                                        {imagePreview ? <img src={imagePreview} className="max-h-full max-w-full object-contain" alt="" /> : <ImageIcon size={16} className="text-slate-200" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-bold text-slate-900 truncate uppercase tracking-tight">{formData.name || 'Category Name'}</div>
                                        <div className="text-[9px] font-bold text-slate-300 uppercase mt-0.5 tracking-tighter">Availability: {t(`status.${formData.status.toLowerCase()}`)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase">{t('form.visibility')}</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                >
                                    <option value="Active">{t('status.active')}</option>
                                    <option value="Inactive">{t('status.inactive')}</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
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

export default AddCategory;
