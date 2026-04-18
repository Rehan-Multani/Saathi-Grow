import React, { useState } from 'react';
import { Save, Ticket, Calendar, Percent, IndianRupee, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPromoCode } from '../../api/promoCodeApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const CreatePromoCode = () => {
    const { t } = useTranslation('admin_promocodes');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage',
        discountValue: '0',
        minOrderValue: '0',
        maxDiscountAmount: '0',
        usageLimitTotal: '0',
        usageLimitPerUser: '1',
        validFrom: '',
        validUntil: '',
        status: 'Active',
        isActive: true,
        description: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const generateCode = () => {
        const randomCode = 'SG' + Math.floor(1000 + Math.random() * 9000);
        setFormData({ ...formData, code: randomCode });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!adminUser?.token) return;

        try {
            setLoading(true);

            // Validation
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (new Date(formData.validFrom) < today) {
                toast.error(t('messages.past_date_error'));
                setLoading(false);
                return;
            }

            if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
                toast.error(t('messages.date_error'));
                setLoading(false);
                return;
            }

            const dataToSave = {
                ...formData,
                discountValue: formData.discountType === 'FreeShipping' ? 0 : parseFloat(formData.discountValue || 0),
                minOrderValue: parseFloat(formData.minOrderValue || 0),
                maxDiscountAmount: parseFloat(formData.maxDiscountAmount || 0),
                usageLimitTotal: parseInt(formData.usageLimitTotal || 0),
                usageLimitPerUser: parseInt(formData.usageLimitPerUser || 1),
                isActive: formData.status === 'Active'
            };

            await createPromoCode(adminUser.token, dataToSave);
            toast.success(t('messages.create_success'));
            navigate('/admin/promocodes');
        } catch (error) {
            toast.error(error.message || t('messages.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-4xl mx-auto font-sans text-slate-800">
            {/* Navigation */}
            <div className="mb-8">
                <button onClick={() => navigate('/admin/promocodes')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4 group font-semibold">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-wider">{t('form.back')}</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('form.add_title')}</h1>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">{t('form.breadcrumb')}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Section 1: Promo Details */}
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{t('form.config_section')}</h2>
                        <PageInfoTooltip info={pageInfoData.createPromoCode} />
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.identity_label')}</label>
                                <div className="relative group">
                                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="code"
                                        required
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g. SAVE20"
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 uppercase tracking-wider"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={generateCode}
                                className="h-[42px] px-6 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                            >
                                <Sparkles size={14} className="text-blue-500" />
                                {t('form.generate')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount_type')}</label>
                                <select 
                                    name="discountType" 
                                    value={formData.discountType} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat uppercase font-bold"
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed">Fixed Amount (₹)</option>
                                    <option value="FreeShipping">Free Shipping</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount_value')}</label>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-blue-500 transition-all disabled:bg-slate-50">
                                    {formData.discountType === 'Percentage' ? (
                                        <Percent className="text-slate-300 shrink-0" size={15} />
                                    ) : (
                                        <IndianRupee className="text-slate-300 shrink-0" size={15} />
                                    )}
                                    <input
                                        type="number"
                                        name="discountValue"
                                        required={formData.discountType !== 'FreeShipping'}
                                        disabled={formData.discountType === 'FreeShipping'}
                                        value={formData.discountValue}
                                        onFocus={(e) => { if (formData.discountValue === 0 || formData.discountValue === "0") setFormData(prev => ({ ...prev, discountValue: "" })) }}
                                        onBlur={(e) => { if (formData.discountValue === "" || formData.discountValue === null) setFormData(prev => ({ ...prev, discountValue: "0" })) }}
                                        onChange={handleChange}
                                        className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700 disabled:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.min_order')}</label>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-blue-500 transition-all">
                                    <IndianRupee className="text-slate-300 shrink-0" size={15} />
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        value={formData.minOrderValue}
                                        onChange={handleChange}
                                        className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.max_discount')}</label>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-blue-500 transition-all">
                                    <IndianRupee className="text-slate-300 shrink-0" size={15} />
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        disabled={formData.discountType !== 'Percentage'}
                                        value={formData.maxDiscountAmount}
                                        onChange={handleChange}
                                        className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700 disabled:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Limits & Dates */}
                    <div className="p-6 border-b border-t border-slate-50 bg-slate-50/30 flex items-center justify-between mt-4">
                        <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{t('form.usage_section')} & {t('form.validity_section')}</h2>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.total_limit')}</label>
                            <input
                                type="number"
                                name="usageLimitTotal"
                                value={formData.usageLimitTotal}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.per_user_limit')}</label>
                            <input
                                type="number"
                                name="usageLimitPerUser"
                                value={formData.usageLimitPerUser}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.valid_from')}</label>
                            <input
                                type="date"
                                name="validFrom"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.validFrom}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 uppercase"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.valid_until')}</label>
                            <input
                                type="date"
                                name="validUntil"
                                required
                                min={formData.validFrom || new Date().toISOString().split('T')[0]}
                                value={formData.validUntil}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 uppercase"
                            />
                        </div>
                    </div>

                    <div className="px-6 md:px-8 pb-8 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.description')}</label>
                            <textarea
                                name="description"
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={t('form.description_placeholder')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-xs font-medium text-slate-700 shadow-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-100/50 border border-slate-200 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                                    <AlertCircle className="text-white" size={20} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{t('form.live_toggle')}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{formData.status}</div>
                                </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={formData.status === 'Active'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-4 mb-20">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/promocodes')}
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        {t('form.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wide shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 group"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{t('form.save')}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePromoCode;
