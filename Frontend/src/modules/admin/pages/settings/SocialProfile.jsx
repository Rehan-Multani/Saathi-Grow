import React, { useState, useEffect } from 'react';
import { Save, Facebook, Twitter, Instagram, Linkedin, Globe, MessageCircle, Mail, Phone, Loader2, Settings2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as settingApi from '../../api/settingApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const SocialProfile = () => {
    const { t } = useTranslation('admin_settings');
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        whatsappNumber: '',
        officialWebsite: '',
        supportPhone: '',
        supportEmail: ''
    });

    useEffect(() => {
        if (token) fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        try {
            const data = await settingApi.getAdminSettings(token);
            setSettings({
                facebookUrl: data.facebookUrl || '',
                instagramUrl: data.instagramUrl || '',
                twitterUrl: data.twitterUrl || '',
                linkedinUrl: data.linkedinUrl || '',
                whatsappNumber: data.whatsappNumber || '',
                officialWebsite: data.officialWebsite || '',
                supportPhone: data.supportPhone || '',
                supportEmail: data.supportEmail || ''
            });
        } catch (error) {
            toast.error('Failed to load social profiles.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await settingApi.updateAdminSettings(token, settings);
            toast.success('Social profiles and contact information updated!');
        } catch (error) {
            toast.error('Failed to update settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-40 space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-medium text-sm animate-pulse">Loading...</p>
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
                        <span className="text-sm font-semibold text-blue-600">Platform Settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800">{t('social_profile.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.socialProfile} />
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{t('social_profile.subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all transform active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                >

                    <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
                    <span>{isSaving ? t('common.saving') : t('common.save')}</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Social Links */}
                <div className="w-full lg:w-3/5">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="bg-gradient-to-r from-blue-50 to-white px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800">{t('social_profile.social')}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{t('social_profile.social_sub')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 flex-grow">
                            <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.facebook')}</label>
                                <div className="relative">

                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-blue-600">
                                        <Facebook size={14} />
                                    </div>
                                    <input
                                        type="url"
                                        name="facebookUrl"
                                        value={settings.facebookUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://facebook.com/yourstore"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-rose-500 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.instagram')}</label>
                                <div className="relative">

                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded bg-rose-50 text-rose-500">
                                        <Instagram size={14} />
                                    </div>
                                    <input
                                        type="url"
                                        name="instagramUrl"
                                        value={settings.instagramUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://instagram.com/yourstore"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-rose-300 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-slate-800 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.twitter')}</label>
                                <div className="relative">

                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-900">
                                        <Twitter size={14} />
                                    </div>
                                    <input
                                        type="url"
                                        name="twitterUrl"
                                        value={settings.twitterUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://twitter.com/yourstore"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-slate-400 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-sky-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.linkedin')}</label>
                                <div className="relative">

                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded bg-sky-50 text-sky-600">
                                        <Linkedin size={14} />
                                    </div>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={settings.linkedinUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://linkedin.com/company/yourstore"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-sky-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Direct Contact */}
                <div className="w-full lg:w-2/5">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800">{t('social_profile.direct')}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{t('social_profile.direct_sub')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 flex-grow">
                            <div className="space-y-1.5 focus-within:text-emerald-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.whatsapp')}</label>
                                <div className="relative">

                                    <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        name="whatsappNumber"
                                        value={settings.whatsappNumber}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-indigo-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.phone')}</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        name="supportPhone"
                                        value={settings.supportPhone}
                                        onChange={handleInputChange}
                                        placeholder="1800-XXX-XXXX"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-rose-500 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.email')}</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="supportEmail"
                                        value={settings.supportEmail}
                                        onChange={handleInputChange}
                                        placeholder="support@example.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-rose-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-1.5 focus-within:text-slate-600 text-slate-500 transition-colors">
                                <label className="text-xs font-medium ml-1">{t('social_profile.website')}</label>
                                <div className="relative">

                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="url"
                                        name="officialWebsite"
                                        value={settings.officialWebsite}
                                        onChange={handleInputChange}
                                        placeholder="https://www.yourdomain.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-slate-500 outline-none transition-all"
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

export default SocialProfile;
