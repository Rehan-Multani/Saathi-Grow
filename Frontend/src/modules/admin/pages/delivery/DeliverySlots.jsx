import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, Calendar, LayoutGrid, ArrowLeft, Loader2, Save, X, Info, Power, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import * as api from '../../api/deliverySlotApi';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';
import { getAdminSettings, updateAdminSettings } from '../../../../common/api/settingApi';

const DeliverySlots = () => {
    const { t } = useTranslation('admin_delivery');
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [deliverySettings, setDeliverySettings] = useState(null);
    const [savingImmediate, setSavingImmediate] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        startTime: '06:00',
        endTime: '08:00',
        maxOrders: 50,
        isActive: true
    });

    // Role check
    const isVendor = window.location.pathname.startsWith('/vendor');

    const fetchSlots = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const data = await api.getAdminDeliverySlots();
            setSlots(data || []);
        } catch (error) {
            console.error("Slots fetch failed", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSlots();
        if (!isVendor) {
            getAdminSettings().then(setDeliverySettings).catch((error) => console.error('Settings fetch failed', error));
        }
    }, [isVendor]);

    const toggleImmediateDelivery = async () => {
        if (!deliverySettings || savingImmediate) return;
        setSavingImmediate(true);
        try {
            const updated = await updateAdminSettings(null, {
                immediateDeliveryEnabled: !deliverySettings.immediateDeliveryEnabled
            });
            setDeliverySettings(updated);
        } catch (error) {
            Swal.fire({ title: 'Unable to update Immediate Delivery', text: error.response?.data?.message, icon: 'error' });
        } finally {
            setSavingImmediate(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (slot) => {
        setSelectedSlot(slot);
        setFormData({
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxOrders: slot.maxOrders,
            isActive: slot.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedSlot) {
                await api.updateDeliverySlot(selectedSlot._id, formData);
            } else {
                await api.createDeliverySlot(formData);
            }
            setShowModal(false);
            fetchSlots();
            Swal.fire({
                title: 'Slot Board Updated',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                title: 'Failed to save slot',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation(
            'Delete this time window?',
            "Customers won't see this slot anymore."
        );

        if (result.isConfirmed) {
            try {
                await api.deleteDeliverySlot(id);
                fetchSlots();
            } catch (error) {
                Swal.fire({
                    title: 'Delete failed',
                    icon: 'error'
                });
            }
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">{t('slots.title')}</h1>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('slots.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => fetchSlots(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    {!isVendor && (
                        <button 
                            onClick={() => {
                                setSelectedSlot(null);
                                setFormData({ label: '', startTime: '06:00', endTime: '08:00', maxOrders: 50, isActive: true });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100 border-none"
                        >
                            <Plus size={16} />
                            <span>{t('slots.add_new')}</span>
                        </button>
                    )}
                </div>
            </div>

            {!isVendor && deliverySettings && (
                <div className="mb-5 flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg px-5 py-4 shadow-sm">
                    <div>
                        <p className="text-sm font-bold text-slate-900">Immediate Delivery</p>
                        <p className="text-xs text-slate-500 mt-1">Allow customers to request delivery as soon as possible.</p>
                    </div>
                    <button type="button" role="switch" aria-checked={deliverySettings.immediateDeliveryEnabled}
                        disabled={savingImmediate} onClick={toggleImmediateDelivery} title="Toggle Immediate Delivery"
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${deliverySettings.immediateDeliveryEnabled ? 'bg-emerald-500' : 'bg-slate-300'} disabled:opacity-50`}>
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${deliverySettings.immediateDeliveryEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            )}

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Window Label</th>
                                <th className="px-6 py-5 text-center">Start Time</th>
                                <th className="px-6 py-5 text-center">End Time</th>
                                <th className="px-6 py-5 text-center">Limit</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                {!isVendor && <th className="px-8 py-5 text-right uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && !refreshing ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-1/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : slots.length > 0 ? (
                                slots.map((slot) => (
                                    <tr key={slot._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{slot.label}</td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">{slot.startTime}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">{slot.endTime}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-bold text-slate-900">{slot.maxOrders}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                                                slot.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                            }`}>
                                                {slot.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        {!isVendor && (
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(slot)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                        title="Edit Slot"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(slot._id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                                        title="Delete Slot"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isVendor ? "5" : "6"} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <Clock size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No timeslots configured yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{selectedSlot ? 'Update Window' : 'New Delivery Shift'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Label Name</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Morning Shift"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Shipments</label>
                                <input
                                    type="number"
                                    name="maxOrders"
                                    value={formData.maxOrders}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className={`w-10 h-6 rounded-full relative transition-all cursor-pointer ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.isActive ? 'left-5' : 'left-1'}`} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight italic">Mark as Active</span>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-xs hover:bg-slate-50 rounded-xl transition-all border border-transparent">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all border-none">Save Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default DeliverySlots;
