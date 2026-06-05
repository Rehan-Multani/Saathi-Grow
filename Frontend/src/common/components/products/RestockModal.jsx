import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Package, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adjustInventory } from '../../api/productApi';
import { useAdminAuth } from '../../../modules/admin/context/AdminAuthContext';
import { useStaffAuth } from '../../../modules/staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../modules/store-manager/context/StoreManagerAuthContext';
import { toast } from 'react-toastify';

const RestockModal = ({ show, onHide, product, onRestockSuccess }) => {
    const { t } = useTranslation('admin_products');
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();

    const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Addition');
    const [reason, setReason] = useState('');
    const [branchId, setBranchId] = useState('');
    const [loading, setLoading] = useState(false);
    const isVendorProduct = Boolean(product?.vendor);

    useEffect(() => {
        if (show) {
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            setAmount('');
            setType('Addition');
            setReason('');
            if (!isVendorProduct && product?.branchStocks?.length > 0) setBranchId(product.branchStocks[0].branchId._id || product.branchStocks[0].branchId);
            else if (product?.vendor) setBranchId('vendor');
            else setBranchId('');
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'unset';
        };
    }, [show, product, isVendorProduct]);

    const getSelectedBranchStock = () => {
        if (!product || !branchId) return 0;
        if (branchId === 'vendor') return product.stock || 0;
        const bs = product.branchStocks.find(s => (s.branchId?._id || s.branchId) === branchId);
        return bs ? bs.stock : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVendorProduct && !branchId) return toast.warning(t('restock.select_branch'));
        if (!amount || amount <= 0) return toast.warning(t('restock.qty') + ' required');
        setLoading(true);
        try {
            const result = await adjustInventory(adminUser.token, product._id, { amount: Number(amount), type, reason, branchId: branchId === 'vendor' ? null : branchId });
            toast.success(t('messages.update_success'));
            if (onRestockSuccess) onRestockSuccess(result.product);
            onHide();
        } catch (error) { toast.error(error.message); }
        finally { setLoading(false); }
    };

    if (!show) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col scale-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <Package size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{t('restock.title')}</h2>
                    </div>
                    <button onClick={onHide} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {product && (
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900 truncate max-w-[150px]">{product.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.sku}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('restock.label')}</div>
                                    <div className={`text-xl font-bold ${getSelectedBranchStock() <= 10 ? 'text-red-500' : 'text-green-600'}`}>
                                        {getSelectedBranchStock()} <small className="text-[10px] uppercase font-bold text-slate-400">{product.unitType || 'pcs'}</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">{t('restock.storage_info')}</label>
                                <select 
                                    value={branchId} 
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="">{t('restock.select_branch')}</option>
                                    {product.vendor && <option value="vendor">{t('restock.vendor_warehouse')} ({product.vendor.storeName})</option>}
                                    {product.branchStocks?.map(bs => (
                                        <option key={bs.branchId._id || bs.branchId} value={bs.branchId._id || bs.branchId}>
                                            {bs.branchId.name || 'Branch'} (Stock: {bs.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('restock.adj_type')}</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none">
                                <option value="Addition">{t('restock.types.addition')}</option>
                                <option value="Return">{t('restock.types.return')}</option>
                                <option value="Deduction">{t('restock.types.deduction')}</option>
                                <option value="Damage">{t('restock.types.damage')}</option>
                                <option value="Audit">{t('restock.types.audit')}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('restock.qty')}</label>
                            <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-blue-600 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('restock.remark')}</label>
                        <textarea rows={2} placeholder={t('restock.remark_placeholder')} value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none" />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || (!isVendorProduct && !branchId)}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        {t('restock.confirm')}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default RestockModal;
