import React, { useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, ShoppingBag, Star, ShieldAlert } from 'lucide-react';

const CustomerDetailsModal = ({ show, onHide, customer, onSendMessage }) => {
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
            <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 m-4">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800">{customer.name}</h5>
                            <span className="text-sm text-gray-500">
                                Member since {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown'}
                            </span>
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
                <div className="p-5 overflow-y-auto">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="py-3 px-2 bg-emerald-50/50 rounded-2xl text-center border border-emerald-100 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-black text-emerald-700 leading-tight">{customer.stats?.totalOrders || 0}</span>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Orders</span>
                        </div>
                        <div className="py-3 px-2 bg-blue-50/50 rounded-2xl text-center border border-blue-100 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-black text-blue-700 leading-tight">₹{(customer.stats?.totalSpent || 0).toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Spent</span>
                        </div>
                        <div className="py-3 px-2 bg-amber-50/50 rounded-2xl text-center border border-amber-100 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-black text-amber-700 leading-tight">₹{(customer.walletBalance || 0).toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Wallet</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-6">
                        <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldAlert size={14} /> Account Details
                        </h6>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight block">Email Address</span>
                                <span className="text-xs font-bold text-gray-800 break-all">{customer.email || 'N/A'}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight block">Phone Number</span>
                                <span className="text-xs font-bold text-gray-800">+91 {customer.phone}</span>
                            </div>
                            <div className="col-span-2 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight block">Default Delivery Address</span>
                                <span className="text-[11px] font-bold text-gray-700 leading-normal">
                                    {(() => {
                                        const addr = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];
                                        if (!addr) return 'No address saved';
                                        return `${addr.street ? addr.street + ', ' : ''}${addr.city}, ${addr.state} - ${addr.zipCode}`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShoppingBag size={14} /> Recent Activity
                        </h6>
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                            {customer.recentOrders && customer.recentOrders.length > 0 ? (
                                customer.recentOrders.map((order) => (
                                    <div key={order._id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[11px] font-black text-gray-800">#{order.orderId}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="text-right flex flex-col gap-0.5">
                                            <span className="text-xs font-black text-gray-800">₹{order.totalAmount.toLocaleString()}</span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full w-fit ml-auto ${
                                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                                                order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    No Active Orders
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={() => onSendMessage(customer, 'Email')}
                        className="px-4 py-2 border border-blue-100 text-blue-600 bg-white rounded-xl hover:bg-blue-50 font-black text-[10px] uppercase tracking-wider transition-all"
                    >
                        Email
                    </button>
                    <button
                        onClick={() => onSendMessage(customer, 'Message')}
                        className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-black text-[10px] uppercase tracking-wider transition-all"
                    >
                        SMS
                    </button>
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-blue-100"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
