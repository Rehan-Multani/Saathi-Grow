import React, { useEffect, useState, useRef } from 'react';
import { Save, Camera, X, Globe, FileText, Check, RefreshCw, Upload, Search, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { getCategories } from '../../api/categoryApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const BrandEditModal = ({ show, onHide, brand, onSave }) => {
    const { t } = useTranslation('admin_categories');
    const { adminUser } = useAdminAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        status: 'Active',
        website: '',
        description: ''
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempLogo, setTempLogo] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(adminUser.token);
                setCategories(data.filter(c => c.status === 'Active'));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        if (show && adminUser?.token) fetchCategories();
    }, [show, adminUser?.token]);

    useEffect(() => {
        if (brand && show) {
            setFormData({
                name: brand.name || '',
                category: brand.category || '',
                status: brand.status || 'Active',
                website: brand.website || '',
                description: brand.description || ''
            });
            setLogoPreview(brand.logo || null);
            setLogoFile(null);
        }
    }, [brand, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', formData.category);
            data.append('status', formData.status);
            data.append('website', formData.website);
            data.append('description', formData.description);
            if (logoFile) data.append('logo', logoFile);
            await onSave(data);
        } catch (err) {
            // Managed by parent
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative text-slate-900">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white px-8">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{t('form.title_edit')}</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{t('brands.form.identity_management')}</p>
                    </div>
                    <button onClick={onHide} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all active:scale-90"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        {/* Logo Upload Section */}
                        <div className="md:col-span-4 flex flex-col items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('brands.form.logo_label')}</label>
                            <div className="relative group">
                                <div 
                                    className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-blue-400 transition-all cursor-pointer"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} className="w-full h-full object-contain p-4" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload size={32} className="mx-auto mb-2 text-slate-300" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('form.upload_hint')}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-90 transition-all"
                                >
                                    <Camera size={18} strokeWidth={2.5} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </div>
                            <div className="mt-8 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] w-full space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Live Brand Mark</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-slate-200/50">
                                        {logoPreview ? <img src={logoPreview} className="max-h-full max-w-full object-contain" /> : <Package size={20} className="text-slate-100" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-black text-slate-800 truncate leading-none uppercase tracking-tight">{formData.name || 'UNNAMED'}</div>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase truncate">{formData.category || 'NO CATEGORY'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields Section */}
                        <div className="md:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('form.name_label')}</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="brand-input with-icon font-bold text-slate-800" placeholder={t('form.name_placeholder')} />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('brands.table.category')}</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <select name="category" value={formData.category} onChange={handleChange} required className="brand-input with-icon font-bold appearance-none">
                                            <option value="">{t('subcategories.form.parent_placeholder')}</option>
                                            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><RefreshCw size={12} className="animate-spin-slow" /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('brands.form.website_label')}</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="brand-input with-icon font-medium text-blue-600" placeholder={t('brands.form.website_placeholder')} />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('form.desc_label')}</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="brand-input !rounded-[1.5rem] py-4" placeholder={t('brands.form.desc_placeholder')} />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('form.visibility')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Active', 'Inactive'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, status: s }))}
                                            className={`p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formData.status === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            {formData.status === s && <Check size={14} strokeWidth={3} />}
                                            {t(`status.${s.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-4 px-10">
                    <button onClick={onHide} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-600 transition-all tracking-widest" disabled={loading}>{t('form.cancel')}</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-12 py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center gap-3 hover:bg-blue-700 active:scale-[0.97] transition-all">
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {loading ? t('form.saving') : t('form.save_publish')}
                    </button>
                </div>

                <ImageCropperModal
                    show={showCropper}
                    imageSrc={tempLogo}
                    onCancel={() => { setShowCropper(false); setTempLogo(null); }}
                    onCropComplete={handleCropComplete}
                    aspect={1}
                />
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .brand-input { 
                    width: 100%; background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 1.15rem; 
                    padding: 0.85rem 1.25rem; outline: none; transition: all 0.25s; font-size: 14px;
                }
                .with-icon { padding-left: 3rem !important; }
                .brand-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.05); }
                .animate-spin-slow { animation: spin 4s linear infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default BrandEditModal;
