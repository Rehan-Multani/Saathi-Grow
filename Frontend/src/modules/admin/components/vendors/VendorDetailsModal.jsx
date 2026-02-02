import React, { useEffect } from 'react';
import { X, Mail, Phone, MapPin, Store, Star, Package, ShieldCheck, Globe } from 'lucide-react';
import { Badge } from 'react-bootstrap';

const VendorDetailsModal = ({ show, onHide, vendor }) => {
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

    if (!show || !vendor) return null;

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
                            <h5 className="text-xl font-bold text-gray-800">{vendor.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>ID: {vendor.id}</span>
                                <span>•</span>
                                <span className={`flex items-center gap-1 ${vendor.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {vendor.status === 'Active' ? <ShieldCheck size={14} /> : null} {vendor.status}
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
                            <span className="block text-xl sm:text-2xl font-bold text-green-700">{vendor.products}</span>
                            <span className="text-xs font-semibold text-green-600 uppercase">Total Products</span>
                        </div>
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-xl text-center border border-blue-100 flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-blue-700 flex items-center justify-center gap-1">
                                {vendor.rating} <Star size={18} fill="currentColor" />
                            </span>
                            <span className="text-xs font-semibold text-blue-600 uppercase">Average Rating</span>
                        </div>
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl text-center border border-purple-100 flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-purple-700">₹45.2k</span>
                            <span className="text-xs font-semibold text-purple-600 uppercase">Total Sales</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Store size={18} className="mr-2 text-gray-400" /> Business Details
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Mail size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Email Address</span>
                                <span className="font-medium text-gray-800">{vendor.email}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Phone size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Phone Number</span>
                                <span className="font-medium text-gray-800">{vendor.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><MapPin size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Address</span>
                                <span className="font-medium text-gray-800">123 Market Street, Downtown, City</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Globe size={16} className="text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-500">Website</span>
                                <span className="font-medium text-gray-800 text-blue-600 cursor-pointer">www.examplejs.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            {vendor.owner.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Store Owner</div>
                            <div className="font-bold text-gray-800">{vendor.owner}</div>
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
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        View Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorDetailsModal;
