import React, { useState, useEffect } from 'react';
import { IndianRupee, Info, Plus, CreditCard, Receipt, Loader, Settings2, ShieldCheck, Zap, Globe, FileCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as settingApi from '../../api/settingApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';

import { pageInfoData } from '../../../../common/data/pageInfoData';

const BillingSettings = () => {
    const { t } = useTranslation('admin_settings');
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
        immediateDeliveryEnabled: true,
        immediateDeliveryFee: 0,
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
            // toast.error('Failed to load billing configuration.');
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
        if (settings.immediateDeliveryFee < 0) {
            toast.error('Immediate delivery surcharge must be a non-negative number.');
            return;
        }
        if (settings.baseDeliveryFee < 0) {
            toast.error('Base delivery fee must be a non-negative number.');
            return;
        }
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Settings2 size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">Global Configurations</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                         <h1 className="text-2xl font-bold text-slate-800 mb-0">{t('billing.title')}</h1>
                         <PageInfoTooltip info={pageInfoData.billingSettings} />
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{t('billing.subtitle')}</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all transform active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10'}`}
                >
                    {isSaving ? (
                        <>
                            <Loader className="animate-spin" size={16} />
                            <span>{t('billing.syncing')}</span>
                        </>
                    ) : (
                        <>
                            <FileCheck size={16} />
                            <span>{t('billing.save_config')}</span>
                        </>
                    )}
                </button>
            </div>

            <div className="w-full space-y-6">
                {/* Tax Information Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-4 md:px-7 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">{t('billing.tax_info')}</h3>
                                <p className="text-sm text-slate-500 mt-1">{t('billing.legal_compliance')}</p>
                            </div>
                        </div>
                        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-lg">{t('billing.compliance')}</span>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">
                                    <ShieldCheck size={14} />
                                    {t('billing.org_tin')}
                                </label>
                                <input
                                    type="text"
                                    name="organizationTIN"
                                    placeholder="Enter GSTIN Number"
                                    value={settings.organizationTIN}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">
                                    <Globe size={14} />
                                    {t('billing.tax_id')}
                                </label>
                                <div className="relative">
                                    <select
                                        name="taxIdType"
                                        value={settings.taxIdType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="GST (India)">GST (India)</option>
                                        <option value="VAT (UK/EU)">VAT (UK/EU)</option>
                                        <option value="Sales Tax (US)">Sales Tax (US)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-slate-100">
                            <div className="group">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">
                                    <Info size={14} />
                                    {t('billing.default_tax')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="defaultTaxRate"
                                        value={settings.defaultTaxRate}
                                        onChange={handleInputChange}
                                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    />
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                </div>
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">
                                    <Settings2 size={14} />
                                    {t('billing.tax_calc_logic')}
                                </label>
                                <div className="relative">
                                    <select
                                        name="taxCalculation"
                                        value={settings.taxCalculation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="Inclusive">Inclusive (Included in Product Price)</option>
                                        <option value="Exclusive">Exclusive (Added at Checkout)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Q-Commerce Fees Section */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">{t('billing.q_commerce')}</h3>
                        </div>
                        <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-lg">{t('billing.logic')}</span>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">{t('billing.base_delivery')} (₹)</label>
                                <div className="relative">
                                    <input type="number" name="baseDeliveryFee" value={settings.baseDeliveryFee} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all" />
                                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">{t('billing.free_threshold')} (₹)</label>
                                <div className="relative">
                                    <input type="number" name="freeDeliveryThreshold" value={settings.freeDeliveryThreshold} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2 bg-emerald-50/30 border border-emerald-200 rounded-xl text-sm font-normal text-emerald-800 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                                    <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-medium text-rose-500 mb-1.5 ml-1">{t('billing.surge')}</label>
                                <div className="relative">
                                    <input type="number" step="0.1" name="surgeMultiplier" value={settings.surgeMultiplier} onChange={handleInputChange} className="w-full pl-4 pr-10 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-sm font-normal text-rose-800 focus:bg-white focus:border-rose-500 outline-none transition-all" />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-rose-500">x</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">{t('billing.handling')} (₹)</label>
                                <div className="relative">
                                    <input type="number" name="handlingFee" value={settings.handlingFee} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all" />
                                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-blue-600 mb-1.5 ml-1">{t('billing.max_radius')}</label>
                                <div className="relative">
                                    <input type="number" name="maxDeliveryRadius" value={settings.maxDeliveryRadius} onChange={handleInputChange} className="w-full pr-12 pl-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-lg font-bold text-blue-700 focus:bg-white  focus:border-blue-500 outline-none transition-all shadow-inner" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-400">KM</span>
                                </div>
                            </div>
                        </div>

                        {/* Express / Immediate Delivery Section */}
                        <div className="pt-6 border-t border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Zap size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800">{t('billing.immediate_delivery_title')}</h4>
                                        <p className="text-xs text-slate-500">{t('billing.enable_immediate_desc')}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="immediateDeliveryEnabled"
                                        checked={settings.immediateDeliveryEnabled !== false}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">{t('billing.immediate_delivery_fee')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            name="immediateDeliveryFee"
                                            value={settings.immediateDeliveryFee ?? 0}
                                            onChange={handleInputChange}
                                            disabled={settings.immediateDeliveryEnabled === false}
                                            className={`w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all ${settings.immediateDeliveryEnabled === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 ml-1">{t('billing.immediate_delivery_desc')}</p>
                                </div>

                                {/* Live Option A Rule Preview Card */}
                                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl p-4 border border-blue-100 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                                        <Info size={14} className="text-blue-600" />
                                        <span>{t('billing.rule_preview_title')}</span>
                                    </div>
                                    <div className="text-xs text-slate-600 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Standard Scheduled Delivery:</span>
                                            <span className="font-semibold text-slate-800">₹{settings.baseDeliveryFee || 0} <span className="text-[10px] text-slate-400 font-normal">(₹0 if order ≥ ₹{settings.freeDeliveryThreshold || 0})</span></span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Express Immediate Delivery:</span>
                                            <span className="font-semibold text-blue-700">₹{settings.baseDeliveryFee || 0} + ₹{settings.immediateDeliveryFee || 0} = ₹{(Number(settings.baseDeliveryFee) || 0) + (Number(settings.immediateDeliveryFee) || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Express above Free Threshold:</span>
                                            <span className="font-semibold text-emerald-700">₹0 + ₹{settings.immediateDeliveryFee || 0} = ₹{settings.immediateDeliveryFee || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-blue-100">
                                            <span>POS & Store Pickup Orders:</span>
                                            <span className="font-medium text-slate-600">₹0 Delivery Fee</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 group mt-6">
                            <label className="block text-sm font-semibold text-blue-700 mb-4 text-center">{t('billing.engine_logic')}</label>
                            <div className="flex items-center justify-center">
                                <div className="w-32 relative">
                                    <input
                                        type="number"
                                        name="platformCommissionRate"
                                        value={settings.platformCommissionRate}
                                        onChange={handleInputChange}
                                        className="w-full text-center pr-8 pl-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-xl font-bold text-blue-600 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-400"
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 right-4 text-lg font-bold text-blue-300">%</div>
                                </div>
                            </div>
                            <p className="text-center text-sm text-slate-500 mt-3">{t('billing.applied_order_val')}</p>
                        </div>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="flex flex-col items-center justify-center pt-2 pb-10 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`group relative overflow-hidden px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all transform active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isSaving ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    <span>{t('billing.syncing')}</span>
                                </>
                            ) : (
                                <>
                                    <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                                    <span>{t('billing.save_deploy')}</span>
                                </>
                            )}
                        </span>
                    </button>
                    <p className="text-sm text-slate-500">{t('billing.immediate_deploy')}</p>
                </div>


            </div>
        </div>
    );
};

export default BillingSettings;
