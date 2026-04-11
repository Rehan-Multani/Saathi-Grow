import React, { useState, useEffect, useCallback } from 'react';
import { Save, Store, Phone, Mail, MapPin, X, Hash, Upload, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';

const EditBranchModal = ({ show, onHide, branch, onSave }) => {
    const { t } = useTranslation('admin_locations');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        isActive: true,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        }
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || '',
                code: branch.code || '',
                phone: branch.phone || '',
                email: branch.email || '',
                isActive: branch.isActive ?? true,
                address: branch.address && typeof branch.address === 'object' ? branch.address : {
                    street: branch.address || '',
                    city: '',
                    state: '',
                    zipCode: '',
                    location: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                }
            });
            setLogoPreview(branch.logo || null);
            setLogoFile(null);
        }
    }, [branch, show]);

    useEffect(() => {
        if (show) {
            const style = document.createElement('style');
            style.innerHTML = `.pac-container { z-index: 10000 !important; border-radius: 1rem; border: none; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); padding: 8px; font-family: inherit; }`;
            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleLocationSelect = useCallback((locData) => {
        setFormData(prev => ({
            ...prev,
            address: {
                street: locData.street || locData.fullAddress,
                city: locData.city,
                state: locData.state,
                zipCode: locData.zipCode,
                location: {
                    type: 'Point',
                    coordinates: [locData.lng, locData.lat]
                }
            }
        }));
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'address') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });
            if (logoFile) {
                data.append('logo', logoFile);
            }

            await onSave(data);
            onHide();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!show || !branch) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-200 font-sans border border-slate-200 max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-start">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Store size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('form.edit_title')}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('form.branch_info')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-100 transition-all border border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto scrollbar-thin space-y-8 scroll-smooth">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.branch_name')} <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.branch_code')} <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold uppercase text-slate-700 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.phone')}</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.email')}</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm relative group">
                            <label className="absolute top-4 left-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('form.branding')}</label>
                            <div className="relative w-full aspect-square mt-4 overflow-hidden rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-blue-300 transition-all flex items-center justify-center cursor-pointer shadow-inner">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <Upload size={32} />
                                        <span className="text-[9px] font-bold uppercase tracking-tight">Select Photo</span>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoChange} accept="image/*" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <MapPin size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-500 inline-block uppercase tracking-tight">{t('form.location_details')}</h3>
                        </div>

                        <div className="space-y-5">
                            <GoogleMapsInput
                                onLocationSelect={handleLocationSelect}
                                defaultValue={formData.address.street}
                                placeholder={t('form.search_address')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-inner"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.address')}</label>
                                    <input
                                        type="text"
                                        value={formData.address.street}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.city')}</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.state')}</label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.zip')}</label>
                                    <input
                                        type="text"
                                        value={formData.address.zipCode}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Shield className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-tight">{t('form.operational_status')}</h4>
                                <p className="text-[9px] text-slate-500 font-medium uppercase">{t('form.status_description')}</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={`w-12 h-6.5 rounded-full relative transition-all duration-300 cursor-pointer shadow-inner ${formData.isActive ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all duration-300 shadow-md ${formData.isActive ? 'right-1 bg-white' : 'left-1 bg-slate-400'}`} />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button onClick={onHide} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 rounded-xl border border-slate-200 bg-white transition-all active:scale-95 shadow-sm" disabled={loading}>
                        {t('form.discard')}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 border-none active:scale-95"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {t('form.submit_edit')}
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

export default EditBranchModal;
