import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Link as LinkIcon, Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BannerEditModal = ({ show, onHide, banner, onSave }) => {
    const { t } = useTranslation('admin_offers');
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        link: '',
        status: 'Active',
        image: null,
        preview: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (banner) {
            setFormData({
                id: banner.id,
                title: banner.title || '',
                link: banner.link || '',
                status: banner.status || 'Active',
                image: banner.image,
                preview: banner.image
            });
        }
    }, [banner, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result, preview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            onSave({
                ...banner,
                title: formData.title,
                link: formData.link,
                status: formData.status,
                image: formData.preview
            });
            setLoading(false);
            onHide();
        }, 500);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-200 font-sans border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('form.edit_banner')}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('form.banner_info')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-100 transition-all border border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.banner_name')}</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Winter Collection"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.link')}</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleChange}
                                        placeholder="/offers"
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                    />
                                </div>
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
                    </div>

                    {/* Image Area */}
                    <div className="space-y-3">
                         <div className="flex items-center gap-2 px-1">
                            <Upload size={14} className="text-blue-500" />
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{t('form.banner_image')}</h4>
                         </div>
                         
                         <div className="relative aspect-[21/9] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 group overflow-hidden shadow-inner transition-all">
                            {formData.preview ? (
                                <>
                                    <img src={formData.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Banner" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFormData(p => ({...p, preview: null})); }}
                                            className="bg-rose-600 p-2 rounded-xl"
                                        ><X size={18} /></button>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('form.remove_asset')}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6" onClick={() => document.getElementById('banner-img-input').click()}>
                                    <div className="bg-blue-600/10 p-4 rounded-full text-blue-600 inline-block mb-3">
                                        <Upload size={28} />
                                    </div>
                                    <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">{t('form.upload_text')}</div>
                                </div>
                            )}
                            <input id="banner-img-input" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                         </div>

                         <div className="flex items-start gap-3 bg-slate-900 rounded-2xl p-4 shadow-xl">
                            <Info className="text-blue-400 mt-0.5 shrink-0" size={16} />
                            <p className="text-[10px] text-slate-400 font-medium uppercase">{t('form.banner_help')}</p>
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
        </div>
    );
};

export default BannerEditModal;
