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
        <div className="min-h-screen bg-transparent dark:bg-black p-4 pt-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const shouldOpenMenu = from !== '/settings';
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 bg-gray-50 dark:bg-[#141414] rounded-full"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight">My Profile</h1>
                </div>

                {/* Profile Section - Integrated */}
                <div className="mb-8">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                            <div className="w-20 h-20 bg-[#eefaf1] dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-white/5 overflow-hidden shadow-sm">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={30} className="text-[#0c831f]" />
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
                                className="absolute -bottom-1 -right-1 p-1.5 bg-[#0c831f] text-white rounded-lg shadow-lg border-2 border-white dark:border-[#141414] active:scale-95 transition-transform"
                            >
                                <Camera size={12} />
                            </button>
                        </div>
                        <h2 className="!text-[16px] font-black text-gray-900 dark:text-gray-100">{user?.displayName || "Saathi Member"}</h2>
                        <p className="!text-[10px] text-gray-400 font-bold tracking-widest mt-0.5">{user?.email || "member@saathigro.com"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-y border-gray-50 dark:border-white/5">
                        <div className="text-center">
                            <p className="!text-[12px] font-black text-gray-900 dark:text-gray-100">0</p>
                            <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="!text-[12px] font-black text-gray-900 dark:text-gray-100">₹0</p>
                            <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Savings</p>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="space-y-1 mb-6">
                    <h3 className="!text-[8px] font-bold text-gray-400 px-2 mb-2 tracking-widest">My Information</h3>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {sections.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(item.path, { state: { from: '/profile' } })}
                                className="w-full py-4 px-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg flex items-center justify-center text-[#0c831f] shadow-sm">
                                        <item.icon size={16} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 leading-none mb-0.5">{item.label}</h4>
                                        <p className="!text-[8.5px] text-gray-400 font-medium">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#0c831f] transition-colors" />
                            </button>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => navigate('/logout-confirmation')}
                        className="w-full py-4 px-2 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group mt-2 border-t border-gray-100 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/10 rounded-lg flex items-center justify-center text-red-500 shadow-sm">
                                <LogOut size={16} />
                            </div>
                            <div className="text-left">
                                <h4 className="!text-[11px] font-black text-red-600 dark:text-red-400 leading-none mb-0.5">Log Out</h4>
                                <p className="!text-[8.5px] text-red-400/70 font-medium">Sign out of your account</p>
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-red-200 group-hover:text-red-500 transition-colors" />
                    </button>
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
