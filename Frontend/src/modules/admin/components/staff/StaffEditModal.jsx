import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Briefcase, Store, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const StaffEditModal = ({ show, onHide, staff, onSave }) => {
    const { t } = useTranslation('admin_staff');
    const { adminUser } = useAdminAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        branchId: '',
        isActive: true
    });

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await getBranches(adminUser.token);
                setBranches(data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        if (show) fetchBranches();
    }, [show, adminUser.token]);

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name || '',
                role: staff.role || '',
                email: staff.email || '',
                phone: staff.phone || '',
                branchId: staff.branchId?._id || staff.branchId || '',
                isActive: staff.isActive ?? true
            });
        }
    }, [staff]);

    useEffect(() => {
        if (show) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } finally {
            setLoading(false);
        }
    };

    if (!show || !staff) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 relative border border-slate-100 font-sans">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm transition-colors">
                            <User size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{t('edit.title')}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Modify staff profile</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 shadow-sm">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Basic Info */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_name')}</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t('add.form.placeholder_name')}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_role')}</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={adminUser.role === 'Store Manager'}
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="Staff">Staff Member</option>
                                    <option value="Store Manager">Store Manager</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">Branch</label>
                            <div className="relative group">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                <select
                                    name="branchId"
                                    value={formData.branchId}
                                    onChange={handleChange}
                                    disabled={adminUser.role === 'Store Manager'}
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                                    required
                                >
                                    {branches.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_email')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('add.form.placeholder_email')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium text-lowercase"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add.form.label_phone')}</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder={t('add.form.placeholder_phone')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:border-blue-100 group">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Active Account Status</span>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                            className={`w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner ${formData.isActive ? 'bg-emerald-500 shadow-emerald-600/20' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 ${formData.isActive ? 'right-0.5' : 'left-0.5'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${formData.isActive ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onHide}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {loading ? 'Saving...' : t('edit.submit_btn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffEditModal;
