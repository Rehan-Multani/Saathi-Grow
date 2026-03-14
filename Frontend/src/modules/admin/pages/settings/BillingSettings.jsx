import React, { useState, useEffect } from 'react';
import { IndianRupee, Info, Plus, CreditCard, Receipt, Loader, Settings2, ShieldCheck, Zap, Globe, FileCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as settingApi from '../../api/settingApi';
import { toast } from 'react-toastify';

const BillingSettings = () => {
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // UI State for Settings mapping directly to GlobalSettings schema
    const [settings, setSettings] = useState({
        organizationTIN: '',
        taxIdType: 'GST (India)',
        defaultTaxRate: 18,
        taxCalculation: 'Exclusive',
        baseDeliveryFee: 25,
        freeDeliveryThreshold: 500,
        handlingFee: 5,
        surgeMultiplier: 1.0,
        platformCommissionRate: 12,
        maxDeliveryRadius: 20,
        platformWalletBalance: 0,
        autoInvoicingEnabled: true,
        supportPhone: '',
        whatsappNumber: '',
        supportEmail: ''
    });

    useEffect(() => {
        if (token) fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        try {
            const data = await settingApi.getAdminSettings(token);
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            toast.error('Failed to load billing configuration.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await settingApi.updateAdminSettings(token, settings);
            setSettings(updated);
            toast.success('Billing & Platform taxes updated successfully!');
        } catch (error) {
            toast.error('Failed to update configurations.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-40 space-y-4">
                <Loader className="animate-spin text-blue-600" size={40} />
                <p className="text-gray-400 font-medium text-sm animate-pulse">Initializing Billing Engine...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fafb] p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Settings2 size={12} />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Global Configurations</span>
                    </div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Tax & Billing Settings</h1>
                    <p className="text-gray-500 text-[11px] mt-0.5 font-medium italic opacity-80">Configure taxes, delivery, and commissions.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-black text-white transition-all transform active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1a56db] hover:bg-blue-700 shadow-md shadow-blue-500/10'}`}
                >
                    {isSaving ? (
                        <>
                            <Loader className="animate-spin" size={12} />
                            <span>Syncing...</span>
                        </>
                    ) : (
                        <>
                            <FileCheck size={14} strokeWidth={3} />
                            <span>Save Config</span>
                        </>
                    )}
                </button>
            </div>

            <div className="w-full space-y-6">
                {/* Tax Information Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-4 md:px-7 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                <Receipt size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900 tracking-tight leading-none">Tax Information</h3>
                                <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">Legal Compliance & Models</p>
                            </div>
                        </div>
                        <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">Compliance</span>
                    </div>

                    <div className="p-4 md:p-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="group">
                                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5 transition-colors group-focus-within:text-blue-600">
                                    <ShieldCheck size={10} />
                                    Organization TIN/GSTIN
                                </label>
                                <input
                                    type="text"
                                    name="organizationTIN"
                                    placeholder="Enter GSTIN Number"
                                    value={settings.organizationTIN}
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5 transition-colors group-focus-within:text-blue-600">
                                    <Globe size={10} />
                                    Tax ID Type
                                </label>
                                <div className="relative">
                                    <select
                                        name="taxIdType"
                                        value={settings.taxIdType}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 appearance-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="GST (India)">GST (India)</option>
                                        <option value="VAT (UK/EU)">VAT (UK/EU)</option>
                                        <option value="Sales Tax (US)">Sales Tax (US)</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <Plus size={14} className="rotate-45" />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5 transition-colors group-focus-within:text-blue-600">
                                    <Info size={10} />
                                    Default Tax Rate (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="defaultTaxRate"
                                        value={settings.defaultTaxRate}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
                                </div>
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5 transition-colors group-focus-within:text-blue-600">
                                    <Settings2 size={10} />
                                    Tax Calculation Logic
                                </label>
                                <div className="relative">
                                    <select
                                        name="taxCalculation"
                                        value={settings.taxCalculation}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2 bg-blue-50/30 border border-blue-100 rounded-lg text-xs font-bold text-blue-700 appearance-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="Exclusive">Exclusive (Add to price)</option>
                                        <option value="Inclusive">Inclusive (Included in price)</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                                        <Plus size={14} className="rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Q-Commerce Fees Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-4 md:px-7 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                                <Zap size={16} />
                            </div>
                            <h3 className="text-base font-black text-gray-900 tracking-tight">Q-Commerce Fulfillment Fees</h3>
                        </div>
                        <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">Logic</span>
                    </div>

                    <div className="p-4 md:p-7 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="group">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Base Delivery (₹)</label>
                                <div className="relative">
                                    <input type="number" name="baseDeliveryFee" value={settings.baseDeliveryFee} onChange={handleInputChange} className="w-full pl-8 pr-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all" />
                                    <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Free Threshold (₹)</label>
                                <div className="relative">
                                    <input type="number" name="freeDeliveryThreshold" value={settings.freeDeliveryThreshold} onChange={handleInputChange} className="w-full pl-8 pr-3.5 py-2 bg-emerald-50/30 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all" />
                                    <Plus size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5 text-rose-500">Surge Multiplier</label>
                                <div className="relative">
                                    <input type="number" step="0.1" name="surgeMultiplier" value={settings.surgeMultiplier} onChange={handleInputChange} className="w-full pl-3.5 pr-10 py-2 bg-rose-50/30 border border-rose-100 rounded-lg text-xs font-bold text-rose-700 focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all" />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-rose-400 uppercase tracking-tighter">Mult</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-gray-100">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Handling Fee (₹)</label>
                                <div className="relative">
                                    <input type="number" name="handlingFee" value={settings.handlingFee} onChange={handleInputChange} className="w-full pl-8 pr-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all" />
                                    <CreditCard size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1.5 ml-0.5">Max Radius (KM)</label>
                                <div className="relative">
                                    <input type="number" name="maxDeliveryRadius" value={settings.maxDeliveryRadius} onChange={handleInputChange} className="w-full pr-10 pl-3.5 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-[14px] font-black text-blue-800 focus:bg-white focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all shadow-inner" />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-400">KM</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/30 rounded-xl p-4 md:p-5 border border-gray-100 group">
                            <label className="block text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-3 text-center">Engine Logic: Commission Rate (%)</label>
                            <div className="flex items-center justify-center">
                                <div className="w-32 relative">
                                    <input
                                        type="number"
                                        name="platformCommissionRate"
                                        value={settings.platformCommissionRate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-lg font-black text-blue-900 text-center focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 right-4 text-sm font-black text-blue-200">%</div>
                                </div>
                            </div>
                            <p className="text-center text-[8px] text-gray-300 font-bold uppercase tracking-widest mt-3 italic">Applied to order value before taxes.</p>
                        </div>
                    </div>
                </div>


                {/* Submit Section */}
                <div className="flex flex-col items-center justify-center pt-2 pb-10 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`group relative overflow-hidden px-8 py-2.5 rounded-xl text-[12px] font-black text-white transition-all transform active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1a56db] hover:bg-blue-700 shadow-lg shadow-blue-500/10'}`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isSaving ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <Globe size={16} className="group-hover:rotate-12 transition-transform" />
                                    <span>Save & Deploy Configurations</span>
                                </>
                            )}
                        </span>
                    </button>
                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-tighter">Immediate deployment across the entire product ecosystem.</p>
                </div>
            </div>
        </div>
    );
};

export default BillingSettings;
