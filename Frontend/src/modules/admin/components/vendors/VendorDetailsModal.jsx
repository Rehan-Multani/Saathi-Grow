import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Phone, MapPin, Store, Star, Package, ShieldCheck, Globe, Info } from 'lucide-react';
import { Badge } from 'react-bootstrap';

const VendorDetailsModal = ({ show, onHide, vendor }) => {
    const navigate = useNavigate();

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [show]);

    if (!show || !vendor) return null;

    const handleViewProducts = () => {
        onHide();
        navigate('/admin/vendors/inventory'); // Assuming this is the path for VendorProducts
    };

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
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold border border-blue-100 overflow-hidden">
                            {vendor.logo ? (
                                <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={32} />
                            )}
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800">{vendor.storeName}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-mono text-xs">#{vendor._id}</span>
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
                        <div className="p-3 sm:p-4 bg-green-50 rounded-xl text-center border border-green-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-green-700">{vendor.products || 0}</span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Products</span>
                        </div>
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-xl text-center border border-blue-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-blue-700 flex items-center justify-center gap-1">
                                {vendor.rating || 0} <Star size={18} fill="currentColor" />
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Rating</span>
                        </div>
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl text-center border border-purple-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center">
                            <span className="block text-xl sm:text-2xl font-bold text-purple-700">₹0</span>
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Total Sales</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <h6 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest flex items-center">
                        Business Details
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-gray-100 rounded-lg"><Mail size={16} className="text-gray-500" /></div>
                            <div>
                                <span className="block text-xs text-gray-400 font-bold uppercase tracking-tight">Email Address</span>
                                <span className="font-semibold text-gray-800">{vendor.email}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-gray-100 rounded-lg"><Phone size={16} className="text-gray-500" /></div>
                            <div>
                                <span className="block text-xs text-gray-400 font-bold uppercase tracking-tight">Phone Number</span>
                                <span className="font-semibold text-gray-800">{vendor.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:col-span-2">
                            <div className="mt-1 p-2 bg-gray-100 rounded-lg"><MapPin size={16} className="text-gray-500" /></div>
                            <div>
                                <span className="block text-xs text-gray-400 font-bold uppercase tracking-tight">Store Address</span>
                                <span className="font-semibold text-gray-800 leading-relaxed">{vendor.address}</span>
                            </div>
                        </div>
                        {vendor.description && (
                            <div className="flex items-start gap-3 md:col-span-2">
                                <div className="mt-1 p-2 bg-gray-100 rounded-lg"><Info size={16} className="text-gray-500" /></div>
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-tight">About Shop</span>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{vendor.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Owner Info */}
                    <div className="bg-gray-100/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white shadow-sm border border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-800">
                                {vendor.ownerName?.charAt(0)}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Store Owner</div>
                                <div className="font-bold text-lg text-gray-800">{vendor.ownerName}</div>
                            </div>
                        </div>
                        <Badge bg="white" text="dark" className="border shadow-none py-2 px-3">Primary Account</Badge>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onHide}
                        className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 rounded-xl font-bold transition-all text-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleViewProducts}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                    >
                        <Package size={16} />
                        View Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorDetailsModal;
