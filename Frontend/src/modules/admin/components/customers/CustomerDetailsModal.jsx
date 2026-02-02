import React, { useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, ShoppingBag, Star, ShieldAlert } from 'lucide-react';

const CustomerDetailsModal = ({ show, onHide, customer }) => {
    // Prevent background scrolling when modal is open
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

    if (!show || !customer) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onHide}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800">{customer.name}</h5>
                            <span className="text-sm text-gray-500">Member since Oct 2023</span>
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
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
                            <span className="block text-2xl font-bold text-green-700">{customer.orders}</span>
                            <span className="text-xs font-semibold text-green-600 uppercase">Total Orders</span>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                            <span className="block text-2xl font-bold text-blue-700">{customer.spent}</span>
                            <span className="text-xs font-semibold text-blue-600 uppercase">Total Spent</span>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
                            <span className="block text-2xl font-bold text-amber-700">{customer.points}</span>
                            <span className="text-xs font-semibold text-amber-600 uppercase">Reward Points</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                        <ShieldAlert size={18} className="mr-2 text-gray-400" /> Account Details
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Mail size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Email Address</span>
                                <span className="font-medium text-gray-800">{customer.email}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Phone size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Phone Number</span>
                                <span className="font-medium text-gray-800">{customer.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><MapPin size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Main Location</span>
                                <span className="font-medium text-gray-800">{customer.city}, USA</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Calendar size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Status</span>
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {customer.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Mockup */}
                    <h6 className="font-bold text-gray-800 mb-3 flex items-center">
                        <ShoppingBag size={18} className="mr-2 text-gray-400" /> Recent Activity
                    </h6>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                            Last 3 Orders
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">Order #ORD-{2024000 + i}</div>
                                        <div className="text-xs text-gray-500">Oct {20 - i}, 2023</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-800">₹{(Math.random() * 500).toFixed(2)}</div>
                                        <div className="text-xs text-green-600">Delivered</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors">
                        Send Message
                    </button>
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
