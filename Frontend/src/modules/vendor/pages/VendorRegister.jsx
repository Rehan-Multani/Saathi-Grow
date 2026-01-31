import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Upload, MapPin } from 'lucide-react';

const VendorRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Documents, 3: Bank Details

    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Background Image - Visible mainly on desktop */}
            <div className="absolute inset-0 z-0 hidden md:block">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3"
                    alt="Groceries"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Content Container - Full screen on mobile */}
            <div className="relative z-10 w-full md:max-w-xl bg-white md:rounded-2xl md:shadow-2xl md:border md:border-white/10 overflow-hidden min-h-screen md:min-h-0 flex flex-col">
                <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Register Your Store</h1>
                        <p className="text-gray-500 text-sm mt-1">Join SaathiGro and start selling online.</p>

                        {/* Progress Steps */}
                        <div className="flex justify-center mt-6 gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${i <= step ? 'bg-[#0c831f]' : 'bg-gray-100'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Owner Name</label>
                                    <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="Rahul Kumar" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Mobile Number</label>
                                    <input type="tel" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="+91 98765 43210" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Store Name</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="Fresh Mart Details" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Store Category</label>
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium">
                                    <option>Grocery & Staples</option>
                                    <option>Fruits & Vegetables</option>
                                    <option>Dairy Products</option>
                                    <option>Bakery</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 ml-1">Store Address</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium" placeholder="Find on map" />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3 mt-4 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#0a6b19] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Placeholder for Steps 2 & 3 */}
                    {step > 1 && (
                        <div className="text-center py-12 animate-in slide-in-from-right duration-300">
                            <p className="text-gray-500 mb-4">Document Upload Step (Mock)</p>
                            <button
                                onClick={() => navigate('/vendor/dashboard')}
                                className="w-full py-3 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#0a6b19] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Complete Registration <CheckCircle size={18} />
                            </button>
                            <button onClick={() => setStep(1)} className="text-gray-500 text-sm font-medium mt-4 hover:underline">Back to basic info</button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account? <br />
                            <button onClick={() => navigate('/vendor/login')} className="text-[#0c831f] font-bold hover:underline mt-1">Login Here</button>
                        </p>
                    </div>
                </div>

                {/* Visual Bottom Bar (Desktop only) */}
                <div className="hidden md:block h-1.5 bg-gradient-to-r from-[#0c831f] via-[#f7cb15] to-[#0c831f]"></div>
            </div>
        </div>
    );
};

export default VendorRegister;
