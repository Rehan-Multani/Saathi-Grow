import React, { useState } from 'react';
import { MapPin, ArrowLeft, Plus, MoreVertical, ShoppingBag, Clock, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SavedAddressesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [addresses] = useState([
        {
            id: 1,
            type: 'Home',
            address: 'H.No 45, Green Valley Apartments, Civil Lines',
            city: 'Delhi, 110054',
            isDefault: true,
            lastOrder: { date: '24 Jan 2024', items: 5, total: '₹540' }
        },
        {
            id: 2,
            type: 'Office',
            address: 'Tower B, Tech Park, Sector 62',
            city: 'Noida, 201309',
            isDefault: false,
            lastOrder: { date: '02 Feb 2024', items: 2, total: '₹210' }
        }
    ]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                            className="p-2 bg-white dark:bg-[#141414] rounded-full shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">Saved Addresses</h1>
                    </div>
                    <button
                        onClick={() => navigate('/address')}
                        className="flex items-center gap-2 bg-[#0c831f] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} /> Add New
                    </button>
                </div>

                {/* Address List */}
                <div className="space-y-6">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-white dark:bg-[#141414] rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#eefaf1] dark:bg-white/5 rounded-xl flex items-center justify-center text-[#0c831f]">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-gray-900 dark:text-gray-100">{addr.type}</h3>
                                                {addr.isDefault && (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg">Default</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">Synced with SaathiGro Account</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"><Edit2 size={16} /></button>
                                        <button className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="pl-13 ml-13">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{addr.address}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-1">{addr.city}</p>
                                </div>
                            </div>

                            {/* Recent Order Meta at this Address */}
                            <div className="bg-gray-50 dark:bg-white/5 px-5 py-3 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Last order at this address: <span className="text-gray-700 dark:text-gray-300">{addr.lastOrder.date}</span></span>
                                </div>
                                <span className="text-[10px] text-[#0c831f] font-black">{addr.lastOrder.total}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State Help */}
                {addresses.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">No saved addresses</h2>
                        <p className="text-sm text-gray-500">Add an address to start ordering essentials faster!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedAddressesPage;
