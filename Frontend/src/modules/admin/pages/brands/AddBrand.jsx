import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Upload, Globe, FileText, Check, RefreshCw, Plus, Camera, Tag, ArrowLeft, Sparkles, Search, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createBrand } from '../../api/brandApi';
import { getCategories } from '../../api/categoryApi';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import MultiCategoryDropdown from '../../../../common/components/forms/MultiCategoryDropdown';

const AddBrand = () => {
    const { t } = useTranslation('admin_categories');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        categories: [],
        status: 'Active',
        website: '',
        description: ''
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempLogo, setTempLogo] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(adminUser.token);
                setCategories(data.filter(c => c.status === 'Active'));
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        if (adminUser?.token) fetchCategories();
    }, [adminUser]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempLogo(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };

    const handleCropComplete = (croppedImageBase64) => {
        setLogoPreview(croppedImageBase64);
        const file = dataURLtoFile(croppedImageBase64, `brand-logo-${Date.now()}.jpg`);
        setLogoFile(file);
        setShowCropper(false);
        setTempLogo(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || formData.categories.length === 0) return toast.error(t('messages.name_required'));

        setLoading(true);
        try {
            const brandData = new FormData();
            brandData.append('name', formData.name);
            brandData.append('category', JSON.stringify(formData.categories));
            brandData.append('status', formData.status);
            brandData.append('website', formData.website);
            brandData.append('description', formData.description);
            if (logoFile) brandData.append('logo', logoFile);

            await createBrand(adminUser.token, brandData);
            toast.success(t('messages.create_success'));
            navigate('/admin/brands');
        } catch (error) {
            toast.error(error.message || 'Failed to create brand');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-8 bg-slate-50/30 min-h-screen px-4 md:px-8 max-w-7xl mx-auto font-sans text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/brands')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight">{t('brands.add_new')}</h1>
                            <PageInfoTooltip info={pageInfoData.addBrand} />
                        </div>
                        <p className="text-slate-500 text-sm mt-1 font-medium">{t('brands.subtitle')}</p>
                    </div>
                </div>
                <button onClick={() => navigate('/admin/brands')} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-black tracking-widest uppercase text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                    <X size={18} /> {t('form.cancel')}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Brand Identity Section */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-8 shadow-sm">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><Tag size={22} strokeWidth={2.5} /></div>
                            <h2 className="text-lg font-black tracking-tight uppercase tracking-wider">{t('form.general_info')}</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('form.name_label')} <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={17} />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="brand-add-input pl-12 text-base font-bold" placeholder={t('form.name_placeholder')} />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('brands.table.category')} <span className="text-rose-500">*</span></label>
                                    <div className="relative group brand-add-input pl-12 pr-10 py-2.5">
                                        <Search className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={17} />
                                        <MultiCategoryDropdown
                                            categories={categories}
                                            selected={formData.categories}
                                            onChange={(categories) => setFormData((prev) => ({ ...prev, categories }))}
                                            placeholder={t('subcategories.form.parent_placeholder')}
                                            disabled={categoriesLoading}
                                        />
                                        <div className="absolute right-4 top-4 pointer-events-none opacity-40"><RefreshCw size={12} className={categoriesLoading ? 'animate-spin' : ''} /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('brands.form.website_label')}</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={17} />
                                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="brand-add-input pl-12 text-sm font-medium text-blue-600" placeholder={t('brands.form.website_placeholder')} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic px-1">{t('brands.form.website_hint')}</p>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('form.desc_label')}</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="brand-add-input !rounded-[1.5rem] py-4" placeholder={t('brands.form.desc_placeholder')} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Media Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm text-center space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6 text-left">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><ImageIcon size={20} /></div>
                            <h2 className="text-lg font-bold">{t('brands.form.logo_label')}</h2>
                        </div>

                        <div 
                            className="relative group w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all shadow-inner"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {logoPreview ? (
                                <img src={logoPreview} className="w-full h-full object-contain p-8" />
                            ) : (
                                <div className="space-y-5">
                                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm border border-slate-100 text-blue-600">
                                        <Upload size={30} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{t('form.upload_hint')}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{t('form.upload_types')}</p>
                                    </div>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleLogoChange} accept="image/*" disabled={loading} />
                        </div>
                        
                        <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center gap-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('form.preview')}</span>
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-slate-100">
                                    {logoPreview ? <img src={logoPreview} className="max-h-full max-w-full object-contain" /> : <Tag size={20} className="text-slate-100" />}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-[12px] font-black text-slate-900 truncate uppercase tracking-tight">{formData.name || '---'}</div>
                                    <div className="text-[9px] font-bold text-blue-500 uppercase tracking-wider opacity-60">{t('brands.form.brand_profile')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Publishing Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6 text-left">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-95"><Sparkles size={22} strokeWidth={2.5} /></div>
                            <h2 className="text-lg font-bold uppercase tracking-tight">{t('form.publishing')}</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('form.visibility')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Active', 'Inactive'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, status: s }))}
                                            className={`p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.status === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            {t(`status.${s.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-blue-600 text-white rounded-[1.75rem] text-[13px] font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
                            >
                                {loading ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} strokeWidth={2.5} />}
                                {loading ? t('form.saving') : t('form.save_publish')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <ImageCropperModal
                show={showCropper}
                imageSrc={tempLogo}
                onCancel={() => { setShowCropper(false); setTempLogo(null); }}
                onCropComplete={handleCropComplete}
                aspect={1}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .brand-add-input { 
                    width: 100%; background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 1.25rem; 
                    padding: 0.9rem 1.25rem; outline: none; transition: all 0.25s; font-size: 14px;
                }
                .brand-add-input.pl-12 {
                    padding-left: 3rem !important;
                }
                .brand-add-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.08); }
            `}} />
        </div>
    );
};

export default AddBrand;
