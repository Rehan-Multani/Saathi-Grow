import React, { useState } from 'react';
import { Save, Ticket, Calendar, Percent, IndianRupee, ArrowLeft, Loader2, Sparkles, AlertCircle, Gift, Image, Zap, Plus, X } from 'lucide-react';
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
        description: '',
        isAutoApply: false,
        giftTitle: '',
        giftDescription: '',
        giftImage: null
    });

    const [imagePreview, setImagePreview] = useState(null);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, giftImage: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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

            const data = new FormData();
            data.append('code', formData.code.toUpperCase());
            data.append('discountType', formData.discountType);
            data.append('discountValue', formData.discountType === 'FreeShipping' || formData.discountType === 'FreeGift' ? 0 : parseFloat(formData.discountValue || 0));
            data.append('minOrderValue', parseFloat(formData.minOrderValue || 0));
            data.append('maxDiscountAmount', parseFloat(formData.maxDiscountAmount || 0));
            data.append('usageLimitTotal', parseInt(formData.usageLimitTotal || 0));
            data.append('usageLimitPerUser', parseInt(formData.usageLimitPerUser || 1));
            data.append('validFrom', formData.validFrom);
            data.append('validUntil', formData.validUntil);
            data.append('isActive', formData.status === 'Active');
            data.append('description', formData.description);
            data.append('isAutoApply', formData.isAutoApply);

            if (formData.discountType === 'FreeGift') {
                data.append('freeGift', JSON.stringify({
                    title: formData.giftTitle,
                    description: formData.giftDescription
                }));
                if (formData.giftImage) {
                    data.append('giftImage', formData.giftImage);
                }
            }

            await createPromoCode(adminUser.token, data);
            toast.success(t('messages.create_success'));
            navigate('/admin/promocodes');
        } catch (error) {
            const errorMessage = typeof error === 'string' ? error : (error.message || error.error || t('messages.fetch_error'));
            toast.error(errorMessage);
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
                                        className="w-full pl-11 pr-4 h-[46px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 uppercase tracking-wider"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={generateCode}
                                className="h-[46px] px-6 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
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
                                    className="w-full px-4 h-[46px] bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat uppercase font-bold"
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed">Fixed Amount (₹)</option>
                                    <option value="FreeShipping">Free Shipping</option>
                                    <option value="FreeGift">Free Gift 🎁</option>
                                </select>
                            </div>

                            {formData.discountType !== 'FreeShipping' && formData.discountType !== 'FreeGift' && (
                                <div className="space-y-1.5 animate-in fade-in duration-300">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount_value')}</label>
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 h-[46px] shadow-sm focus-within:border-blue-500 transition-all">
                                        {formData.discountType === 'Percentage' ? (
                                            <Percent className="text-slate-400 shrink-0" size={16} />
                                        ) : (
                                            <IndianRupee className="text-slate-400 shrink-0" size={16} />
                                        )}
                                        <input
                                            type="number"
                                            name="discountValue"
                                            required
                                            value={formData.discountValue}
                                            onFocus={() => { if (formData.discountValue === 0 || formData.discountValue === "0") setFormData(prev => ({ ...prev, discountValue: "" })) }}
                                            onBlur={() => { if (formData.discountValue === "" || formData.discountValue === null) setFormData(prev => ({ ...prev, discountValue: "0" })) }}
                                            onChange={handleChange}
                                            style={{ borderRadius: 0, border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
                                            className="flex-1 text-sm font-bold text-slate-700 disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.min_order')}</label>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 h-[46px] shadow-sm focus-within:border-blue-500 transition-all">
                                    <IndianRupee className="text-slate-400 shrink-0" size={16} />
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        value={formData.minOrderValue}
                                        onFocus={() => { if (formData.minOrderValue === 0 || formData.minOrderValue === "0") setFormData(prev => ({ ...prev, minOrderValue: "" })) }}
                                        onBlur={() => { if (formData.minOrderValue === "") setFormData(prev => ({ ...prev, minOrderValue: "0" })) }}
                                        onChange={handleChange}
                                        style={{ borderRadius: 0, border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
                                        className="flex-1 text-sm font-bold text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none focus:outline-none"
                                    />
                                </div>
                            </div>

                            {formData.discountType === 'Percentage' && (
                                <div className="space-y-1.5 animate-in fade-in duration-300">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.max_discount')}</label>
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 h-[46px] shadow-sm focus-within:border-blue-500 transition-all">
                                        <IndianRupee className="text-slate-400 shrink-0" size={16} />
                                        <input
                                            type="number"
                                            name="maxDiscountAmount"
                                            value={formData.maxDiscountAmount}
                                            onFocus={() => { if (formData.maxDiscountAmount === 0 || formData.maxDiscountAmount === "0") setFormData(prev => ({ ...prev, maxDiscountAmount: "" })) }}
                                            onBlur={() => { if (formData.maxDiscountAmount === "") setFormData(prev => ({ ...prev, maxDiscountAmount: "0" })) }}
                                            onChange={handleChange}
                                            style={{ borderRadius: 0, border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
                                            className="flex-1 text-sm font-bold text-slate-700 disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {formData.discountType === 'FreeGift' && (
                            <div className="mt-8 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-6 animate-in slide-in-from-top duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gift className="text-emerald-600" size={20} />
                                    <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-tight">Design Free Gift</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest ml-1">Gift Title</label>
                                            <input
                                                type="text"
                                                name="giftTitle"
                                                required
                                                value={formData.giftTitle}
                                                onChange={handleChange}
                                                placeholder="e.g. Premium Chocolate Box"
                                                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                name="giftDescription"
                                                rows={2}
                                                value={formData.giftDescription}
                                                onChange={handleChange}
                                                placeholder="Briefly describe the gift..."
                                                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-medium text-slate-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest ml-1">Gift Image</label>
                                        <div 
                                            className={`relative h-[146px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden ${imagePreview ? 'border-emerald-500' : 'border-emerald-200 hover:border-emerald-400 bg-white'}`}
                                            onClick={() => document.getElementById('giftImageInput').click()}
                                        >
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Image className="text-white" size={24} />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                                        <Plus size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Upload Image</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="giftImageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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

                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isAutoApply ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                    <Zap className="text-white" size={20} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Auto Apply</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{formData.isAutoApply ? 'ON' : 'OFF'}</div>
                                </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={formData.isAutoApply}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isAutoApply: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
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
