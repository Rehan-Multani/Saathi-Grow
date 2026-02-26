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
    Trash2,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from './NotificationProvider';

const OPEN_ORDER_EVENT = 'delivery:open-order';

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
        if (notification.order) {
            window.dispatchEvent(new CustomEvent(OPEN_ORDER_EVENT, { detail: notification.order }));
            navigate('/delivery/dashboard');
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
            <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between px-4 z-40 md:hidden shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform active:scale-95">S</div>
                    <span className="font-bold text-base tracking-tight text-slate-800 dark:text-slate-100">sathiGro</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNotificationOpen((prev) => !prev)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 relative transition-all active:scale-90"
                        aria-label="Open notifications"
                    >
                        <Bell size={18} className="text-slate-600 dark:text-zinc-400" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-lime-600 text-[7px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden border border-slate-100 dark:border-zinc-700 shadow-sm">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover" alt="avatar" />
                    </div>
                </div>
            </header>

            {isNotificationOpen && (
                <div ref={notificationPanelRef} className="fixed top-14 right-3 z-50 w-[min(320px,calc(100vw-1.5rem))] rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl xl:shadow-lime-500/5 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-zinc-100">Notifications</h3>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={markAllAsRead}
                                disabled={notifications.length === 0}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-lime-600 hover:bg-lime-50 dark:hover:bg-lime-500/10 transition-all disabled:opacity-40"
                                title="Mark all as read"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={clearNotifications}
                                disabled={notifications.length === 0}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40"
                                title="Clear all notifications"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Clear for now</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-slate-50 dark:border-zinc-800/40 flex items-start gap-3 transition-colors ${notification.read ? 'bg-transparent' : 'bg-lime-50/40 dark:bg-lime-500/5'}`}
                                >
                                    <button
                                        onClick={() => handleNotificationClick(notification)}
                                        className="flex-1 text-left min-w-0"
                                    >
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-[11px] font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight">New Order</p>
                                            <p className="text-[9px] text-slate-400 font-medium">{notification.time || 'Just now'}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                                            #{notification.orderId || 'N/A'} â€¢ {notification.customerName || 'Customer'}
                                        </p>
                                    </button>
                                    {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-lime-500 mt-1.5"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-zinc-900 border-r border-slate-200/60 dark:border-zinc-800/60 hidden md:flex flex-col z-40 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
                <div className="p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-lime-500/10">S</div>
                        <span className="font-black text-lg tracking-tight text-slate-800 dark:text-zinc-100">sathiGro</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-2 space-y-0.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group
                                ${isActive
                                    ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-lg shadow-lime-500/15 font-bold'
                                    : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-800 dark:hover:text-zinc-100'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
                                        {isActive ? React.cloneElement(item.icon, { size: 18, strokeWidth: 2.5 }) : React.cloneElement(item.icon, { size: 18, strokeWidth: 2 })}
                                    </div>
                                    <span className="text-[13px] tracking-tight">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-zinc-800/50">
                    <div className="bg-slate-50/80 dark:bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-3 mb-3 border border-slate-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-700 shadow-sm overflow-hidden bg-white">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover" alt="profile" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-zinc-800"></div>
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-[12px] text-slate-800 dark:text-zinc-100 truncate">Rahul Kumar</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SG-R23</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-green-600">Active</span>
                            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-lg text-[9px] font-black">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                                ONLINE
                            </div>
                        </div>
                    </div>
                    <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all font-medium text-xs group">
                        <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-14 md:pt-0 md:pl-60 min-h-screen">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-around px-2 z-40 md:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-0.5 transition-all duration-300 relative px-2 py-0.5
                            ${isActive ? 'text-lime-600 dark:text-lime-500' : 'text-slate-400 dark:text-zinc-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-lime-500/10 shadow-inner' : ''}`}
                                >
                                    {React.cloneElement(item.icon, { size: 20, strokeWidth: isActive ? 2.5 : 2 })}
                                </motion.div>
                                <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-0.5 max-h-0'}`}>
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

