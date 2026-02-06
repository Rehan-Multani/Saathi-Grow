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
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6 pb-24 md:p-8">
            <div className="max-w-2xl md:max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const from = location.state?.from || '/';
                                const noMenuPages = ['/settings', '/profile'];
                                const shouldOpenMenu = !noMenuPages.includes(from);
                                navigate(from, { state: { openMenu: shouldOpenMenu } });
                            }}
                            className="p-1.5 md:p-2 bg-white dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={16} className="md:w-6 md:h-6" />
                        </button>
                        <h1 className="!text-[13px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Saved Addresses</h1>
                    </div>
                    <button
                        onClick={() => navigate('/add-address')}
                        className="flex items-center gap-1.5 bg-[#0c831f] text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg !text-[9px] md:!text-sm font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all hover:bg-[#0a6b19]"
                    >
                        <Plus size={14} strokeWidth={3} className="md:w-5 md:h-5" /> Add New
                    </button>
                </div>

                {/* Address List */}
                <div className="space-y-3 md:space-y-6">
                    {savedAddresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-white dark:bg-[#141414] rounded-[18px] md:rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-green-100 dark:hover:border-white/10"
                        >
                            <div className="p-3 md:p-6">
                                <div className="flex justify-between items-start mb-2 md:mb-4">
                                    <div className="flex items-center gap-3 md:gap-5">
                                        <div className="w-8 h-8 md:w-14 md:h-14 bg-[#eefaf1] dark:bg-white/5 rounded-lg md:rounded-2xl flex items-center justify-center text-[#0c831f]">
                                            <MapPin size={16} className="md:w-7 md:h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <h3 className="!text-[12px] md:!text-xl font-black text-gray-900 dark:text-gray-100">{addr.type}</h3>
                                                {addr.isDefault && (
                                                    <span className="px-1.5 py-0.5 md:px-2.5 md:py-1 bg-blue-50 text-blue-600 !text-[7px] md:!text-[10px] font-black uppercase rounded-lg">Default</span>
                                                )}
                                            </div>
                                            <p className="!text-[9px] md:!text-sm text-gray-500 font-medium mt-0.5">{addr.name || 'Synced with Account'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 md:gap-2">
                                        <button
                                            onClick={() => handleEdit(addr.id)}
                                            className="p-1.5 md:p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg active:scale-90 transition-all hover:text-[#0c831f]"
                                        >
                                            <Edit2 size={13} className="md:w-5 md:h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-1.5 md:p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg active:scale-90 transition-all"
                                        >
                                            <Trash2 size={13} className="md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="pl-9 ml-2 md:pl-[68px] md:ml-0">
                                    <p className="!text-[10px] md:!text-lg text-gray-700 dark:text-gray-300 font-bold leading-snug">{addr.address}</p>
                                    <p className="!text-[8px] md:!text-sm text-gray-400 font-medium mt-0.5 md:mt-1">{addr.city}</p>
                                </div>
                            </div>

                            {/* Recent Order Meta at this Address */}
                            <div className="bg-gray-50 dark:bg-white/5 px-3 py-2 md:px-6 md:py-3 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <ShoppingBag size={11} className="text-gray-400 md:w-4 md:h-4" />
                                    <span className="!text-[8px] md:!text-xs text-gray-500 font-bold uppercase tracking-tight">Last order: <span className="text-gray-700 dark:text-gray-300">{addr.lastOrder?.date || 'None'}</span></span>
                                </div>
                                <span className="!text-[9px] md:!text-sm text-[#0c831f] font-black">{addr.lastOrder?.total || '₹0'}</span>
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
