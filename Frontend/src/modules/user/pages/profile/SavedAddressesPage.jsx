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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-black transition-colors duration-300 pb-24 md:p-8 md:pb-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto md:px-0">
                {/* Header - Sticky & Focused */}
                <div className="flex items-center justify-between mb-2 md:mb-10 px-4 py-8 md:p-0 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-100 dark:border-white/5 md:border-none sticky top-0 z-50 md:relative transition-colors">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const from = location.state?.from || '/';
                                const noMenuPages = ['/settings', '/profile'];
                                const shouldOpenMenu = !noMenuPages.includes(from);
                                navigate(from, { state: { openMenu: shouldOpenMenu } });
                            }}
                            className="p-2 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400 md:w-6 md:h-6" />
                        </button>
                        <h1 className="text-[17px] md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Saved Addresses</h1>
                    </div>
                    <button
                        onClick={() => navigate('/add-address')}
                        className="flex items-center gap-1.5 bg-[#0c831f] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-lg text-[10px] md:text-sm font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all hover:bg-[#0a6b19]"
                    >
                        <Plus size={14} strokeWidth={3} className="md:w-5 md:h-5" /> Add New
                    </button>
                </div>

                {/* Address List */}
                <div className="p-4 md:p-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 space-y-4 md:space-y-0">
                    {savedAddresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-white dark:bg-[#1c1c1c] md:dark:bg-[#141414] rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm md:shadow-sm overflow-hidden transition-all hover:bg-gray-50/50 dark:hover:bg-white/5 md:hover:shadow-md md:hover:border-green-100 dark:md:hover:border-white/10 flex flex-col justify-between"
                        >
                            <div className="p-4 md:p-6">
                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                    <div className="flex items-center gap-3 md:gap-5">
                                        <div className="w-10 h-10 md:w-14 md:h-14 bg-green-50/50 dark:bg-green-500/10 border border-green-100/50 dark:border-green-900/20 rounded-xl md:rounded-2xl flex items-center justify-center text-[var(--saathi-green)] shadow-sm md:shadow-none">
                                            <MapPin size={18} className="md:w-7 md:h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <h3 className="text-[14px] md:text-xl font-black text-gray-900 dark:text-gray-100">{addr.type}</h3>
                                                {addr.isDefault && (
                                                    <span className="px-1.5 py-0.5 md:px-2.5 md:py-1 bg-green-50 dark:bg-green-500/10 text-[var(--saathi-green)] dark:text-green-400 text-[8px] md:text-[10px] font-black uppercase rounded-md border border-green-100 dark:border-green-500/20">Default</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] md:text-sm text-gray-500 font-medium mt-0.5">{addr.name || 'Synced with Account'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 md:gap-2">
                                        <button
                                            onClick={() => handleEdit(addr.id)}
                                            className="p-2 md:p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full md:rounded-lg active:scale-90 transition-all hover:text-[#0c831f]"
                                        >
                                            <Edit2 size={16} className="md:w-5 md:h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-2 md:p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full md:rounded-lg active:scale-90 transition-all"
                                        >
                                            <Trash2 size={16} className="md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="pl-1 md:pl-[68px]">
                                    <p className="text-[12px] md:text-lg text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{addr.address}</p>
                                    <p className="text-[11px] md:text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider">{addr.city}</p>
                                </div>
                            </div>

                            {/* Recent Order Meta at this Address */}
                            <div className="bg-gray-50/50 dark:bg-white/5 px-4 py-3 md:px-6 md:py-3 flex items-center justify-between border-t border-gray-100/10 dark:border-white/5 mt-auto">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <ShoppingBag size={14} className="text-gray-400 md:w-5 md:h-5" />
                                    <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-tight">Last order: <span className="text-gray-700 dark:text-gray-300">{addr.lastOrder?.date || 'None'}</span></span>
                                </div>
                                <span className="text-[11px] md:text-sm text-[#0c831f] font-black">{addr.lastOrder?.total || '₹0'}</span>
                            </div>
                        </div>
                    ))}

                    {/* Add New Address Card - Visible on Mobile and Desktop */}
                    {savedAddresses.length > 0 && (
                        <button
                            onClick={() => navigate('/add-address')}
                            className="bg-white dark:bg-[#1c1c1c] md:bg-gray-50 dark:md:bg-[#141414]/50 border-dashed border-2 border-gray-100 dark:border-white/10 rounded-2xl md:rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-[#0c831f] hover:border-[#0c831f] hover:bg-green-50/50 dark:hover:bg-[#0c831f]/10 transition-all min-h-[120px] md:min-h-[200px] group shadow-sm md:shadow-none"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-1 group-hover:bg-[#0c831f]/20 group-hover:scale-110 transition-all">
                                <Plus size={20} className="md:w-6 md:h-6 group-hover:text-[#0c831f]" />
                            </div>
                            <span className="font-bold text-[12px] md:text-sm tracking-tight text-gray-500 group-hover:text-[#0c831f]">Add New Address</span>
                        </button>
                    )}
                </div>

                {/* Empty State Help */}
                {savedAddresses.length === 0 && (
                    <div className="text-center py-20 md:py-32">
                        <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8">
                            <MapPin size={40} className="text-gray-300 md:w-16 md:h-16" />
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100">No saved addresses</h2>
                        <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-10 max-w-md mx-auto">Add an address to start ordering essentials faster!</p>
                        <button
                            onClick={() => navigate('/add-address')}
                            className="bg-[#0c831f] text-white px-6 py-2 md:px-10 md:py-4 rounded-lg md:rounded-xl !text-[10px] md:!text-sm font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all hover:bg-[#0a6b19]"
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
