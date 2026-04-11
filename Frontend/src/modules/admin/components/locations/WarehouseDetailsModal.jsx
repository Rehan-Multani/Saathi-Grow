import React, { useEffect } from 'react';
import { X, MapPin, Package, Archive, Truck, Users, Activity, BarChart3, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WarehouseDetailsModal = ({ show, onHide, warehouse, onEdit }) => {
    const { t } = useTranslation('admin_locations');
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    if (!show || !warehouse) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-200 font-sans border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Archive size={24} />
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{warehouse.name}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('table.identity')}: {warehouse.id}</span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${warehouse.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {warehouse.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-100 transition-all border border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 overflow-y-auto scrollbar-thin max-h-[70vh]">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 shadow-inner">
                            <div className="flex justify-between items-center">
                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                    <BarChart3 size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('form.usage')}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-none mb-2">{warehouse.stockLevel}</h3>
                                <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: warehouse.stockLevel }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 shadow-inner">
                            <div className="flex justify-between items-center">
                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                                    <Package size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('form.capacity')}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">{warehouse.capacity}</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{t('status.active')}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 shadow-inner">
                            <div className="flex justify-between items-center">
                                <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                                    <Users size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('form.staff')}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">12</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Staff Available</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <MapPin size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('form.address_node')}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed pr-4">
                                    {warehouse.location}
                                </p>
                            </div>
                            <div className="space-y-3 md:border-l md:border-slate-200 md:pl-8">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Activity size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('form.ops_type')}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                    Main Storage & Distibution Center
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Truck size={14} className="text-slate-400" />
                            <h6 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{t('form.activity')}</h6>
                        </div>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                            <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 grid grid-cols-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                <span className="text-left">{t('form.vehicle')}</span>
                                <span>Status</span>
                                <span className="text-right">{t('form.eta')}</span>
                            </div>
                            <div className="divide-y divide-slate-50 font-medium">
                                <div className="px-6 py-3 grid grid-cols-3 items-center hover:bg-slate-50 transition-colors">
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">DEL-UP-2021</span>
                                    <div className="flex justify-center">
                                        <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-100">Arrived</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold text-right">14:30</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button onClick={onHide} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm transition-all active:scale-95">
                        {t('form.discard')}
                    </button>
                    <button
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        onClick={() => {
                            onHide();
                            onEdit(warehouse.id);
                        }}
                    >
                        {t('form.edit_settings')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDetailsModal;
