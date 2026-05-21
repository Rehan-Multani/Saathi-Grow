import React, { useState, useEffect } from 'react';
import { Save, Store, User, Phone, Mail, MapPin, Camera, X, Loader2, Shield, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';

const VendorEditModal = ({ show, onHide, vendor, onSave }) => {
    const { t } = useTranslation('admin_vendors');
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        },
        description: '',
        status: 'Pending'
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (vendor && show) {
            setFormData({
                storeName: vendor.storeName || '',
                ownerName: vendor.ownerName || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address && typeof vendor.address === 'object' ? {
                    street: vendor.address.street || '',
                    city: vendor.address.city || '',
                    state: vendor.address.state || '',
                    zipCode: vendor.address.zipCode || '',
                    location: vendor.address.location || {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                } : {
                    street: vendor.address || '',
                    city: '',
                    state: '',
                    zipCode: '',
                    location: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                },
                description: vendor.description || '',
                status: vendor.status || 'Pending'
            });
            setLogoPreview(vendor.logo || null);
            setLogoFile(null);
        }
    }, [vendor, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'ownerName') {
            const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else if (name === 'phone') {
            const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocationSelect = React.useCallback((locData) => {
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
            reader.onloadend = () => setLogoPreview(reader.result);
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
            if (logoFile) data.append('logo', logoFile);

            await updateVendor(adminUser.token, vendor._id, data);
            toast.success('Vendor updated successfully');
            onSave();
            onHide();
        } catch (error) {
            toast.error(error.message || 'Failed to update vendor');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onHide} />
            <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh] border border-slate-100">

                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-blue-600">
                            <Store size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{t('form.edit')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('subtitle')}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onHide} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border-none bg-transparent">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 space-y-10 overflow-y-auto scrollbar-thin grow">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('form.store_name')}</label>
                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-[1.25rem] py-3.5 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('form.owner_name')}</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-[1.25rem] py-3.5 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('form.email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-[1.25rem] py-3.5 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('form.phone')}</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={10}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-[1.25rem] py-3.5 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                required
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-5 pt-8 border-t border-slate-50">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin size={14} /> {t('form.address')}
                        </label>
                        <GoogleMapsInput
                            onLocationSelect={handleLocationSelect}
                            defaultValue={formData.address.street}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder={t('form.street')}
                                value={formData.address.street}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    setFormData({ ...formData, address: { ...formData.address, street: val } });
                                }}
                                className="w-full bg-white border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all font-sans shadow-sm"
                            />
                            <input
                                type="text"
                                placeholder={t('form.city')}
                                value={formData.address.city}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    setFormData({ ...formData, address: { ...formData.address, city: val } });
                                }}
                                className="w-full bg-white border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all font-sans shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Status & Logo */}
                    <div className="flex flex-col md:flex-row gap-10 items-start pt-8 border-t border-slate-50">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('form.status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] py-3.5 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="Active">{t('all_vendors.status.active')}</option>
                                <option value="Pending">{t('all_vendors.status.pending')}</option>
                                <option value="Inactive">{t('all_vendors.status.inactive')}</option>
                            </select>
                        </div>
                        <div className="w-full md:w-36 shrink-0 relative group">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1 text-center">{t('form.logo')}</label>
                            <div className="relative aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 shadow-inner">
                                {logoPreview ? (
                                    <img src={logoPreview} className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={24} className="text-slate-300 group-hover:scale-110 transition-all" />
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer px-0 py-0" onChange={handleLogoChange} accept="image/*" title="" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/10 flex justify-end gap-4 shrink-0">
                    <button type="button" onClick={onHide} className="px-8 py-3.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-[1.25rem] hover:bg-slate-50 transition-all active:scale-95 shadow-sm uppercase tracking-widest">{t('form.cancel')}</button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3.5 bg-blue-600 text-white rounded-[1.25rem] text-[10px] font-bold tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 uppercase flex items-center gap-3 border-none"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('form.save')}
                    </button>
                </div>
            </form>
            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorEditModal;
