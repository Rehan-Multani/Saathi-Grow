import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Package, Trash2, Loader2, Store, ListChecks, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, bulkAdjustInventory } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField } from '@mui/material';

const AddStockAdjustment = () => {
    const { t } = useTranslation('admin_stock');
    const navigate = useNavigate();
    const location = useLocation();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [formData, setFormData] = useState({
        branchId: '',
        type: 'Addition',
        reason: 'New Stock Arrival',
        notes: '',
        commonAmount: ''
    });

    const [individualAmounts, setIndividualAmounts] = useState({});

    const REASONS = [
        'New Stock Arrival',
        'Damaged Goods',
        'Inventory Correction',
        'Return',
        'Theft/Loss',
        'Audit',
        'Other'
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productsData, branchesData] = await Promise.all([
                    getProducts(adminUser.token, { limit: 1000 }),
                    getBranches(adminUser.token)
                ]);

                const adminProducts = (productsData.products || []).filter(p => !p.vendor);
                setProducts(adminProducts);

                const activeBranches = branchesData.filter(b => b.isActive);
                setBranches(activeBranches);

                if (location.state) {
                    if (location.state.productId) {
                        const preSelected = adminProducts.find(p => p._id === location.state.productId);
                        if (preSelected) setSelectedProducts([preSelected]);
                    }
                    if (location.state.branchId) {
                        const targetBranchId = typeof location.state.branchId === 'object'
                            ? (location.state.branchId._id || location.state.branchId.id)
                            : location.state.branchId;

                        setFormData(prev => ({
                            ...prev,
                            branchId: String(targetBranchId),
                            type: location.state.type || 'Addition',
                            reason: location.state.reason || 'New Stock Arrival'
                        }));
                    }
                }
            } catch (error) {
                // toast.error(t('add_adjustment.alerts.error_load'));
            } finally {
                setInitialLoading(false);
            }
        };

        if (adminUser?.token) fetchInitialData();
    }, [adminUser, t, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (event, newValue) => {
        setSelectedProducts(newValue);
    };

    const handleAmountChange = (productId, amount) => {
        setIndividualAmounts(prev => ({ ...prev, [productId]: amount }));
    };

    const removeProduct = (id) => {
        setSelectedProducts(prev => prev.filter(p => p._id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedProducts.length === 0 || !formData.branchId || !formData.reason) {
            toast.warning(t('add_adjustment.alerts.select_items'));
            return;
        }

        setLoading(true);
        try {
            const adjustments = selectedProducts.map(p => ({
                productId: p._id,
                branchId: formData.branchId,
                amount: Number(individualAmounts[p._id] || formData.commonAmount || 0)
            }));

            if (adjustments.some(a => a.amount === 0 && formData.type !== 'Audit')) {
                toast.warning(t('add_adjustment.alerts.qty_required'));
                setLoading(false);
                return;
            }

            await bulkAdjustInventory(adminUser.token, {
                adjustments,
                commonData: {
                    type: formData.type,
                    reason: formData.reason,
                    notes: formData.notes
                }
            });

            toast.success(t('add_adjustment.alerts.success'));
            navigate('/admin/stock/adjustments');
        } catch (error) {
            toast.error(error.message || t('add_adjustment.alerts.error'));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-sm font-medium">{t('add_adjustment.preparing_msg')}</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/stock/adjustments')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 hover:border-blue-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{t('add_adjustment.title')}</h1>
                        <p className="text-slate-500 text-[11px] font-medium leading-tight">{t('add_adjustment.subtitle')}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Product Selection */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Package size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 inline-block">{t('add_adjustment.step_items')}</h3>
                        </div>

                        <div className="space-y-4">
                            <Autocomplete
                                multiple
                                options={products}
                                getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                value={selectedProducts}
                                onChange={handleProductSelect}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label={t('add_adjustment.search_products')}
                                        className="bg-slate-50/50 rounded-xl"
                                        InputProps={{
                                            ...params.InputProps,
                                            style: { borderRadius: '12px' }
                                        }}
                                        inputProps={{
                                            ...params.inputProps,
                                            className: `${params.inputProps.className || ''} !border-0 !ring-0 focus:!ring-0 focus:!border-0 !outline-none`
                                        }}
                                    />
                                )}
                            />

                            {selectedProducts.length > 0 && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {t('add_adjustment.items_selected', { count: selectedProducts.length })}
                                        </div>
                                        {selectedProducts.length > 1 && (
                                            <div className="flex items-center gap-3 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase">{t('add_adjustment.bulk_qty')}</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-20 bg-white border border-blue-200 rounded-lg py-1 px-2 text-xs font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                                                    value={formData.commonAmount}
                                                    onChange={(e) => setFormData({ ...formData, commonAmount: e.target.value })}
                                                    placeholder="1"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">{t('add_adjustment.table.description')}</th>
                                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">{t('add_adjustment.table.quantity')}</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">{t('add_adjustment.table.action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedProducts.map(p => (
                                                    <tr key={p._id} className="hover:bg-white transition-colors">
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package size={14} className="text-slate-200" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-xs font-bold text-slate-700 truncate uppercase tracking-tight">{p.name}</div>
                                                                    <div className="text-[9px] text-slate-400 font-bold uppercase">{p.sku}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-20 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition-all text-center"
                                                                placeholder={formData.commonAmount || "1"}
                                                                value={individualAmounts[p._id] || ''}
                                                                onChange={(e) => handleAmountChange(p._id, e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeProduct(p._id)}
                                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors active:scale-90"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Meta Details */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                                <ListChecks size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-500 inline-block">{t('add_adjustment.step_logic')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add_adjustment.form.label_target_branch')} <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={14} />
                                    <select
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">{t('add_adjustment.form.choose_branch')}</option>
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add_adjustment.form.label_action_type')} <span className="text-rose-500">*</span></label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="Addition">{t('branch.status_filter.in_stock')}</option>
                                        <option value="Deduction">{t('adjustments.types.deduction')}</option>
                                        <option value="Damage">{t('adjustments.types.damage')}</option>
                                        <option value="Return">{t('adjustments.types.return')}</option>
                                        <option value="Audit">{t('adjustments.types.audit')}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add_adjustment.form.label_primary_reason')} <span className="text-rose-500">*</span></label>
                                    <select
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                                    >
                                        {REASONS.map((r, idx) => (
                                            <option key={idx} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('add_adjustment.form.label_notes')}</label>
                                <textarea
                                    rows={3}
                                    placeholder={t('add_adjustment.form.placeholder_notes')}
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || selectedProducts.length === 0}
                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg ${loading || selectedProducts.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {loading ? t('add_adjustment.form.loading') : (selectedProducts.length > 1 ? t('add_adjustment.form.submit_multi_btn', { count: selectedProducts.length }) : t('add_adjustment.form.submit_btn'))}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/stock/adjustments')}
                                className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors"
                            >
                                {t('add_adjustment.form.discard')}
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm flex items-start gap-3">
                        <Info className="text-blue-500 mt-0.5" size={16} />
                        <div>
                            <p className="text-[11px] font-bold text-blue-900 border-b border-blue-100 pb-1 mb-1 uppercase tracking-tighter">{t('add_adjustment.audit_warning.title')}</p>
                            <p className="text-[10px] text-blue-700 font-medium leading-normal italic">{t('add_adjustment.audit_warning.msg')}</p>
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

export default AddStockAdjustment;
