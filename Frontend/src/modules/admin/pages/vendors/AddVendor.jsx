import React, { useState } from 'react';
import { Save, Store, User, Phone, MapPin, Shield, CheckCircle2, ArrowLeft, Info, Camera, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';

const AddVendor = () => {
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: { type: 'Point', coordinates: [0, 0] }
        },
        description: '',
        status: 'Pending'
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: '' }));
        if (name === 'ownerName') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^a-zA-Z\s]/g, '') }));
        } else if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocationSelect = React.useCallback((locData) => {
        setErrors(prev => ({ ...prev, street: '', city: '' }));
        setFormData(prev => ({
            ...prev,
            address: {
                street: locData.street || locData.fullAddress,
                city: locData.city,
                state: locData.state,
                zipCode: locData.zipCode,
                location: { type: 'Point', coordinates: [locData.lng, locData.lat] }
            }
        }));
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setErrors(prev => ({ ...prev, logo: '' }));
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.storeName.trim()) newErrors.storeName = 'Store Name is required';
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner Name is required';
        if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = 'Valid email address is required';
        if (!formData.phone.trim() || formData.phone.length !== 10) newErrors.phone = 'Valid 10-digit phone number is required';
        if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.address.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.address.city.trim()) newErrors.city = 'City is required';
        if (!logoFile) newErrors.logo = 'Store logo is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the highlighted errors before submitting.');
            return;
        }
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, key === 'address' ? JSON.stringify(formData[key]) : formData[key]);
            });
            if (logoFile) data.append('logo', logoFile);
            await createVendor(adminUser.token, data);
            toast.success(t('form.add_success'));
            navigate('/admin/vendors');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to add vendor');
        } finally {
            setLoading(false);
        }
    };

    // — UI helpers —
    const fieldCls = (key, extra = '') =>
        `w-full bg-slate-50/50 border rounded-xl py-3 px-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-inner ${errors[key] ? 'border-red-400 bg-red-50/30 focus:border-red-500' : 'border-slate-200 focus:border-blue-500/50 focus:bg-white'} ${extra}`;

    const fieldClsIcon = (key) =>
        `w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl text-xs font-bold text-slate-700 outline-none transition-all shadow-inner ${errors[key] ? 'border-red-400 bg-red-50/30 focus:border-red-500' : 'border-slate-200 focus:border-blue-500/50 focus:bg-white'}`;

    const RequiredLabel = ({ children }) => (
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
            {children}
            <span className="text-red-500 text-[14px] leading-none font-black">*</span>
        </label>
    );

    const FieldError = ({ errKey }) =>
        errors[errKey] ? (
            <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 inline-block shrink-0" />
                {errors[errKey]}
            </p>
        ) : null;

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/vendors')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border-none bg-transparent">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('add_new')}</h1>
                        <p className="text-slate-500 text-xs mt-1 font-medium">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => navigate('/admin/vendors')} className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        {t('form.cancel')}
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 md:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 border-none">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('add_new')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* LEFT: Main form */}
                <div className="lg:col-span-2 space-y-8 mt-2">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Section heading */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Store size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">{t('all_vendors.table.store')}</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Basic Information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Store Name */}
                            <div className="space-y-1.5">
                                <RequiredLabel>{t('form.store_name')}</RequiredLabel>
                                <input type="text" name="storeName" placeholder={t('form.store_name_placeholder')} value={formData.storeName} onChange={handleChange} className={fieldCls('storeName')} />
                                <FieldError errKey="storeName" />
                            </div>

                            {/* Owner Name */}
                            <div className="space-y-1.5">
                                <RequiredLabel>{t('form.owner_name')}</RequiredLabel>
                                <div className="relative group">
                                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.ownerName ? 'text-red-400' : 'text-slate-300 group-focus-within:text-blue-500'}`} size={16} />
                                    <input type="text" name="ownerName" placeholder={t('form.owner_name_placeholder')} value={formData.ownerName} onChange={handleChange} className={fieldClsIcon('ownerName')} />
                                </div>
                                <FieldError errKey="ownerName" />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <RequiredLabel>{t('form.email')}</RequiredLabel>
                                <input type="email" name="email" placeholder={t('form.email_placeholder')} value={formData.email} onChange={handleChange} className={fieldCls('email')} />
                                <FieldError errKey="email" />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <RequiredLabel>{t('form.phone')}</RequiredLabel>
                                <div className="relative group">
                                    <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? 'text-red-400' : 'text-slate-300 group-focus-within:text-blue-500'}`} size={16} />
                                    <input type="text" name="phone" placeholder={t('form.phone_placeholder')} value={formData.phone} onChange={handleChange} maxLength={10} className={fieldClsIcon('phone')} />
                                </div>
                                <FieldError errKey="phone" />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <RequiredLabel>Password</RequiredLabel>
                                <div className="relative group">
                                    <Shield className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-300 group-focus-within:text-blue-500'}`} size={16} />
                                    <input type="text" name="password" placeholder="Enter initial password" value={formData.password} onChange={handleChange} className={fieldClsIcon('password')} />
                                </div>
                                <FieldError errKey="password" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">{t('form.address')}</h3>
                            </div>
                            <GoogleMapsInput onLocationSelect={handleLocationSelect} placeholder="Search location to autofill..." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder={`${t('form.street')} *`}
                                        value={formData.address.street}
                                        onChange={(e) => {
                                            setErrors(prev => ({ ...prev, street: '' }));
                                            setFormData({ ...formData, address: { ...formData.address, street: e.target.value.replace(/[^a-zA-Z\s]/g, '') } });
                                        }}
                                        className={`w-full border rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-sm ${errors.street ? 'border-red-400 bg-red-50/30' : 'bg-white border-slate-200 focus:border-blue-500'}`}
                                    />
                                    <FieldError errKey="street" />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder={`${t('form.city')} *`}
                                        value={formData.address.city}
                                        onChange={(e) => {
                                            setErrors(prev => ({ ...prev, city: '' }));
                                            setFormData({ ...formData, address: { ...formData.address, city: e.target.value.replace(/[^a-zA-Z\s]/g, '') } });
                                        }}
                                        className={`w-full border rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-sm ${errors.city ? 'border-red-400 bg-red-50/30' : 'bg-white border-slate-200 focus:border-blue-500'}`}
                                    />
                                    <FieldError errKey="city" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Logo + Status */}
                <div className="space-y-6 lg:mt-2">
                    {/* Logo Card */}
                    <div className={`bg-white rounded-[2rem] border shadow-sm p-8 animate-in slide-in-from-right-4 duration-500 ${errors.logo ? 'border-red-300' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${errors.logo ? 'bg-red-50 text-red-500 border-red-100' : 'bg-pink-50 text-pink-600 border-pink-100'}`}>
                                <Camera size={16} />
                            </div>
                            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none flex items-center gap-1">
                                {t('form.logo')}
                                <span className="text-red-500 text-[14px] leading-none font-black">*</span>
                            </h3>
                        </div>

                        <div className={`relative group aspect-square rounded-[1.5rem] border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${errors.logo ? 'border-red-300 bg-red-50/30 hover:border-red-400' : 'border-slate-100 bg-slate-50/50 hover:border-blue-300 hover:bg-white'}`}>
                            {logoPreview ? (
                                <div className="relative w-full h-full">
                                    <img src={logoPreview} className="w-full h-full object-cover" alt="logo preview" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); }} className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-50 transition-all border-none">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center gap-3 transition-colors ${errors.logo ? 'text-red-300 group-hover:text-red-400' : 'text-slate-300 group-hover:text-blue-400'}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                        <Store size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('form.logo_upload')}</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoChange} accept="image/*" title="" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-4">Max size: 2MB</p>
                        {errors.logo && (
                            <p className="text-[10px] text-red-500 font-bold mt-2 text-center flex items-center justify-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                                {errors.logo}
                            </p>
                        )}
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-6">{t('form.status')}</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600">{t('form.status_pending')}</span>
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                                <Info className="text-blue-500 mt-0.5 shrink-0" size={16} />
                                <p className="text-[10px] text-blue-700 font-bold leading-normal italic">{t('form.status_msg')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVendor;
