import React, { useEffect } from 'react';
import { X, MapPin, Phone, Clock, Store, User, Mail, DollarSign, Package } from 'lucide-react';

const BranchDetailsModal = ({ show, onHide, branch, onEdit }) => {
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

    if (!show || !branch) return null;

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
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            <Store size={32} />
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800">{branch.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>ID: {branch.id}</span>
                                <span>•</span>
                                <span className={`flex items-center gap-1 ${branch.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {branch.status}
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                        <div className="p-3 sm:p-4 bg-green-50 rounded-xl text-center border border-green-100 flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-green-700">₹12.5L</span>
                            <span className="text-xs font-semibold text-green-600 uppercase">Monthly Sales</span>
                        </div>
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-xl text-center border border-blue-100 flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-blue-700">1,240</span>
                            <span className="text-xs font-semibold text-blue-600 uppercase">Total Orders</span>
                        </div>
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl text-center border border-purple-100 flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-purple-700">450</span>
                            <span className="text-xs font-semibold text-purple-600 uppercase">Customers</span>
                        </div>
                    </div>

                    {/* Branch Info */}
                    <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Store size={18} className="mr-2 text-gray-400" /> Branch Details
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><MapPin size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Address</span>
                                <span className="font-medium text-gray-800">{branch.address}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Phone size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Contact Number</span>
                                <span className="font-medium text-gray-800">{branch.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><User size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Branch Manager</span>
                                <span className="font-medium text-gray-800">{branch.manager}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Clock size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Opening Hours</span>
                                <span className="font-medium text-gray-800">09:00 AM - 09:00 PM</span>
                            </div>
                        </div>
                    </div>

                    {/* Staff Section Mockup */}
                    <h6 className="font-bold text-gray-800 mb-3 flex items-center">
                        <User size={18} className="mr-2 text-gray-400" /> Key Staff Members
                    </h6>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            <div className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">JD</div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">John Doe</div>
                                        <div className="text-xs text-gray-500">Assistant Manager</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">On Duty</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">JS</div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">Jane Smith</div>
                                        <div className="text-xs text-gray-500">Cashier</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Off Duty</span>
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
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        onClick={() => {
                            onHide();
                            onEdit(branch.id);
                        }}
                    >
                        Edit Branch
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchDetailsModal;
