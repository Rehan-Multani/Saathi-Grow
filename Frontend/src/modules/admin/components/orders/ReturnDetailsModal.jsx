import React, { useEffect } from 'react';
import { Download, User, MapPin, Package, AlertCircle, X } from 'lucide-react';

const ReturnDetailsModal = ({ show, onHide, request }) => {
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

    if (!show || !request) return null;

    // Helper for status badge colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onHide}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h5 className="text-xl font-bold text-gray-800">
                        Return Request: <span className="text-red-500">{request.id}</span>
                    </h5>
                    <button
                        onClick={onHide}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                Requested on: {request.date}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h6 className="flex items-center mb-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <User size={16} className="mr-2" /> Customer Info
                            </h6>
                            <p className="font-bold text-gray-900 mb-1">{request.customer}</p>
                            <p className="text-gray-500 text-sm">
                                Original Order: <span className="font-bold text-gray-800">{request.orderId}</span>
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl">
                            <h6 className="flex items-center mb-3 text-red-600 text-sm font-medium uppercase tracking-wider">
                                <AlertCircle size={16} className="mr-2" /> Return Reason
                            </h6>
                            <p className="font-bold text-red-700 mb-1">{request.reason}</p>
                            <p className="text-red-600/80 text-sm italic">Comments: "Item arrived damaged packaging."</p>
                        </div>
                    </div>

                    <h6 className="flex items-center mb-4 font-bold text-gray-800">
                        <Package size={18} className="mr-2 text-blue-600" /> Returned Item
                    </h6>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 pl-6">Product Name</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-5 py-3 pl-6 font-medium text-gray-800">{request.product}</td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">Partially Refunded</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 font-medium transition-colors">
                            Approve
                        </button>
                        <button className="px-4 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors">
                            Reject
                        </button>
                    </div>
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnDetailsModal;
