import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Camera, RefreshCw, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../api/categoryApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const SubCategoryEditModal = ({ show, onHide, subCategory, onSave }) => {
    const { t } = useTranslation('admin_categories');
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
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        if (show && adminUser?.token) fetchCategories();
    }, [show, adminUser?.token]);

    useEffect(() => {
        if (subCategory && show) {
            setFormData({
                name: subCategory.name || '',
                slug: subCategory.slug || '',
                category: subCategory.category?._id || subCategory.category || '',
                status: subCategory.status || 'Active',
                description: subCategory.description || ''
            });
            setImagePreview(subCategory.image || null);
            setImageFile(null);
        }
    }, [subCategory, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('category', formData.category);
            data.append('status', formData.status);
            data.append('description', formData.description);
            if (imageFile) data.append('image', imageFile);
            await onSave(data);
        } catch (error) {
            // Managed by parent
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white px-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('form.title_edit')}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{subCategory?.name} ({t('subcategories.title').slice(0,-1)})</p>
                    </div>
                    <button onClick={onHide} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:px-10 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('subcategories.form.parent_label')}</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input-simple"
                                    disabled={categoriesLoading}
                                >
                                    <option value="">{t('subcategories.form.parent_placeholder')}</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('form.name_label')}</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input-simple text-base font-bold" placeholder={t('form.name_placeholder')} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">{t('form.slug_label')}</label>
                                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input-simple text-sm" placeholder={t('form.slug_placeholder')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">{t('form.visibility')}</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="form-input-simple">
                                        <option value="Active">{t('status.active')}</option>
                                        <option value="Inactive">{t('status.inactive')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">{t('form.desc_label')}</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="form-input-simple" placeholder={t('form.desc_placeholder')} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-slate-700 block text-center font-sans tracking-tight">{t('form.image')}</label>
                                <div 
                                    className="relative group aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all shadow-inner"
                                    onClick={() => document.getElementById('sc-image-edit').click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-full h-full object-contain p-4" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload size={32} className="text-slate-300 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('form.upload_hint')}</p>
                                        </div>
                                    )}
                                    <input type="file" id="sc-image-edit" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    {imagePreview && (
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                                            <div className="p-3 bg-white rounded-2xl shadow-xl text-blue-600 active:scale-95"><Camera size={20} /></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center gap-3">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('form.preview')}</span>
                                <div className="flex items-center gap-4 w-full px-2">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 border border-slate-100 transition-all group-hover:shadow-md">
                                        {imagePreview ? <img src={imagePreview} className="max-h-full max-w-full object-contain" /> : <Package size={20} className="text-slate-200" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-slate-900 truncate">{formData.name || '---'}</div>
                                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider opacity-60">{t('subcategories.label')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 px-10">
                    <button onClick={onHide} className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all font-sans" disabled={loading}>{t('form.cancel')}</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-10 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all font-sans">
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? t('form.saving') : t('form.save_publish')}
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .form-input-simple { 
                    width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; 
                    padding: 0.75rem 1.15rem; outline: none; transition: all 0.2s; font-size: 14px; font-weight: 500; font-family: inherit;
                }
                .form-input-simple:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.06); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default SubCategoryEditModal;
