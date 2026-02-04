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
                <div className="flex items-center gap-2 p-3 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-[10px] z-10 border-b border-gray-50 dark:border-white/5">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">Settings</h1>
                </div>

                {/* Account Section */}
                <div className="p-3 pt-2">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-1">Account</h3>
                    <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        {menuItems.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${idx !== menuItems.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color.replace('bg-', 'bg-opacity-10 bg-')} dark:bg-white/5`}>
                                        <item.icon size={14} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-none mb-0.5 tracking-tight">{item.title}</h4>
                                        <p className="text-[8.5px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight size={12} className="text-gray-300" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="p-3 pt-0">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-1">Preferences</h3>
                    <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        {/* Theme Toggle */}
                        <div className="p-2.5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50 text-purple-500 bg-opacity-40 dark:bg-white/5">
                                    {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-none mb-0.5 tracking-tight">Dark Mode</h4>
                                    <p className="text-[8.5px] text-gray-400 dark:text-gray-500 font-medium">Toggle app appearance</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-8 h-4 rounded-full transition-all relative ${isDarkMode ? 'bg-[#0c831f]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'left-[1.125rem]' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Notifications Toggle */}
                        <div className="p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-pink-50 text-pink-500 bg-opacity-40 dark:bg-white/5">
                                    <Bell size={14} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-none mb-0.5 tracking-tight">Push Notifications</h4>
                                    <p className="text-[8.5px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">Order updates and offers</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`w-8 h-4 rounded-full transition-all relative ${notificationsEnabled ? 'bg-[#0c831f]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-[1.125rem]' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                {user && (
                    <div className="p-3 pt-1">
                        <button
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                            className="w-full p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center gap-2 font-black text-[11px] transition-all hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98]"
                        >
                            <LogOut size={14} />
                            Logout Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
