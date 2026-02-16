import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, CheckCircle, MapPin, Mail, Lock, Phone, User } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';

const VendorRegister = () => {
    const navigate = useNavigate();
    const { register, loading } = useVendor();

    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        storeName: '',
        address: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            navigate('/vendor/login');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0 hidden md:block">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574"
                    alt="Groceries"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 w-full md:max-w-2xl bg-white md:rounded-2xl md:shadow-2xl md:border md:border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Register Your Store</h1>
                        <p className="text-gray-500 text-sm mt-1">Join SaathiGro and start selling online.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Owner Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="ownerName" required onChange={handleChange} value={formData.ownerName} type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="Rahul Kumar" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="email" required onChange={handleChange} value={formData.email} type="email" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="rahul@example.com" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="phone" required onChange={handleChange} value={formData.phone} type="tel" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="password" required onChange={handleChange} value={formData.password} type="password" minLength={6} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 ml-1">Store Name</label>
                            <div className="relative">
                                <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="storeName" required onChange={handleChange} value={formData.storeName} type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="Fresh Mart Details" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 ml-1">Store Address</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="address" required onChange={handleChange} value={formData.address} type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="Enter full business address" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 ml-1">Description (Optional)</label>
                            <textarea name="description" onChange={handleChange} value={formData.description} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium resize-none" placeholder="Tell us about your store..." />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#0a6b19] active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Register Store <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t pt-6">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account? <br />
                            <button onClick={() => navigate('/vendor/login')} className="text-[#0c831f] font-bold hover:underline mt-1">Login to your dashboard</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorRegister;
