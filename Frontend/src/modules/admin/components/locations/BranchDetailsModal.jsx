import React, { useEffect } from 'react';
import { X, MapPin, Phone, Store, User, Mail, Globe } from 'lucide-react';

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

    const fullAddress = branch.address ?
        `${branch.address.street || ''}, ${branch.address.city || ''}, ${branch.address.state || ''} ${branch.address.zipCode || ''}` :
        'No address provided';

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
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 text-start">
                    <div className="flex items-center gap-4 text-start">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                            <Store size={32} />
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800 mb-0">{branch.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-mono">{branch.code}</span>
                                <span>₹</span>
                                <span className={`flex items-center gap-1 ${branch.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {branch.isActive ? 'Active' : 'Inactive'}
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
                <div className="p-6 overflow-y-auto text-start">
                    <h6 className="font-bold text-gray-800 mb-4 flex items-center text-start">
                        <Store size={18} className="mr-2 text-primary" /> Branch Information
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8 text-start">
                        <div className="flex items-start gap-3 text-start">
                            <div className="mt-1"><MapPin size={18} className="text-blue-500" /></div>
                            <div>
                                <span className="block text-xs font-bold text-uppercase text-gray-400 mb-1">Full Address</span>
                                <span className="font-medium text-gray-800 text-sm leading-relaxed">{fullAddress}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-start">
                            <div className="mt-1"><Phone size={18} className="text-green-500" /></div>
                            <div>
                                <span className="block text-xs font-bold text-uppercase text-gray-400 mb-1">Contact Phone</span>
                                <span className="font-medium text-gray-800 text-sm font-mono">{branch.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-start">
                            <div className="mt-1"><Mail size={18} className="text-amber-500" /></div>
                            <div>
                                <span className="block text-xs font-bold text-uppercase text-gray-400 mb-1">Branch Email</span>
                                <span className="font-medium text-gray-800 text-sm">{branch.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe size={18} className="text-gray-400" />
                            <h6 className="font-bold text-gray-800 mb-0">Operational Status</h6>
                        </div>
                        <p className="text-sm text-gray-600 mb-0 leading-relaxed">
                            This branch is currently {branch.isActive ? 'operational and accepting orders.' : 'closed or inactive.'}
                            Inventory management and staff assignments are restricted to this location's scope.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-auto">
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-all"
                    >
                        Close Details
                    </button>
                    <button
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                        onClick={() => {
                            onHide();
                            onEdit(branch);
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
