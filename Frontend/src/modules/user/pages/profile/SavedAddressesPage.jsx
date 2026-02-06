import React from 'react';
import { MapPin, ArrowLeft, Plus, ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocation as useAppLocation } from '../../context/LocationContext';

const SavedAddressesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { savedAddresses, deleteAddress } = useAppLocation();

    const handleDelete = (id) => {
        deleteAddress(id);
    };

    const handleEdit = (id) => {
        navigate(`/edit-address/${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const from = location.state?.from || '/';
                                const noMenuPages = ['/settings', '/profile'];
                                const shouldOpenMenu = !noMenuPages.includes(from);
                                navigate(from, { state: { openMenu: shouldOpenMenu } });
                            }}
                            className="p-1.5 bg-white dark:bg-[#141414] rounded-full shadow-sm"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Saved Addresses</h1>
                    </div>
                    <button
                        onClick={() => navigate('/add-address')}
                        className="flex items-center gap-1.5 bg-[#0c831f] text-white px-3 py-1.5 rounded-lg !text-[9px] font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={14} strokeWidth={3} /> Add New
                    </button>
                </div>

                {/* Address List */}
                <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-white dark:bg-[#141414] rounded-[18px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                        >
                            <div className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#eefaf1] dark:bg-white/5 rounded-lg flex items-center justify-center text-[#0c831f]">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="!text-[12px] font-black text-gray-900 dark:text-gray-100">{addr.type}</h3>
                                                {addr.isDefault && (
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 !text-[7px] font-black uppercase rounded-lg">Default</span>
                                                )}
                                            </div>
                                            <p className="!text-[9px] text-gray-500 font-medium">{addr.name || 'Synced with Account'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(addr.id)}
                                            className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg active:scale-90 transition-all"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg active:scale-90 transition-all"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pl-9 ml-2">
                                    <p className="!text-[10px] text-gray-700 dark:text-gray-300 font-bold leading-snug">{addr.address}</p>
                                    <p className="!text-[8px] text-gray-400 font-medium mt-0.5">{addr.city}</p>
                                </div>
                            </div>

                            {/* Recent Order Meta at this Address */}
                            <div className="bg-gray-50 dark:bg-white/5 px-3 py-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <ShoppingBag size={11} className="text-gray-400" />
                                    <span className="!text-[8px] text-gray-500 font-bold uppercase tracking-tight">Last order: <span className="text-gray-700 dark:text-gray-300">{addr.lastOrder?.date || 'None'}</span></span>
                                </div>
                                <span className="!text-[9px] text-[#0c831f] font-black">{addr.lastOrder?.total || '₹0'}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State Help */}
                {savedAddresses.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">No saved addresses</h2>
                        <p className="text-sm text-gray-500 mb-6">Add an address to start ordering essentials faster!</p>
                        <button
                            onClick={() => navigate('/add-address')}
                            className="bg-[#0c831f] text-white px-6 py-2 rounded-lg !text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                        >
                            Add Address
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedAddressesPage;
