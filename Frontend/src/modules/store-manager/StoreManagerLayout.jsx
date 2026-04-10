import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import StoreManagerSidebar from './components/StoreManagerSidebar';
import { Menu, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import FirebaseNotificationHandler from '../../common/components/FirebaseNotificationHandler';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const StoreManagerLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { managerUser, managerLogout } = useStoreManagerAuth();
    const managerToken = managerUser?.token;
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            if (!managerToken) return;
            const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${managerToken}` }
            });
            if (res.data.success) {
                setUnreadCount(res.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [managerToken]);

    const handleLogout = () => {
        managerLogout();
        navigate('/store-manager/login');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'System Metrics';
        if (path.includes('inventory')) return 'Resource Catalog';
        if (path.includes('returns')) return 'QC Terminal';
        if (path.includes('reports')) return 'Strategic Intel';
        return 'Control Center';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-blue-100 selection:text-blue-900 manager-portal-root animate-page-entry">
            <FirebaseNotificationHandler token={managerToken} role="store-manager" />
            <StoreManagerSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px] w-full transition-all duration-300">
                {/* Professional Fixed Glass Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-all active:scale-95"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-sm lg:text-base font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">{getPageTitle()}</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.05em] leading-none">Store Management Portal</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-5">
                        {/* Notifications */}
                        <button 
                            onClick={() => navigate('/store-manager/notifications')}
                            className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/80 hover:text-blue-600 transition-all active:scale-95 group"
                        >
                            <Bell size={20} className="group-hover:animate-bounce" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-all active:scale-95 border border-transparent hover:border-slate-200"
                            >
                                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-xs uppercase shadow-md shadow-blue-200 overflow-hidden ring-2 ring-white">
                                    {managerUser?.profileImage ? (
                                        <img src={managerUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        (managerUser?.name || 'M').charAt(0)
                                    )}
                                </div>
                                <div className="text-left hidden md:block">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-extrabold text-slate-800">{managerUser?.name || 'Manager'}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Admin Access</p>
                                </div>
                            </button>

                            {showProfileMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-200/60 z-50 py-2.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-4 py-3 border-b border-slate-50 mb-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Connected Session</p>
                                            <p className="text-xs font-bold text-slate-900 truncate">{managerUser?.email || 'manager@saathigro.corp'}</p>
                                        </div>
                                        <div className="px-1.5 space-y-0.5">
                                            <button
                                                onClick={() => { navigate('/store-manager/profile'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group"
                                            >
                                                <div className="p-1.5 bg-slate-50 rounded-lg mr-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <User size={14} />
                                                </div>
                                                Profile Command Center
                                            </button>
                                            <button
                                                onClick={() => { navigate('/store-manager/settings'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group"
                                            >
                                                <div className="p-1.5 bg-slate-50 rounded-lg mr-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <Settings size={14} />
                                                </div>
                                                System Preferences
                                            </button>
                                            <div className="my-1.5 border-t border-slate-50 mx-2"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-3 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                                            >
                                                <div className="p-1.5 bg-rose-50 rounded-lg mr-3 text-rose-500 transition-colors">
                                                    <LogOut size={14} />
                                                </div>
                                                Terminate Session
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 border-t border-slate-200 bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-400 font-medium">
                            © 2026 sathiGro Store Management System
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Status: Operational
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default StoreManagerLayout;
