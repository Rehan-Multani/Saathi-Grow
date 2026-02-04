import React from 'react';
import { User, Mail, Phone, MapPin, Camera, ArrowLeft, ChevronRight, ShoppingBag, Heart, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const sections = [
        { icon: ShoppingBag, label: "My Orders", subtitle: "Track and manage your orders", path: "/orders" },
        { icon: Heart, label: "My Wishlist", subtitle: "Items you've saved for later", path: "/wishlist" },
        { icon: MapPin, label: "Saved Addresses", subtitle: "Manage your delivery locations", path: "/saved-addresses" },
        { icon: CreditCard, label: "SaathiGro Wallet", subtitle: "₹0.00 Balance available", path: "/wallet" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-2 bg-white dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">My Profile</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-[#141414] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm mb-8">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 bg-[#eefaf1] rounded-[24px] flex items-center justify-center border-4 border-white dark:border-[#141414] overflow-hidden shadow-lg">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-[#0c831f]" />
                                )}
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-2 bg-[#0c831f] text-white rounded-xl shadow-lg border-2 border-white dark:border-[#141414] active:scale-95 transition-transform">
                                <Camera size={14} />
                            </button>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{user?.displayName || "Saathi Member"}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{user?.email || "member@saathigro.com"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-white/5">
                        <div className="text-center">
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100">0</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100">₹0</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Savings</p>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">My Information</h3>
                    <div className="bg-white dark:bg-[#141414] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        {sections.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(item.path)}
                                className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${idx !== sections.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#eefaf1] dark:bg-white/5 rounded-xl flex items-center justify-center text-[#0c831f]">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none mb-1">{item.label}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-300" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Support Info */}
                <div className="bg-[#eefaf1] rounded-2xl p-4 border border-[#0c831f]/10 text-center">
                    <p className="text-[11px] text-[#0c831f] font-bold">Become a Saathi Plus member to save more! 🚀</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
