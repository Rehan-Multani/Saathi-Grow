import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Info, ImageIcon, LayoutGrid, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SliderEditModal = ({ show, onHide, slider, onSave }) => {
    const { t } = useTranslation('admin_offers');
    const [formData, setFormData] = useState({
        title: '',
        location: 'Home Page - Top',
        status: 'Active',
        images: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (slider) {
            setFormData({
                title: slider.title || '',
                location: slider.location || 'Home Page - Top',
                status: slider.status || 'Active',
                images: slider.mockImages || []
            });
        }
    }, [slider, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, images: prev.images.concat(fileArray) }));
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            onSave({ ...slider, ...formData, slides: formData.images.length });
            setLoading(false);
            onHide();
        }, 500);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-200 font-sans border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('form.edit_slider')}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('form.slider_info')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-100 transition-all border border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 scrollbar-thin max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.slider_name')}</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Main Slider"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.slider_pos')}</label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat uppercase"
                            >
                                <option>Home Page - Top</option>
                                <option>Home Page - Middle</option>
                                <option>Category Page Header</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat uppercase"
                            >
                                <option value="Active">{t('status.active')}</option>
                                <option value="Inactive">{t('status.offline')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Manage Slides */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                             <div className="flex items-center gap-2">
                                <LayoutGrid size={14} className="text-blue-500" />
                                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{t('form.manage_slides')}</h4>
                             </div>
                             <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 font-bold uppercase">{formData.images.length} {t('form.images')}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative aspect-[3/2] rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-[3/2] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-white transition-all group shadow-inner">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Upload size={18} className="text-blue-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t('form.add_image')}</span>
                                <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                            </label>
                        </div>
                        
                        <div className="flex items-start gap-3 bg-slate-900 rounded-2xl p-4 shadow-xl">
                            <Info className="text-blue-400 mt-0.5 shrink-0" size={16} />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">{t('form.slider_help')}</p>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button onClick={onHide} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 rounded-xl border border-slate-200 bg-white">
                        {t('form.cancel')}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('form.update')}
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default SliderEditModal;
