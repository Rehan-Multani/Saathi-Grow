import React, { useState, useEffect } from 'react';
import { Save, X, Archive, MapPin, Maximize2, Shield, CheckCircle2, BarChart3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const EditWarehouseModal = ({ show, onHide, warehouse, onSave }) => {
    const { t } = useTranslation('admin_locations');
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        stockLevel: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name || '',
                location: warehouse.location || '',
                capacity: warehouse.capacity || '',
                stockLevel: warehouse.stockLevel || '',
                status: warehouse.status || 'Active'
            });
        }
    }, [warehouse, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ ...warehouse, ...formData });
            onHide();
            Swal.fire({
                title: t('messages.update_success'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-2xl',
                }
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-200 font-sans border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-start">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Archive size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('form.edit_hub')}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('form.hub_info')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-100 transition-all border border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 scrollbar-thin max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner text-start">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.hub_name')}</label>
                            <div className="relative group">
                                <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.hub_location')}</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.capacity')}</label>
                            <div className="relative group">
                                <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    name="capacity"
                                    placeholder="50,000"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.occupancy')}</label>
                            <div className="relative group">
                                <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    name="stockLevel"
                                    placeholder="75%"
                                    value={formData.stockLevel}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.hub_status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat uppercase"
                            >
                                <option value="Active">{t('status.active')}</option>
                                <option value="Inactive">{t('status.inactive')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Shield className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-tight">{t('form.guard_protocol')}</h4>
                                <p className="text-[9px] text-slate-500 font-medium uppercase">{t('form.guard_active')}</p>
                            </div>
                        </div>
                        <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button onClick={onHide} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 rounded-xl border border-slate-200 bg-white transition-all active:scale-95">
                        {t('form.discard')}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('form.submit_edit')}
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

export default EditWarehouseModal;
