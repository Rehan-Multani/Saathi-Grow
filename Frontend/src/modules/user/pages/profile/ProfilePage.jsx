import React from 'react';
import { User, Mail, Phone, MapPin, Camera, ArrowLeft, ChevronRight, ShoppingBag, CreditCard, LogOut, Shield, Moon, Sun, Bell, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
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
        { icon: CreditCard, label: "SaathiGro Wallet", subtitle: "₹0.00 Balance available", path: "/wallet" },
        { icon: Shield, label: "Security", subtitle: "Password and account security", path: "/security" },
        { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and Customer Support", path: "/help" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-transparent p-0 md:p-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 md:p-0 mb-0 md:mb-10 bg-gradient-to-br from-[#f6fbf7] to-[#e8f5e9] md:bg-none border-b border-gray-50 md:border-none">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const shouldOpenMenu = from !== '/settings';
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full hover:bg-gray-100 transition-colors md:bg-gray-50"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <h1 className="!text-[16px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">My Profile</h1>
                </div>

                <div className="md:grid md:grid-cols-3 md:gap-8">
                    {/* Profile Section - Integrated */}
                    <div className="mb-0 md:bg-white dark:md:bg-[#141414] md:rounded-2xl md:border md:border-gray-100 dark:md:border-white/5 md:p-6 bg-transparent md:bg-gradient-to-b md:from-[#f6fbf7] md:to-white dark:md:from-black dark:md:to-black">
                        <div className="flex flex-col items-center pt-2 pb-6 md:py-0">
                            <div className="relative mb-3 md:mb-5">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#eefaf1] dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center border-4 border-white md:border-gray-50 dark:border-white/5 overflow-hidden shadow-sm">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={36} className="text-[#556b2f] md:w-12 md:h-12" />
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
                                    className="absolute -bottom-1 -right-1 p-2 md:p-2.5 bg-[#556b2f] text-white rounded-full md:rounded-lg shadow-lg border-2 border-white dark:border-[#141414] active:scale-95 transition-transform hover:bg-[#0a6b19]"
                                >
                                    <Camera size={14} className="md:w-5 md:h-5" />
                                </button>
                            </div>
                            <h2 className="!text-[20px] md:!text-2xl font-black text-gray-900 dark:text-gray-100">{user?.displayName || "Saathi Member"}</h2>
                            <p className="!text-[12px] md:!text-sm text-gray-400 font-bold tracking-widest mt-0.5 md:mt-1">{user?.email || "member@saathigro.com"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 md:py-8 border-y border-gray-100 dark:border-white/5 max-w-lg mx-auto md:max-w-none md:mx-0 bg-transparent md:bg-transparent">
                            <div className="text-center">
                                <p className="!text-[16px] md:!text-2xl font-black text-gray-900 dark:text-gray-100">0</p>
                                <p className="!text-[9px] md:!text-xs text-gray-400 font-bold uppercase tracking-widest">Orders</p>
                            </div>
                            <div className="text-center">
                                <p className="!text-[16px] md:!text-2xl font-black text-gray-900 dark:text-gray-100">₹0</p>
                                <p className="!text-[9px] md:!text-xs text-gray-400 font-bold uppercase tracking-widest">Savings</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Sections */}
                    <div className="md:col-span-2 bg-transparent md:bg-transparent">
                        <div className="space-y-0 md:space-y-1 mb-0 md:mb-10 max-w-none mx-auto md:mx-0">
                            <h3 className="!text-[10px] md:!text-xs font-bold text-gray-400 px-6 py-4 md:px-2 md:mb-2 tracking-widest uppercase bg-transparent md:bg-transparent border-t md:border-t-0 border-gray-100 dark:border-white/5">My Information</h3>
                            <div className="divide-y divide-gray-100 dark:divide-white/5 bg-transparent md:bg-white dark:md:bg-[#141414] md:rounded-2xl md:border md:border-gray-50 dark:md:border-white/5 overflow-hidden">
                                {sections.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(item.path, { state: { from: '/profile' } })}
                                        className="w-full py-5 px-6 md:py-6 md:px-6 flex items-center justify-between hover:bg-[#e8f5e9] md:hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="w-9 h-9 md:w-12 md:h-12 bg-gray-50/50 md:bg-white dark:bg-white/5 md:border border-gray-100 dark:border-white/10 rounded-full md:rounded-xl flex items-center justify-center text-[#556b2f] md:shadow-sm group-hover:bg-[#eefaf1] transition-colors">
                                                <item.icon size={18} className="md:w-6 md:h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="!text-[13px] md:!text-lg font-black text-gray-800 dark:text-gray-100 leading-none mb-1 md:mb-1.5">{item.label}</h4>
                                                <p className="!text-[10px] md:!text-sm text-gray-400 font-medium">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#556b2f] transition-colors md:w-5 md:h-5" />
                                    </button>
                                ))}
                            </div>

                            <h3 className="!text-[10px] md:!text-xs font-bold text-gray-400 px-6 py-4 md:px-2 md:mt-6 md:mb-2 tracking-widest uppercase bg-transparent md:bg-transparent border-t md:border-t-0 border-gray-100 dark:border-white/5">App Preferences</h3>
                            <div className="divide-y divide-gray-100 dark:divide-white/5 bg-transparent md:bg-white dark:md:bg-[#141414] md:rounded-2xl md:border border-gray-50 dark:md:border-white/5 overflow-hidden">
                                {/* Theme Toggle */}
                                <div className="py-5 px-6 md:py-6 md:px-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-9 h-9 md:w-12 md:h-12 bg-purple-50 dark:bg-purple-500/10 md:border border-gray-100 dark:border-white/10 rounded-full md:rounded-xl flex items-center justify-center md:shadow-sm">
                                            {isDarkMode ? <Moon size={18} className="text-purple-600 md:w-6 md:h-6" /> : <Sun size={18} className="text-orange-500 md:w-6 md:h-6" />}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="!text-[13px] md:!text-lg font-black text-gray-800 dark:text-gray-100 leading-none mb-1 md:mb-1.5">Dark Mode</h4>
                                            <p className="!text-[10px] md:!text-sm text-gray-400 font-medium">Toggle app appearance</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`w-10 h-6 md:w-12 md:h-7 rounded-full transition-all relative ${isDarkMode ? 'bg-[#556b2f]' : 'bg-gray-200 dark:bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all ${isDarkMode ? 'left-[1.35rem] md:left-[1.6rem]' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Notifications Toggle */}
                                <div className="py-5 px-6 md:py-6 md:px-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-9 h-9 md:w-12 md:h-12 bg-pink-50 dark:bg-pink-500/10 md:border border-gray-100 dark:border-white/10 rounded-full md:rounded-xl flex items-center justify-center md:shadow-sm">
                                            <Bell size={18} className="text-pink-600 md:w-6 md:h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="!text-[13px] md:!text-lg font-black text-gray-800 dark:text-gray-100 leading-none mb-1 md:mb-1.5">Notifications</h4>
                                            <p className="!text-[10px] md:!text-sm text-gray-400 font-medium">Order updates and offers</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                        className={`w-10 h-6 md:w-12 md:h-7 rounded-full transition-all relative ${notificationsEnabled ? 'bg-[#556b2f]' : 'bg-gray-200 dark:bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-[1.35rem] md:left-[1.6rem]' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={() => navigate('/logout-confirmation')}
                                className="w-full py-5 px-6 md:py-6 md:px-6 flex items-center justify-between bg-transparent md:bg-white dark:md:bg-[#141414] hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group border-t border-gray-100 dark:border-white/5 md:mt-4 md:rounded-2xl md:border"
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-9 h-9 md:w-12 md:h-12 bg-red-50 dark:bg-red-900/20 md:border border-red-100 dark:border-red-500/10 rounded-full md:rounded-xl flex items-center justify-center text-red-500 md:shadow-sm">
                                        <LogOut size={18} className="md:w-6 md:h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="!text-[13px] md:!text-lg font-black text-red-600 dark:text-red-400 leading-none mb-1 md:mb-1.5">Log Out</h4>
                                        <p className="!text-[10px] md:!text-sm text-red-400/70 font-medium">Sign out of your account</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-red-200 group-hover:text-red-500 transition-colors md:w-5 md:h-5" />
                            </button>
                        </div>

                        {/* Support Info */}
                        <div className="bg-gray-50 md:bg-[#eefaf1] md:rounded-2xl p-6 md:p-6 md:border border-[#0c831f]/10 text-center max-w-none mx-auto md:max-w-none md:mx-0">
                            <p className="text-[10px] md:text-base text-gray-400 md:text-[#0c831f] font-bold">SaathiGro App v1.0.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
