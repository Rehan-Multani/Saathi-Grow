import React, { useState } from 'react';
import { Save, Globe, Settings, Smartphone, Mail, Settings2, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as settingApi from '../../api/settingApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AppSettings = () => {
    const { t } = useTranslation('admin_settings');
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        supportEmail: '',
        supportPhone: '',
        offerStripText: '',
        isOfferStripEnabled: false
    });

    useEffect(() => {
        if (token) {
            fetchSettings();
        }
    }, [token]);

    const fetchSettings = async () => {
        try {
            const data = await settingApi.getAdminSettings(token);
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await settingApi.updateAdminSettings(token, settings);
            setSettings(updated);
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Settings2 size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">{t('app_settings.title')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800">{t('app_settings.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.appSettings} />
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{t('app_settings.subtitle')}</p>
                </div>
                <button

                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all transform active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                >
                    <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
                    <span>{isSaving ? t('common.saving') : t('app_settings.save_all')}</span>
                </button>
            </div>

            <div className="space-y-6">
                {/* General Identity */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                <Globe size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">{t('app_settings.general')}</h3>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('app_settings.name')}</label>
                                <input
                                    type="text"
                                    defaultValue="Saathigro"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('app_settings.slogan')}</label>
                                <input
                                    type="text"
                                    defaultValue="Organic Excellence at Your Doorstep"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('app_settings.support_email')}</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="supportEmail"
                                        value={settings.supportEmail || ''}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('app_settings.contact')}</label>
                                <div className="relative">
                                    <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        name="supportPhone"
                                        value={settings.supportPhone || ''}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors mt-6">
                            <label className="text-xs font-medium ml-1">{t('app_settings.address')}</label>
                            <textarea
                                rows={2}
                                defaultValue="123 Agro Plaza, Fresh Valley, MP 452001"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all resize-y"
                            />

                        </div>
                    </div>
                </div>

                {/* System Configuration */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-white px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shadow-inner">
                                <Settings size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">{t('app_settings.system')}</h3>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('app_settings.currency')}</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('app_settings.timezone')}</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">

                                    <option>(GMT+05:30) Mumbai, Kolkata, New Delhi</option>
                                    <option>(GMT-05:00) Eastern Time</option>
                                    <option>(GMT+00:00) UTC</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="text-base font-semibold text-slate-700 mb-4 ml-1">{t('app_settings.maintenance')}</h4>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transition-transform duration-200 ease-in-out" style={{ top: '2px', left: '2px' }} />
                                        <label className="toggle-label block overflow-hidden h-7 rounded-full bg-slate-300 cursor-pointer"></label>
                                    </div>
                                    <span className="text-sm text-slate-700">{t('app_settings.maintenance_desc')}</span>
                                </div>

                            </div>
                        </div>
                        
                        {/* Offer Strip Settings */}
                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="text-base font-semibold text-slate-700 mb-4 ml-1">Top Offer Strip (Header)</h4>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">Enable Static Offer Strip</span>
                                        <span className="text-[11px] text-slate-500">If enabled, this text will replace the scrolling "Banner Deals" at the top of the app.</span>
                                    </div>
                                    <div className="relative inline-block w-12 align-middle select-none">
                                        <input 
                                            type="checkbox" 
                                            name="isOfferStripEnabled"
                                            checked={settings.isOfferStripEnabled}
                                            onChange={handleInputChange}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transition-transform duration-200 ease-in-out" style={{ top: '2px', left: '2px' }} 
                                        />
                                        <label className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer transition-colors ${settings.isOfferStripEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}></label>
                                    </div>
                                </div>
                                <div className={`transition-opacity duration-300 ${!settings.isOfferStripEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <label className="text-xs font-medium ml-1 text-slate-500 mb-1.5 block">Offer Strip Custom Text</label>
                                    <input
                                        type="text"
                                        name="offerStripText"
                                        value={settings.offerStripText || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Free Delivery on all orders above ₹500!"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppSettings;
