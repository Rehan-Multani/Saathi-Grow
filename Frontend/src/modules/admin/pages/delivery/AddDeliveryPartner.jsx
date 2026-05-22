import React, { useState } from 'react';
import { 
    User, Mail, Phone, Save, ArrowLeft, 
    Truck, Camera, Info, ShieldCheck, CreditCard, ChevronRight, Loader2, CheckCircle, Package, Store, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as api from '../../api/adminDeliveryApi';

const AddDeliveryPartner = () => {
    const { t } = useTranslation('admin_delivery');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: Math.random().toString(36).slice(-8).toUpperCase(),
        vehicleType: 'Bike',
        vehicleNumber: '',
        profileImage: null
    });

    const [previewImage, setPreviewImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else if (name === 'phone') {
            const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else if (name === 'vehicleNumber') {
            let val = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            let cleaned = '';
            for (let i = 0; i < val.length && i < 10; i++) {
                const char = val[i];
                if (i === 0 || i === 1) {
                    if (/[A-Z]/.test(char)) cleaned += char;
                } else if (i === 2 || i === 3) {
                    if (/[0-9]/.test(char)) cleaned += char;
                } else if (i === 4 || i === 5) {
                    if (/[A-Z]/.test(char)) cleaned += char;
                } else if (i >= 6 && i <= 9) {
                    if (/[0-9]/.test(char)) cleaned += char;
                }
            }
            setFormData(prev => ({ ...prev, [name]: cleaned }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profileImage: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || (!formData.password && !formData.phone)) {
            toast.warning("Essential rider data is missing");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });

            await api.addDeliveryPartner(data);
            toast.success("Rider Registered Successfully");
            navigate('/admin/delivery/partners');
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/delivery/partners')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 hover:border-blue-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('add_partner.title')}</h1>
                        <p className="text-slate-500 text-[11px] font-medium leading-tight uppercase tracking-widest opacity-60 mt-1">{t('add_partner.subtitle')}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Photo & Primary Info */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                                <User size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 inline-block uppercase tracking-tight">Personal & Login Sync</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center bg-slate-50/30 p-8 rounded-3xl border border-slate-100">
                            <div className="md:col-span-4 flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <div className="w-36 h-36 rounded-3xl bg-white border-2 border-slate-100 border-dashed flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 ring-4 ring-slate-50 shadow-inner">
                                        {previewImage ? (
                                            <img src={previewImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-300">
                                                <Camera size={40} strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold mt-2 uppercase">No Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg border-2 border-white pointer-events-none group-hover:scale-110 transition-transform">
                                        <Camera size={16} />
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('add_partner.profile_photo')}</span>
                                    <p className="text-[9px] text-slate-400 font-medium italic opacity-70 leading-relaxed px-4">{t('add_partner.profile_photo_help')}</p>
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('add_partner.full_name')} <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder={t('add_partner.full_name_placeholder')}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('add_partner.mobile')} <span className="text-rose-500">*</span></label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                maxLength={10}
                                                placeholder={t('add_partner.mobile_placeholder')}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('add_partner.email')}</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder={t('add_partner.email_placeholder')}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Right Side: Vehicle & Duty Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 sticky top-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shadow-sm">
                                <Truck size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-500 inline-block uppercase tracking-tight">{t('add_partner.logistics_profile')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('add_partner.vehicle_type')} <span className="text-rose-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Bike', 'EV', 'Cycle', 'Other'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({...formData, vehicleType: type})}
                                            className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                                formData.vehicleType === type 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100' 
                                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('add_partner.license_plate')}</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                    <input
                                        type="text"
                                        name="vehicleNumber"
                                        value={formData.vehicleNumber}
                                        onChange={handleChange}
                                        maxLength={10}
                                        placeholder={t('add_partner.license_plate_placeholder')}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-50">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                {loading ? 'Registering...' : t('add_partner.create_btn')}
                            </button>
                            <button 
                                type="button"
                                onClick={() => navigate('/admin/delivery/partners')} 
                                className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                Discard Registration
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                        <Info className="text-indigo-500 mt-0.5" size={16} />
                        <div>
                            <p className="text-[11px] font-black text-indigo-900 border-b border-indigo-100 pb-1 mb-1 uppercase tracking-tighter">Security Note</p>
                            <p className="text-[10px] text-indigo-700 font-medium leading-normal italic">Post registration, the rider must verify their device to start receiving assignments.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddDeliveryPartner;
