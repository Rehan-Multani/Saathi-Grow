import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, ArrowLeft, Upload, Store, Mail, Phone, MapPin, Shield, CheckCircle2, Hash, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import Swal from 'sweetalert2';

const AddBranch = () => {
    const { t } = useTranslation('admin_locations');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
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
        isActive: true
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `.pac-container { z-index: 10000 !important; border-radius: 1rem; border: none; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); padding: 8px; font-family: inherit; }`;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;

        // Strict 10-digit numeric validation for phone
        if (name === 'phone') {
            val = value.replace(/\D/g, '').slice(0, 10);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: val }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleLocationSelect = (locData) => {
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

            await createBranch(adminUser.token, data);
            Swal.fire({
                title: t('messages.create_success'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/admin/locations/branches');
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.create_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/locations/branches')}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4 group font-semibold"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-wider">{t('form.discard')}</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Store size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('form.add_title')}</h1>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">{t('subtitle')}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Form */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('form.basic_info')}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.branch_name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Main City Branch"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.branch_code')}</label>
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="HUB-001"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 uppercase"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.phone')}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        maxLength={10}
                                        placeholder="Phone Number (10 digits)"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="branch@example.com"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('form.address_info')}</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.location_search')}</label>
                                    <GoogleMapsInput
                                        onLocationSelect={handleLocationSelect}
                                        placeholder="Search address..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-4 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.address')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.city')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.state')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.zip')}</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({...formData, address: {...formData.address, zipCode: e.target.value.replace(/\D/g, '')}})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.branding')}</label>
                            <div className="relative group aspect-square">
                                <div className="w-full h-full rounded-2xl bg-slate-50 border-2 border-slate-200 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-white shadow-inner">
                                    {logoPreview ? (
                                        <img src={logoPreview} className="w-full h-full object-contain p-4" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300 gap-2 text-center">
                                            <ImageIcon size={40} />
                                            <span className="text-[10px] font-bold uppercase">{t('form.upload_text')}</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                                {logoPreview && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-lg shadow-lg"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isActive ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-tight">{t('form.operational_status')}</div>
                                    <p className="text-[9px] text-slate-400 font-medium">{t('form.status_description')}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase shadow-xl transition-all active:scale-95 ${loading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {t('form.submit_add')}
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                        <Info className="text-blue-500 mt-1 shrink-0" size={16} />
                        <p className="text-[10px] text-blue-700 font-medium leading-normal">
                            Note: All branch codes must be unique system-wide to ensure proper data tracking.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddBranch;
