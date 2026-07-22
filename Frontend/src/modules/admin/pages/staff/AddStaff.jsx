import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Briefcase, Save, ArrowLeft, Shield, Store, CheckCircle2, Loader2, Info, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createStaff } from '../../api/adminApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AddStaff = () => {
    const { t } = useTranslation('admin_staff');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Staff',
        branchId: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        permissions: []
    });

    const [errors, setErrors] = useState({});

    const isBranchManager = adminUser.role === 'Store Manager' || adminUser.role === 'Store Manager';
    const ROLES = isBranchManager ? ['Staff'] : ['Store Manager', 'Staff'];

    const PERMISSIONS_LIST = [
        { id: 'MANAGE_POS_BILLING', label: t('permissions.MANAGE_POS_BILLING', 'POS Billing') },
        { id: 'VIEW_ORDERS', label: t('permissions.VIEW_ORDERS', 'View Orders') },
        { id: 'MANAGE_ORDERS', label: t('permissions.MANAGE_ORDERS', 'Manage Orders') },
        { id: 'MANAGE_REFUNDS_RETURNS', label: t('permissions.MANAGE_REFUNDS_RETURNS', 'Manage Returns') },
        { id: 'MANAGE_PRODUCTS', label: t('permissions.MANAGE_PRODUCTS', 'Manage Products') },
        { id: 'VIEW_CUSTOMERS', label: t('permissions.VIEW_CUSTOMERS', 'Manage Customers') },
        { id: 'MANAGE_INVENTORY', label: t('permissions.MANAGE_INVENTORY', 'Manage Inventory') },
        { id: 'MANAGE_STAFF', label: t('permissions.MANAGE_STAFF', 'Staff Control') },
        { id: 'VIEW_REPORTS', label: t('permissions.VIEW_REPORTS', 'View Reports') }
    ];

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await getBranches(adminUser.token);
                setBranches(data);
                if (isBranchManager && adminUser.branchId) {
                    setFormData(prev => ({ ...prev, branchId: adminUser.branchId }));
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, [adminUser.token, isBranchManager, adminUser.branchId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePermissionChange = (permId) => {
        setFormData(prev => {
            const currentPerms = prev.permissions;
            if (currentPerms.includes(permId)) {
                return { ...prev, permissions: currentPerms.filter(id => id !== permId) };
            } else {
                return { ...prev, permissions: [...currentPerms, permId] };
            }
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) newErrors.email = 'Valid email is required';
        if (!formData.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Valid 10-digit mobile is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.branchId) newErrors.branchId = 'Branch selection is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const staffData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                permissions: formData.permissions,
                branchId: isBranchManager ? adminUser.branchId : (formData.branchId || null)
            };
            await createStaff(adminUser.token, staffData);
            toast.success(t('add.alerts.success'));
            navigate('/admin/staff');
        } catch (error) {
            toast.error(error.message || t('add.alerts.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-6xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('add.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.addStaff} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('add.subtitle')}</p>
                </div>
                <Link
                    to="/admin/staff"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                >
                    <ArrowLeft size={16} /> {t('all.all_staff_btn', { defaultValue: 'Back to Members' })}
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Info */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{t('add.form.info_title', { defaultValue: 'Personal Information' })}</h3>
                                <p className="text-[10px] font-medium text-slate-400">Basic identification details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_name')} (First)</label>
                                <input
                                    type="text"
                                    placeholder="Enter first name"
                                    className={`w-full bg-slate-50/50 border ${errors.firstName ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'} rounded-xl py-2.5 px-4 text-sm font-medium outline-none transition-all`}
                                    value={formData.firstName}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        setFormData(prev => ({ ...prev, firstName: val }));
                                        if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                                    }}
                                />
                                {errors.firstName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.firstName}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_name')} (Last)</label>
                                <input
                                    type="text"
                                    placeholder="Enter last name"
                                    className={`w-full bg-slate-50/50 border ${errors.lastName ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'} rounded-xl py-2.5 px-4 text-sm font-medium outline-none transition-all`}
                                    value={formData.lastName}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        setFormData(prev => ({ ...prev, lastName: val }));
                                        if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                                    }}
                                />
                                {errors.lastName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.lastName}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_email')}</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        className={`w-full bg-slate-50/50 border ${errors.email ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'} rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all text-lowercase`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        name="email"
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_phone')}</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        className={`w-full bg-slate-50/50 border ${errors.phone ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'} rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all`}
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setFormData(prev => ({ ...prev, phone: val }));
                                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                        }}
                                        name="phone"
                                    />
                                </div>
                                {errors.phone && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 pt-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{t('add.form.security_title', { defaultValue: 'Security Credentials' })}</h3>
                                <p className="text-[10px] font-medium text-slate-400">Manage account access</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_password')}</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`w-full bg-slate-50/50 border ${errors.password ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'} rounded-xl py-2.5 pl-4 pr-11 text-sm font-medium outline-none transition-all`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        name="password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password ? <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password}</p> : <p className="text-[9px] text-slate-400 font-medium ml-1">At least 8 characters</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`w-full bg-slate-50/50 border ${errors.confirmPassword ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'} rounded-xl py-2.5 pl-4 pr-11 text-sm font-medium outline-none transition-all`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        name="confirmPassword"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Roles */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                                <Briefcase size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">{t('add.form.access_title', { defaultValue: 'Role & Access' })}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_role')}</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={isBranchManager}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition-all"
                                >
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>{role === 'Store Manager' || role === 'Store Manager' ? 'Store Manager' : role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_branch', { defaultValue: 'Assigned Branch' })}</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <select
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        disabled={isBranchManager}
                                        className={`w-full bg-slate-50 border ${errors.branchId ? 'border-rose-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none cursor-pointer transition-all`}
                                    >
                                        {!isBranchManager && <option value="" disabled>Select Branch</option>}
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.branchId && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.branchId}</p>}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[11px] font-bold text-slate-500">{t('add.form.label_permissions')}</label>
                                <Shield size={14} className="text-blue-500" />
                            </div>
                            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                                {PERMISSIONS_LIST.map(perm => (
                                    <div
                                        key={perm.id}
                                        onClick={() => handlePermissionChange(perm.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${formData.permissions.includes(perm.id) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-200 text-slate-600'}`}
                                    >
                                        <span className={`text-[11px] font-bold transition-colors`}>{perm.label}</span>
                                        <div className={`w-7 h-3.5 rounded-full relative transition-colors ${formData.permissions.includes(perm.id) ? 'bg-white/30' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-300 ${formData.permissions.includes(perm.id) ? 'right-0.5 bg-white' : 'left-0.5 bg-slate-400'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95 shadow-md ${loading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            {loading ? t('add.form.updating_btn') : t('add.form.submit_btn')}
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                        <Info className="text-blue-500 mt-0.5 shrink-0" size={16} />
                        <div>
                            <p className="text-[11px] font-bold text-blue-900 border-b border-blue-100 pb-1 mb-1 uppercase tracking-tight">{t('add.form.info_note_title', { defaultValue: 'System Access' })}</p>
                            <p className="text-[10px] text-blue-700 font-medium leading-normal italic">Team members will only see modules assigned to them. Shared branches will allow collaborative access.</p>
                        </div>
                    </div>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AddStaff;
