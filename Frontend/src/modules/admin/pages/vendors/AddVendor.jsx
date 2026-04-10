import React, { useEffect, useState } from 'react';
import { Save, X, Upload, Store, User, Mail, Phone, MapPin, Shield, CheckCircle2, ChevronLeft, ArrowLeft, Info, Camera, Loader2, Trash2 } from 'lucide-react';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

            await createVendor(adminUser.token, data);
            toast.success('Vendor added successfully');
            navigate('/admin/vendors');
        } catch (error) {
            toast.error(error.message || 'Failed to add vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/vendors')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border-none bg-transparent">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Add New Vendor</h1>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Register a new store partner</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/admin/vendors')}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 md:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 border-none"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8 mt-2">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Store size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">Store Details</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Basic Information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    placeholder="Enter store name"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Owner Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        name="ownerName"
                                        placeholder="Enter owner name"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">Address Details</h3>
                            </div>
                            <GoogleMapsInput 
                                onLocationSelect={handleLocationSelect} 
                                placeholder="Search location to autofill..."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Street" 
                                    value={formData.address.street} 
                                    onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                />
                                <input 
                                    type="text" 
                                    placeholder="City" 
                                    value={formData.address.city} 
                                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 lg:mt-2">
                    {/* Logo Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                                <Camera size={16} />
                            </div>
                            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none">Store Logo</h3>
                        </div>
                        
                        <div className="relative group aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-300 hover:bg-white transition-all duration-300">
                            {logoPreview ? (
                                <div className="relative w-full h-full">
                                    <img src={logoPreview} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); }} className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-50 transition-all border-none"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-blue-400 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                        <Store size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload Logo</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer px-0 py-0" onChange={handleLogoChange} accept="image/*" title="" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-4">Max size: 2MB</p>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-6">Status</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600">Pending Approval</span>
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                                <Info className="text-blue-500 mt-0.5 shrink-0" size={16} />
                                <p className="text-[10px] text-blue-700 font-bold leading-normal italic">New vendors start as pending before verification.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVendor;
