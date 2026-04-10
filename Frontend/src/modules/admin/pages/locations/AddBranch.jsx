import React, { useState, useEffect } from 'react';
import { Save, X, ArrowLeft, Upload, Store, User, Mail, Phone, MapPin, Shield, CheckCircle2, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AddBranch = () => {
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
        style.innerHTML = `.pac-container { z-index: 10000 !important; border-radius: 1.5rem; border: none; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); padding: 10px; }`;
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
        const val = type === 'checkbox' ? checked : value;
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
        if (!formData.name || !formData.code || !formData.email || !formData.phone || !formData.address.street) {
            return toast.warning('Mandatory network parameters missing');
        }

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
            toast.success('New distribution node established');
            navigate('/admin/locations/branches');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to establish branch node');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Infrastructure Expansion</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Initialize New Branch</h1>
                        <PageInfoTooltip data={pageInfoData.addBranch} />
                    </div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Register a new distribution hub in the global network</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/admin/locations/branches')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X size={16} /> Discard Node
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl ${loading ? 'bg-slate-800 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />} 
                        {loading ? 'Establishiing...' : 'Deploy Hub'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    {/* Primary Branch Data */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-8">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                <Store size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Hub Identification</h3>
                                <p className="text-xs text-slate-400 font-medium">Core branch nomenclature and network coding</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-8 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Hub Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Neo-Logistics Central"
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-inner"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Network Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="BNH001"
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 rounded-2xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-slate-700 outline-none transition-all shadow-inner font-mono"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-6 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Node Liaison Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="hub-ops@distribution.net"
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-inner text-lowercase"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-6 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Emergency Frequency (Phone)</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="10-digit link"
                                        maxLength={10}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-inner"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setFormData({ ...formData, phone: val });
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Intelligence */}
                        <div className="space-y-6 pt-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">Geospatial Coordinates</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Physical deployment locus</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <GoogleMapsInput
                                    onLocationSelect={handleLocationSelect}
                                    placeholder="Synthesize address or drop map pin..."
                                />
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-4 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Street Address</label>
                                        <input
                                            type="text"
                                            placeholder="Physical Sector"
                                            className="w-full bg-white border border-slate-100 focus:border-slate-900 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 outline-none shadow-sm"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value }
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-1 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Settlement (City)</label>
                                        <input
                                            type="text"
                                            placeholder="City"
                                            className="w-full bg-white border border-slate-100 focus:border-slate-900 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 outline-none shadow-sm"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value.replace(/[^a-zA-Z\s]/g, '') }
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-1 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone (State)</label>
                                        <input
                                            type="text"
                                            placeholder="State"
                                            className="w-full bg-white border border-slate-100 focus:border-slate-900 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 outline-none shadow-sm"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value.replace(/[^a-zA-Z\s]/g, '') }
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Postal Hash (ZIP)</label>
                                        <input
                                            type="text"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            className="w-full bg-white border border-slate-100 focus:border-slate-900 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 outline-none shadow-sm"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, zipCode: e.target.value.replace(/\D/g, '') }
                                            })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Visual Branding */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Upload size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Node Branding</h3>
                        </div>

                        <div className="relative group text-center aspect-square flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer overflow-hidden">
                            {logoPreview ? (
                                <div className="relative w-full h-full animate-in zoom-in-95">
                                    <img src={logoPreview} alt="" className="w-full h-full object-contain filter drop-shadow-md" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setLogoFile(null); }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-md mb-4 group-hover:-translate-y-1 transition-transform duration-300">
                                        <Store size={32} className="text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initialize Visual ID</p>
                                    <p className="text-[8px] text-slate-400 mt-1">Aspect Ratio 1:1 Recommended</p>
                                </>
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleLogoChange}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Operational Protocols */}
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-8 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-lg">
                                <Shield className="text-emerald-400" size={20} />
                            </div>
                            <h3 className="text-sm font-black tracking-tight">System Protocol</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Operational State</p>
                                    <p className="text-[9px] text-slate-500 font-medium">Toggle active network visibility</p>
                                </div>
                                <div 
                                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                                    className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${formData.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${formData.isActive ? 'right-1 bg-white shadow-sm' : 'left-1 bg-slate-500'}`} />
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="text-emerald-400" size={16} />
                                </div>
                                <p className="text-[9px] text-emerald-200/60 leading-relaxed">Establishing an active node will allow personnel registration and immediate order processing for the specified geographic locus.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddBranch;
