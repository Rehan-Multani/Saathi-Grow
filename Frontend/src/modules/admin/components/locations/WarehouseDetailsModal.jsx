import React, { useEffect } from 'react';
import { X, MapPin, Package, Archive, Truck, Users, Activity, BarChart3 } from 'lucide-react';

const WarehouseDetailsModal = ({ show, onHide, warehouse, onEdit }) => {
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
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onHide}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 m-4">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                            <Archive size={32} />
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800">{warehouse.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>ID: WH-{warehouse.id}</span>
                                <span>•</span>
                                <span className={`flex items-center gap-1 ${warehouse.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {warehouse.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex justify-between items-center mb-2">
                                <BarChart3 size={18} className="text-amber-600" />
                                <span className="text-xs font-bold text-amber-600 uppercase">Usage</span>
                            </div>
                            <h3 className="text-2xl font-bold text-amber-800">{warehouse.stockLevel}</h3>
                            <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: warehouse.stockLevel }}></div>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                                <Package size={18} className="text-blue-600" />
                                <span className="text-xs font-bold text-blue-600 uppercase">Capacity</span>
                            </div>
                            <h3 className="text-xl font-bold text-blue-800">{warehouse.capacity}</h3>
                            <p className="text-xs text-blue-600 mt-2">Available for more stock</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="flex justify-between items-center mb-2">
                                <Users size={18} className="text-purple-600" />
                                <span className="text-xs font-bold text-purple-600 uppercase">Staff</span>
                            </div>
                            <h3 className="text-2xl font-bold text-purple-800">12</h3>
                            <p className="text-xs text-purple-600 mt-2">Active workers</p>
                        </div>
                    </div>

                    {/* General Info */}
                    <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Archive size={18} className="mr-2 text-gray-400" /> Location Details
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <span className="block text-xs uppercase font-bold text-gray-400">Full Location</span>
                                <span className="text-sm font-medium text-gray-700">{warehouse.location}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Activity size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <span className="block text-xs uppercase font-bold text-gray-400">Operational Type</span>
                                <span className="text-sm font-medium text-gray-700">Storage & Distribution</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Deliveries Mockup */}
                    <h6 className="font-bold text-gray-800 mb-3 flex items-center">
                        <Truck size={18} className="mr-2 text-gray-400" /> Logistics Overview
                    </h6>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase">
                            <span>Vehicle</span>
                            <span>Status</span>
                            <span className="text-right">Estimated</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <div className="px-4 py-3 grid grid-cols-3 items-center">
                                <span className="text-sm font-medium text-gray-700">UP-14 AK-2021</span>
                                <div><span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Incoming</span></div>
                                <span className="text-xs text-gray-500 text-right">02:30 PM</span>
                            </div>
                            <div className="px-4 py-3 grid grid-cols-3 items-center">
                                <span className="text-sm font-medium text-gray-700">MH-01 CJ-9923</span>
                                <div><span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Outgoing</span></div>
                                <span className="text-xs text-gray-500 text-right">04:15 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                    <button
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors d-flex align-items-center gap-2"
                        onClick={() => {
                            onHide();
                            onEdit(warehouse.id);
                        }}
                    >
                        Manage Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDetailsModal;
