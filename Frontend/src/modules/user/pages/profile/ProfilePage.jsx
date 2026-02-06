import React from 'react';
import { User, Mail, Phone, MapPin, Camera, ArrowLeft, ChevronRight, ShoppingBag, CreditCard, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();
    const fileInputRef = React.useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ photoURL: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const sections = [
        { icon: ShoppingBag, label: "My Orders", subtitle: "Track and manage your orders", path: "/orders" },
        { icon: MapPin, label: "Saved Addresses", subtitle: "Manage your delivery locations", path: "/saved-addresses" },
        { icon: CreditCard, label: "SaathiGro Wallet", subtitle: "₹0.00 Balance available", path: "/wallet" }
    ];

    return (
        <div className="min-h-screen bg-transparent dark:bg-black p-4 pt-6 md:p-8">
            <div className="max-w-2xl md:max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8 md:mb-10">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const shouldOpenMenu = from !== '/settings';
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 md:p-2 bg-gray-50 dark:bg-[#141414] rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <h1 className="!text-[13px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">My Profile</h1>
                </div>

                {/* Profile Section - Integrated */}
                <div className="mb-8 md:mb-12">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3 md:mb-5">
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-[#eefaf1] dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-white/5 overflow-hidden shadow-sm">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={30} className="text-[#0c831f] md:w-12 md:h-12" />
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute -bottom-1 -right-1 p-1.5 md:p-2.5 bg-[#0c831f] text-white rounded-lg shadow-lg border-2 border-white dark:border-[#141414] active:scale-95 transition-transform hover:bg-[#0a6b19]"
                            >
                                <Camera size={12} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                        <h2 className="!text-[16px] md:!text-2xl font-black text-gray-900 dark:text-gray-100">{user?.displayName || "Saathi Member"}</h2>
                        <p className="!text-[10px] md:!text-sm text-gray-400 font-bold tracking-widest mt-0.5 md:mt-1">{user?.email || "member@saathigro.com"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 md:mt-10 py-6 md:py-8 border-y border-gray-50 dark:border-white/5 max-w-lg mx-auto">
                        <div className="text-center">
                            <p className="!text-[12px] md:!text-2xl font-black text-gray-900 dark:text-gray-100">0</p>
                            <p className="!text-[8px] md:!text-xs text-gray-400 font-bold uppercase tracking-tighter md:tracking-widest">Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="!text-[12px] md:!text-2xl font-black text-gray-900 dark:text-gray-100">₹0</p>
                            <p className="!text-[8px] md:!text-xs text-gray-400 font-bold uppercase tracking-tighter md:tracking-widest">Savings</p>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="space-y-1 mb-6 md:mb-10 max-w-3xl mx-auto">
                    <h3 className="!text-[8px] md:!text-xs font-bold text-gray-400 px-2 mb-2 tracking-widest uppercase">My Information</h3>
                    <div className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#141414] rounded-2xl border border-gray-50 dark:border-white/5 overflow-hidden">
                        {sections.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(item.path, { state: { from: '/profile' } })}
                                className="w-full py-4 px-4 md:py-6 md:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-8 h-8 md:w-12 md:h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg md:rounded-xl flex items-center justify-center text-[#0c831f] shadow-sm group-hover:bg-[#eefaf1] transition-colors">
                                        <item.icon size={16} className="md:w-6 md:h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="!text-[11px] md:!text-lg font-black text-gray-800 dark:text-gray-100 leading-none mb-0.5 md:mb-1.5">{item.label}</h4>
                                        <p className="!text-[8.5px] md:!text-sm text-gray-400 font-medium">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#0c831f] transition-colors md:w-5 md:h-5" />
                            </button>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => navigate('/logout-confirmation')}
                        className="w-full py-4 px-4 md:py-6 md:px-6 flex items-center justify-between bg-white dark:bg-[#141414] hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group mt-4 rounded-2xl border border-gray-50 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                                <LogOut size={16} className="md:w-6 md:h-6" />
                            </div>
                            <div className="text-left">
                                <h4 className="!text-[11px] md:!text-lg font-black text-red-600 dark:text-red-400 leading-none mb-0.5 md:mb-1.5">Log Out</h4>
                                <p className="!text-[8.5px] md:!text-sm text-red-400/70 font-medium">Sign out of your account</p>
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-red-200 group-hover:text-red-500 transition-colors md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Support Info */}
                <div className="bg-[#eefaf1] rounded-2xl p-4 md:p-6 border border-[#0c831f]/10 text-center max-w-3xl mx-auto">
                    <p className="text-[11px] md:text-base text-[#0c831f] font-bold">Become a Saathi Plus member to save more! 🚀</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
