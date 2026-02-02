import React, { useEffect } from 'react';
import { X, Store, Award, Package, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const VendorPerformanceModal = ({ show, onHide, vendor }) => {
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

    if (!show || !vendor) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onHide}></div>
            <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 m-4">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            <Store size={32} />
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800">{vendor.name}</h5>
                            <div className="text-sm text-gray-500">Vendor ID: {vendor.id}</div>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                                <Award size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-yellow-800 font-medium">Overall Rating</div>
                                <div className="text-2xl font-bold text-gray-800">{vendor.rating} <span className="text-sm font-normal text-gray-500">/ 5.0</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-green-800 font-medium">Monthly Growth</div>
                                <div className="text-2xl font-bold text-gray-800">+12%</div>
                            </div>
                        </div>
                    </div>

                    <h6 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Package size={18} className="text-gray-400" /> Sales Overview
                    </h6>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="border border-gray-100 rounded-lg p-4 text-center">
                            <div className="text-gray-500 text-sm mb-1">Total Sales</div>
                            <div className="text-lg font-bold text-gray-800">{vendor.sales}</div>
                        </div>
                        <div className="border border-gray-100 rounded-lg p-4 text-center">
                            <div className="text-gray-500 text-sm mb-1">Products Sold</div>
                            <div className="text-lg font-bold text-gray-800">1,245</div>
                        </div>
                        <div className="border border-gray-100 rounded-lg p-4 text-center">
                            <div className="text-gray-500 text-sm mb-1">Returns</div>
                            <div className="text-lg font-bold text-red-600">2.1%</div>
                        </div>
                    </div>

                    <h6 className="font-bold text-gray-800 mb-3">Recent Activity</h6>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm border-b border-gray-50 pb-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-600">Payout of <b>₹12,400</b> processed on Nov 01, 2023</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm border-b border-gray-50 pb-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-600">Added 5 new products to 'Snacks' category</span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onHide} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                        Close
                    </button>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Full Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorPerformanceModal;
