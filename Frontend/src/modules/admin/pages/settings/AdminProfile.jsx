import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Mail, Phone, Lock, Camera, Loader2, Settings2, Smartphone } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AdminProfile = () => {
    const { t } = useTranslation('admin_settings');
    const { adminUser, adminUpdateProfile } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        newPassword: '',
        confirmPassword: '',
        settlementPin: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (adminUser) {
            setFormData({
                name: adminUser.name || '',
                email: adminUser.email || '',
                phone: adminUser.phone || '',
                role: adminUser.role || '',
                newPassword: '',
                confirmPassword: ''
            });
            setImagePreview(adminUser.profileImage || null);
        }
    }, [adminUser]);

    const validateForm = () => {
        const newErrors = {};
        
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        if (!nameRegex.test(formData.name)) {
            newErrors.name = 'Please enter a valid name (2-50 characters, letters only)';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please provide a valid email address';
        }

        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit mobile number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Image size should be less than 2MB');
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePersonal = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);

            if (selectedFile) {
                data.append('profileImage', selectedFile);
            }

            await adminUpdateProfile(data);
            toast.success('Profile updated successfully!');
            setSelectedFile(null);
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (formData.newPassword.length < 8) {
            return toast.error('Password must be at least 8 characters');
        }

        setLoading(true);
        try {
            await adminUpdateProfile({ password: formData.newPassword });
            toast.success('Password changed successfully!');
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettlementPin = async (e) => {
        e.preventDefault();
        if (!formData.settlementPin) {
            return toast.error('Please enter a PIN');
        }
        if (!/^\d{4,6}$/.test(formData.settlementPin)) {
            return toast.error('PIN must be 4-6 digits');
        }

        setLoading(true);
        try {
            await adminUpdateProfile({ settlementPin: formData.settlementPin });
            toast.success('Settlement PIN updated successfully!');
            setFormData(prev => ({ ...prev, settlementPin: '' }));
        } catch (error) {
            toast.error(error.message || 'Failed to update PIN');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Settings2 size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">Profile Settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800">{t('admin_profile.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.adminProfile} />
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{t('admin_profile.subtitle')}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden text-center p-8">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-md flex items-center justify-center bg-slate-100 mx-auto group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg shadow-blue-500/20 border-2 border-white transition-all transform active:scale-95"
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">{formData.name || 'Admin User'}</h2>
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg border border-blue-100">
                            {formData.role || 'Super Admin'}
                        </span>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                            <Lock size={18} className="text-slate-500" />
                            <h3 className="text-base font-semibold text-slate-700">{t('admin_profile.security')}</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                    <label className="text-xs font-medium ml-1">{t('admin_profile.new_password')}</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            name="newPassword"

                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Min. 8 chars"
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                    <label className="text-xs font-medium ml-1">{t('admin_profile.confirm_password')}</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"

                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Repeat password"
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.newPassword}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all transform active:scale-95 ${loading || !formData.newPassword ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'}`}
                                >

                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                    <span>{t('admin_profile.update_password')}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Settlement Security Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                            <Smartphone size={18} className="text-slate-500" />
                            <h3 className="text-base font-semibold text-slate-700">Settlement Security</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdateSettlementPin} className="space-y-4">
                                <div className="space-y-1.5 focus-within:text-blue-600 text-slate-500 transition-colors">
                                    <label className="text-xs font-medium ml-1">Cash Collection PIN</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            name="settlementPin"
                                            value={formData.settlementPin}
                                            onChange={handleChange}
                                            placeholder="4-6 Digit PIN"
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                            maxLength={6}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1">This PIN will be required to verify cash collection from riders.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.settlementPin}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all transform active:scale-95 ${loading || !formData.settlementPin ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'}`}
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    <span>Update PIN</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/3">
                    <form onSubmit={handleUpdatePersonal} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="border-b border-slate-100 px-6 md:px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-slate-500" />
                                <h3 className="text-base font-semibold text-slate-700">{t('admin_profile.personal_info')}</h3>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all transform active:scale-95 ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black shadow-lg shadow-black/10'}`}
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span>{t('common.save')}</span>
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8 flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`space-y-1.5 transition-colors ${errors.name ? 'text-red-500' : 'text-slate-500 focus-within:text-blue-600'}`}>
                                    <label className="text-xs font-medium ml-1">{t('admin_profile.full_name')}</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" />

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-normal text-slate-800 focus:bg-white outline-none transition-all ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div className={`space-y-1.5 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-500 focus-within:text-blue-600'}`}>
                                    <label className="text-xs font-medium ml-1">{t('admin_profile.email_address')}</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-normal text-slate-800 focus:bg-white outline-none transition-all ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div className={`space-y-1.5 transition-colors ${errors.phone ? 'text-red-500' : 'text-slate-500 focus-within:text-blue-600'}`}>
                                    <label className="text-xs font-medium ml-1">{t('admin_profile.phone_number')}</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"

                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-normal text-slate-800 focus:bg-white outline-none transition-all ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                                            required
                                        />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>

                                <div className="space-y-1.5 text-slate-500">
                                    <label className="text-xs font-medium ml-1">{t('admin_profile.access_role')}</label>
                                    <input
                                        type="text"
                                        value={formData.role || 'Admin'}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-base font-semibold text-slate-700 mb-4">{t('admin_profile.settings')}</h4>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">

                                    <div className="flex items-center gap-3">
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                            <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-600 transform translate-x-5 transition-transform duration-200 ease-in-out" style={{ top: '2px', left: '2px' }} />
                                            <label className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                                        </div>
                                        <span className="text-sm text-slate-700">{t('admin_profile.email_alerts')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                            <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transition-transform duration-200 ease-in-out" style={{ top: '2px', left: '2px' }} />
                                            <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                                        </div>
                                        <span className="text-sm text-slate-700">{t('admin_profile.sms_alerts')}</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
