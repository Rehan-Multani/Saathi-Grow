import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Wallet,
    LogOut,
    Bell,
    Check,
    Trash2,
    Shield,
    Activity,
    Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from './NotificationProvider';
import useDeliveryStore from '../../store/deliveryStore';

const OPEN_ORDER_EVENT = 'delivery:open-order';

const DeliveryLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isTrackingPage = location.pathname.includes('/tracking/');

    const {
        notifications,
        markAsRead,
        markAllAsRead,
        clearNotifications
    } = useNotifications();
    const profile = useDeliveryStore(state => state.profile);
    const logout = useDeliveryStore(state => state.logout);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const notificationPanelRef = useRef(null);

    // Bypass layout elements entirely for tracking pages
    if (isTrackingPage) {
        return <>{children}</>;
    }

    useEffect(() => {
        let timeoutId;
        const MIN_KEYBOARD_HEIGHT = 150;
        const initialHeight = window.innerHeight;

        const handleFocusIn = (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                clearTimeout(timeoutId);
                setIsKeyboardOpen(true);
            }
        };

        const handleFocusOut = () => {
            timeoutId = setTimeout(() => {
                setIsKeyboardOpen(false);
            }, 100);
        };

        const handleResize = () => {
            const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            if (initialHeight - currentHeight > MIN_KEYBOARD_HEIGHT) {
                clearTimeout(timeoutId);
                setIsKeyboardOpen(true);
            } else if (currentHeight >= initialHeight - MIN_KEYBOARD_HEIGHT) {
                setIsKeyboardOpen(false);
            }
        };

        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        window.addEventListener('resize', handleResize);
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            window.removeEventListener('resize', handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

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
        { icon: <LayoutDashboard size={20} />, label: 'Tactical Hub', path: '/delivery/dashboard' },
        { icon: <Package size={20} />, label: 'Missions', path: '/delivery/orders' },
        { icon: <Wallet size={20} />, label: 'Cash Hub', path: '/delivery/wallet' },
        { icon: <Activity size={20} />, label: 'History', path: '/delivery/history' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 z-40 md:hidden shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">S</div>
                    <span className="font-black text-[13px] tracking-tighter text-slate-900 uppercase">SAATHI<span className="text-emerald-500">GRO</span></span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNotificationOpen((prev) => !prev)}
                        className="relative p-1.5 rounded-xl hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <Bell size={18} className="text-slate-400 group-hover:text-slate-900" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 text-[7px] font-black text-white rounded-lg flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <div 
                        onClick={() => navigate('/delivery/profile')}
                        className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer"
                    >
                        {profile?.profileImage ? (
                            <img src={profile.profileImage} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-white/90" />
                                    <div className="w-5 h-2.5 rounded-t-full bg-white/90 mt-0.5" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {isNotificationOpen && (
                <div ref={notificationPanelRef} className="fixed top-20 right-4 z-50 w-[320px] rounded-3xl border border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Comms</h3>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={markAllAsRead}
                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={clearNotifications}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">All units clear</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 rounded-2xl mb-1 cursor-pointer transition-all ${notification.read ? 'opacity-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="text-[10px] font-black text-slate-900 uppercase">{notification.title || 'New Mission'}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">{notification.time}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {notification.body ? notification.body : `#${notification.orderId?.slice(-6) || 'N/A'} - ${notification.customerName}`}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 hidden md:flex flex-col z-40">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-slate-200">S</div>
                        <span className="font-black text-xl tracking-tighter text-slate-900">SAATHI<span className="text-emerald-500">GRO</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all
                                ${isActive
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive ? React.cloneElement(item.icon, { size: 18, strokeWidth: 3 }) : React.cloneElement(item.icon, { size: 18, strokeWidth: 2.5 })}
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6">
                    <div className="bg-slate-50 rounded-[2rem] p-6 mb-4 border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-md overflow-hidden">
                                {profile?.profileImage ? (
                                    <img src={profile.profileImage} className="w-full h-full object-cover" alt="profile" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                        <div className="flex flex-col items-center justify-center gap-0.5">
                                            <div className="w-4 h-4 rounded-full bg-white/90" />
                                            <div className="w-6 h-3 rounded-t-full bg-white/90 mt-0.5" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-sm text-slate-900 truncate">{profile?.name || 'Rider'}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">#{profile?.uniqueId || 'DP-X'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${profile?.dutyStatus === 'Online' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${profile?.dutyStatus === 'Online' ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></div>
                                {profile?.dutyStatus || 'Offline'}
                            </span>
                            <button 
                                onClick={() => navigate('/delivery/profile')}
                                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/delivery/login');
                        }}
                        className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 transition-all"
                    >
                        <LogOut size={20} />
                        Logout Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-14 md:pt-0 md:pl-72 min-h-screen pb-24">
                <div className="p-3 md:p-8 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className={`fixed bottom-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-xl border-t border-slate-50 flex items-center justify-around px-2 z-[999] md:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 transform ${isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-0.5 transition-all
                            ${isActive ? 'text-slate-900' : 'text-slate-300'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : ''}`}>
                                    {React.cloneElement(item.icon, { size: 18 })}
                                </div>
                                <span className={`text-[7px] font-black uppercase tracking-widest transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.label.split(' ')[0]}
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
