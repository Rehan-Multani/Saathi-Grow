import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Mail, Save, RefreshCcw, Loader2, Building2, MapPinned } from 'lucide-react';
import { getMyBranch, updateMyBranch } from './api/branchApi';
import Swal from 'sweetalert2';

const BranchProfile = () => {
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });

    const fetchBranch = async () => {
        try {
            setLoading(true);
            const data = await getMyBranch();
            setBranch(data);
            setFormData({
                phone: data.phone || '',
                email: data.email || '',
                address: {
                    street: data.address?.street || '',
                    city: data.address?.city || '',
                    state: data.address?.state || '',
                    zipCode: data.address?.zipCode || ''
                }
            });
            setError('');
        } catch (err) {
            setError('Failed to load branch details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranch();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateMyBranch(formData);
            Swal.fire({
                title: 'Profile Updated',
                text: 'Your branch information has been saved successfully.',
                icon: 'success',
                confirmButtonColor: '#2563eb'
            });
            fetchBranch();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Branch Information</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your store contact information and location address.</p>
                </div>
                <button 
                    onClick={fetchBranch}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                    <RefreshCcw size={14} /> Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <Store size={18} />
                    </div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Branch Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-center p-8">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                            <Building2 size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">{branch?.name}</h2>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                            ID: {branch?.code}
                        </span>
                        
                        <div className="mt-8 pt-8 border-t border-slate-100 text-left space-y-4">
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                                    <p className="text-sm font-bold text-slate-700">{branch?.phone || 'Not Set'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">{branch?.email || 'Not Set'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-8">
                            {/* Contact Fields */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                        <Phone size={14} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base">Contact Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Branch Phone No.</label>
                                        <div className="relative group">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Support Email</label>
                                        <div className="relative group">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="branch@example.com"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Address Fields */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                        <MapPinned size={14} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base">Location Information</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                                        <div className="relative group">
                                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleChange}
                                                placeholder="Street, area, or landmark"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                                            <input
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">State</label>
                                            <input
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleChange}
                                                placeholder="State"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Zip Code</label>
                                            <input
                                                name="address.zipCode"
                                                value={formData.address.zipCode}
                                                onChange={handleChange}
                                                placeholder="Zip Code"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        
                        <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={fetchBranch}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 active:scale-95"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BranchProfile;
