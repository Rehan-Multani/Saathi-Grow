import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Wallet,
    History,
    User,
    LogOut,
    Bell,
    Check,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from './NotificationProvider';

const DeliveryLayout = ({ children }) => {
    const navigate = useNavigate();
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications
    } = useNotifications();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationPanelRef = useRef(null);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications]
    );

    useEffect(() => {
        if (!isNotificationOpen) return;

        const handleClickOutside = (event) => {
            if (!notificationPanelRef.current?.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isNotificationOpen]);

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        setIsNotificationOpen(false);
        if (notification.id) {
            navigate(`/delivery/tracking/${notification.id}`);
            return;
        }
        navigate('/delivery/orders');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/delivery/dashboard' },
        { icon: <Package size={20} />, label: 'Orders', path: '/delivery/orders' },
        { icon: <Wallet size={20} />, label: 'Wallet', path: '/delivery/wallet' },
        { icon: <History size={20} />, label: 'History', path: '/delivery/history' },
        { icon: <User size={20} />, label: 'Profile', path: '/delivery/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 z-40 md:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-white font-bold">S</div>
                    <span className="font-bold text-lg tracking-tight">Saathi<span className="text-pink-600">Grow</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNotificationOpen((prev) => !prev)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 relative"
                        aria-label="Open notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                                {Math.min(unreadCount, 9)}
                            </span>
                        )}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden border border-slate-200 dark:border-zinc-700">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                    </div>
                </div>
            </header>

            {isNotificationOpen && (
                <div ref={notificationPanelRef} className="fixed top-16 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold">Notifications</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={markAllAsRead}
                                disabled={notifications.length === 0}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                                title="Mark all as read"
                                aria-label="Mark all as read"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={clearNotifications}
                                disabled={notifications.length === 0}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                                title="Clear all notifications"
                                aria-label="Clear all notifications"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 && (
                            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                                No notifications yet.
                            </div>
                        )}

                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 border-b border-slate-100 dark:border-zinc-800/80 flex items-start gap-3 ${notification.read ? 'bg-transparent' : 'bg-pink-50/60 dark:bg-pink-500/10'}`}
                            >
                                <button
                                    onClick={() => handleNotificationClick(notification)}
                                    className="flex-1 text-left min-w-0"
                                >
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                        New Order Assigned
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-zinc-300 truncate mt-0.5">
                                        #{notification.orderId || 'N/A'} - {notification.customerName || 'Customer'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {notification.time || 'Just now'}
                                    </p>
                                </button>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                    aria-label="Dismiss notification"
                                    title="Dismiss"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 hidden md:flex flex-col z-40">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/20">S</div>
                        <span className="font-bold text-xl tracking-tight">Saathi<span className="text-pink-600 font-black">Grow</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-md shadow-pink-500/20 font-medium'
                                    : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}
                            `}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
                    <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full border-2 border-pink-500 p-0.5">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full rounded-full" alt="profile" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Rahul Kumar</h4>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">Rider #SG-R23</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                Online
                            </div>
                        </div>
                    </div>
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-16 md:pt-0 md:pl-64 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-18 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around px-2 z-40 md:hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-1 transition-all duration-200
                            ${isActive ? 'text-pink-600' : 'text-slate-400 dark:text-zinc-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-2 rounded-xl ${isActive ? 'bg-pink-50 dark:bg-pink-500/10' : ''}`}
                                >
                                    {React.cloneElement(item.icon, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
                                </motion.div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default DeliveryLayout;
