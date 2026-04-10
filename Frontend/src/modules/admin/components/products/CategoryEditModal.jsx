import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Upload, Palette, Image as ImageIcon, Camera, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const PRESET_COLORS = [
    '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FAE8FF', '#F1F5F9',
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#ffffff', '#000000'
];

const CategoryEditModal = ({ show, onHide, category, onSave }) => {
    const { t } = useTranslation('admin_categories');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: 'Active',
        description: '',
        bgColor: '#DBEAFE'
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (category && show) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                status: category.status || 'Active',
                description: category.description || '',
                bgColor: category.bgColor || '#DBEAFE'
            });
            setImagePreview(category.image || null);
            setImageFile(null);
        }
    }, [category, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('status', formData.status);
            data.append('description', formData.description);
            data.append('bgColor', formData.bgColor);
            if (imageFile) data.append('image', imageFile);
            await onSave(data);
        } catch (error) {
            // Error managed by parent
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white px-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('form.title_edit')}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{category?.name}</p>
                    </div>
                    <button onClick={onHide} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:px-10 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('form.name_label')}</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input-simple" placeholder={t('form.name_placeholder')} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.slug_label')}</label>
                                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input-simple" placeholder={t('form.slug_placeholder')} />
                                    <p className="text-[10px] text-slate-400 italic">{t('form.slug_hint')}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.visibility')}</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="form-input-simple">
                                        <option value="Active">{t('status.active')}</option>
                                        <option value="Inactive">{t('status.inactive')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('form.desc_label')}</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="form-input-simple" placeholder={t('form.desc_placeholder')} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-slate-700 block text-center">{t('form.image')}</label>
                                <div 
                                    className="relative group aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ backgroundColor: formData.bgColor }}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-4/5 h-4/5 object-contain" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload size={32} className="text-slate-300 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('form.upload_hint')}</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                                    {imagePreview && (
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <div className="p-2 bg-white rounded-full shadow-lg text-blue-600"><Camera size={16} /></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block text-center">{t('form.styling')}</label>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, bgColor: color }))}
                                            className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-slate-100 transition-transform active:scale-90"
                                            style={{ 
                                                backgroundColor: color,
                                                ringColor: formData.bgColor === color ? color : 'transparent',
                                                ringWidth: formData.bgColor === color ? '2px' : '0px'
                                            }}
                                        />
                                    ))}
                                    <input 
                                        type="color" 
                                        name="bgColor" 
                                        value={formData.bgColor} 
                                        onChange={handleChange} 
                                        className="w-6 h-6 rounded-full border-none p-0 bg-transparent cursor-pointer" 
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('form.preview')}</p>
                                <div className="flex items-center gap-4 justify-center">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-2" style={{ backgroundColor: formData.bgColor }}>
                                        {imagePreview ? <img src={imagePreview} className="max-h-full max-w-full object-contain" /> : <ImageIcon size={20} className="text-slate-200" />}
                                    </div>
                                    <div className="font-bold text-sm text-slate-900 truncate max-w-[120px]">{formData.name || '---'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 px-10">
                    <button onClick={onHide} className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all" disabled={loading}>{t('form.cancel')}</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-10 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? t('form.saving') : t('form.save_publish')}
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .form-input-simple { 
                    width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.85rem; 
                    padding: 0.75rem 1rem; outline: none; transition: all 0.2s; font-size: 14px; font-weight: 500;
                }
                .form-input-simple:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default CategoryEditModal;
