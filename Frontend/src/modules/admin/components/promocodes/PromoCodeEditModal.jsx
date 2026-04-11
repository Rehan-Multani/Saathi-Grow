import React, { useState, useEffect } from 'react';
import { Save, X, Ticket, Percent, IndianRupee, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const PromoCodeEditModal = ({ show, onHide, promoCode, onSave }) => {
    const { t } = useTranslation('admin_promocodes');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscountAmount: '',
        usageLimitTotal: '',
        usageLimitPerUser: '',
        isActive: true,
        validFrom: '',
        validUntil: '',
        description: ''
    });

    useEffect(() => {
        if (promoCode) {
            setFormData({
                _id: promoCode._id,
                code: promoCode.code || '',
                discountType: promoCode.discountType || 'Percentage',
                discountValue: promoCode.discountValue || '0',
                minOrderValue: promoCode.minOrderValue || '0',
                maxDiscountAmount: promoCode.maxDiscountAmount || '0',
                usageLimitTotal: promoCode.usageLimitTotal || '0',
                usageLimitPerUser: promoCode.usageLimitPerUser || '1',
                isActive: promoCode.isActive ?? true,
                validFrom: promoCode.validFrom ? new Date(promoCode.validFrom).toISOString().split('T')[0] : '',
                validUntil: promoCode.validUntil ? new Date(promoCode.validUntil).toISOString().split('T')[0] : '',
                description: promoCode.description || ''
            });
        }
    }, [promoCode, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? (name === 'isActive' ? checked : value) : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (parseFloat(formData.discountValue) < 0 || parseFloat(formData.minOrderValue) < 0) {
            toast.error(t('messages.negative_error'));
            setLoading(false);
            return;
        }

        try {
            await onSave({
                ...formData,
                discountValue: formData.discountType === 'FreeShipping' ? 0 : parseFloat(formData.discountValue),
                minOrderValue: parseFloat(formData.minOrderValue),
                maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
                usageLimitTotal: parseInt(formData.usageLimitTotal),
                usageLimitPerUser: parseInt(formData.usageLimitPerUser)
            });
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col font-sans border border-slate-200 animate-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                            <Ticket size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('form.edit_title')}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{t('form.config_section')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-100 transition-all border border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto scrollbar-thin max-h-[70vh] space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.identity_label')}</label>
                            <div className="relative group">
                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 uppercase tracking-tight"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount_type')}</label>
                            <select 
                                name="discountType" 
                                value={formData.discountType} 
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-[11px] font-bold text-slate-700 uppercase appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat shadow-sm"
                            >
                                <option value="Percentage">Percentage (%)</option>
                                <option value="Fixed">Fixed Amount (₹)</option>
                                <option value="FreeShipping">Free Shipping</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount_value')}</label>
                            <div className="relative group">
                                {formData.discountType === 'Percentage' ? (
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                ) : (
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                )}
                                <input
                                    type="number"
                                    name="discountValue"
                                    required={formData.discountType !== 'FreeShipping'}
                                    disabled={formData.discountType === 'FreeShipping'}
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.min_order')}</label>
                            <div className="relative group">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                <input
                                    type="number"
                                    name="minOrderValue"
                                    value={formData.minOrderValue}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 font-sans">{t('form.max_discount')}</label>
                            <div className="relative group">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                                <input
                                    type="number"
                                    name="maxDiscountAmount"
                                    value={formData.maxDiscountAmount}
                                    disabled={formData.discountType !== 'Percentage'}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('form.total_limit')}</label>
                            <input
                                type="number"
                                name="usageLimitTotal"
                                value={formData.usageLimitTotal}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-[11px] font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('form.per_user_limit')}</label>
                            <input
                                type="number"
                                name="usageLimitPerUser"
                                value={formData.usageLimitPerUser}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-[11px] font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('form.valid_from')}</label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-[11px] font-bold text-slate-700 uppercase tracking-tighter"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('form.valid_until')}</label>
                            <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-[11px] font-bold text-slate-700 uppercase tracking-tighter"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.description')}</label>
                            <textarea
                                name="description"
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-xs font-medium text-slate-700 shadow-sm"
                            />
                        </div>

                         <div className="flex items-center justify-between p-4 bg-slate-100/50 border border-slate-200 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                                    <AlertCircle className="text-white" size={18} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{t('form.live_toggle')}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{formData.isActive ? 'Active' : 'Inactive'}</div>
                                </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button onClick={onHide} className="flex-1 py-3 text-slate-400 font-bold text-[11px] uppercase tracking-wide hover:bg-slate-200 rounded-xl transition-all border border-slate-200 shadow-sm bg-white">
                        {t('form.cancel')}
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-wide shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 group"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('form.update')}
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default PromoCodeEditModal;
