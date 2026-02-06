import React, { useState } from 'react';
import { Settings, User, MapPin, Bell, Shield, Moon, Sun, ArrowLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const menuItems = [
        {
            id: 'profile',
            title: "Profile Information",
            subtitle: "Edit your name and email",
            icon: User,
            color: "bg-blue-50 text-blue-500",
            path: "/profile"
        },
        {
            id: 'address',
            title: "Saved Addresses",
            subtitle: "Manage your delivery locations",
            icon: MapPin,
            color: "bg-green-50 text-green-500",
            path: "/saved-addresses"
        },
        {
            id: 'security',
            title: "Security",
            subtitle: "Password and account security",
            icon: Shield,
            color: "bg-orange-50 text-orange-500",
            path: "/security"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8 p-4">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-1.5 bg-gray-50 dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Settings</h1>
                </div>

                {/* Account Section */}
                <div className="px-4 mb-8">
                    <h3 className="!text-[8px] font-bold text-gray-400 mb-2 px-2 tracking-widest uppercase">My Information</h3>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path, { state: { from: '/settings' } })}
                                className="w-full py-4 px-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm ${item.color.replace('bg-', 'bg-')}`}>
                                        <item.icon size={18} className="text-[#0c831f]" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 leading-none mb-0.5">{item.title}</h4>
                                        <p className="!text-[8.5px] text-gray-400 font-medium">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#0c831f] transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="px-4 mb-8">
                    <h3 className="!text-[8px] font-bold text-gray-400 mb-2 px-2 tracking-widest uppercase">App Preferences</h3>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {/* Theme Toggle */}
                        <div className="py-4 px-2 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10 border border-gray-100 dark:border-white/10 shadow-sm">
                                    {isDarkMode ? <Moon size={18} className="text-purple-600" /> : <Sun size={18} className="text-orange-500" />}
                                </div>
                                <div className="text-left">
                                    <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 leading-none mb-0.5">Dark Mode</h4>
                                    <p className="!text-[8.5px] text-gray-400 font-medium">Toggle app appearance</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-9 h-5 rounded-full transition-all relative ${isDarkMode ? 'bg-[#0c831f]' : 'bg-gray-200 dark:bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'left-[1.35rem]' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Notifications Toggle */}
                        <div className="py-4 px-2 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-50 dark:bg-pink-500/10 border border-gray-100 dark:border-white/10 shadow-sm">
                                    <Bell size={18} className="text-pink-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 leading-none mb-0.5">Push Notifications</h4>
                                    <p className="!text-[8.5px] text-gray-400 font-medium">Order updates and offers</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`w-9 h-5 rounded-full transition-all relative ${notificationsEnabled ? 'bg-[#0c831f]' : 'bg-gray-200 dark:bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-[1.35rem]' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                {user && (
                    <div className="px-6">
                        <button
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                            className="w-full py-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center gap-2 font-black !text-[11px] transition-all hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] uppercase tracking-widest"
                        >
                            <LogOut size={16} />
                            Sign Out Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
