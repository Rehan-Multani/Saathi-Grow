import React, { useState, useEffect } from 'react';
import { IndianRupee, Info, Plus, CreditCard, Receipt, Loader } from 'lucide-react';
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
        autoInvoicingEnabled: true
    });

    useEffect(() => {
        if (token) fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        try {
            const data = await settingApi.getAdminSettings(token);
            setSettings(data);
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
            <div className="flex justify-center items-center py-20">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }
    return (
        <div className="p-2 sm:p-4 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tax & Billing Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (Tax Info & Payment Methods) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tax Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-6">Tax Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Organization TIN/GSTIN</label>
                                <input
                                    type="text"
                                    name="organizationTIN"
                                    value={settings.organizationTIN}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Tax ID Type</label>
                                <select
                                    name="taxIdType"
                                    value={settings.taxIdType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="GST (India)">GST (India)</option>
                                    <option value="VAT (UK/EU)">VAT (UK/EU)</option>
                                    <option value="Sales Tax (US)">Sales Tax (US)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Default Tax Rate (%)</label>
                                <input
                                    type="number"
                                    name="defaultTaxRate"
                                    value={settings.defaultTaxRate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Tax Calculation Logic</label>
                                <select
                                    name="taxCalculation"
                                    value={settings.taxCalculation}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-blue-200 text-sm text-gray-800 rounded-lg outline-none transition-all bg-white ring-[3px] ring-blue-50"
                                >
                                    <option value="Exclusive">Exclusive</option>
                                    <option value="Inclusive">Inclusive</option>
                                </select>
                            </div>
                        </div>

                        {/* Q-Commerce Fees Segment */}
                        <div className="border-t border-gray-100 pt-5 mt-2 mb-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Q-Commerce Fulfillment Fees</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Base Delivery Fee (₹)</label>
                                    <input type="number" name="baseDeliveryFee" value={settings.baseDeliveryFee} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Free Delivery Above (₹)</label>
                                    <input type="number" name="freeDeliveryThreshold" value={settings.freeDeliveryThreshold} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Dynamic Surge Multiplier</label>
                                    <input type="number" step="0.1" name="surgeMultiplier" value={settings.surgeMultiplier} onChange={handleInputChange} className="w-full px-3 py-2 border border-rose-200 bg-rose-50 text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-medium" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Handling Fee (₹)</label>
                                    <input type="number" name="handlingFee" value={settings.handlingFee} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-600 mb-2">Maximum Delivery Radius (KM)</label>
                                    <input type="number" name="maxDeliveryRadius" value={settings.maxDeliveryRadius} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-200 bg-blue-50 text-sm text-gray-800 rounded-lg outline-none font-bold" />
                                </div>
                            </div>
                            <div className="mt-6 md:w-1/2">
                                <label className="block text-xs font-bold text-blue-600 mb-2">Platform Engine Commission (%)</label>
                                <input type="number" name="platformCommissionRate" value={settings.platformCommissionRate} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-200 bg-blue-50 text-sm text-gray-800 rounded-lg outline-none font-bold" />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-5 py-2.5 rounded-md text-[13px] font-bold text-white transition-all ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1a56db] hover:bg-blue-700 shadow-md shadow-blue-500/20'}`}
                        >
                            {isSaving ? 'Synchronizing Engine...' : 'Save Unified Configurations'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSettings;
