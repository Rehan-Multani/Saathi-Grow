import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import StoreManagerSidebar from './components/StoreManagerSidebar';
import { Menu, Bell, User, Settings, LogOut, ChevronDown, Monitor, Clock, ShieldCheck, Activity } from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import FirebaseNotificationHandler from '../../common/components/FirebaseNotificationHandler';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';
import NewOrderPopup from '../admin/components/NewOrderPopup';

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

    const handleLogout = useCallback(() => {
        managerLogout();
        navigate('/store-manager/login');
    }, [managerLogout, navigate]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const message = error.response?.data?.message;
                if (error.response?.status === 403 && message === 'This branch has been deleted. Please contact admin.') {
                    Swal.fire({
                        title: 'Branch Deleted',
                        text: 'This branch has been deleted. Please contact admin.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3b82f6',
                        allowOutsideClick: false
                    }).then(() => {
                        handleLogout();
                    });
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [handleLogout]);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Overview';
        if (path.includes('inventory')) return 'Inventory';
        if (path.includes('returns')) return 'Returns';
        if (path.includes('reports')) return 'Reports & Analytics';
        if (path.includes('orders')) return 'Orders';
        if (path.includes('staff')) return 'Staff Management';
        if (path.includes('support')) return 'Support Tickets';
        if (path.includes('notifications')) return 'Notifications';
        if (path.includes('pos')) return 'Billing (POS)';
        if (path.includes('products')) return 'Products';
        if (path.includes('customers')) return 'Customers';
        if (path.includes('delivery/partners')) return 'Delivery Partners';
        if (path.includes('delivery/assign')) return 'Assign Deliveries';
        if (path.includes('delivery/tracking')) return 'Delivery Tracking';
        if (path.includes('profile')) return 'Branch Profile';
        if (path.includes('policies')) return 'Legal & Policies';
        if (path.includes('settings')) return 'Settings';
        return 'Manager Dashboard';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-blue-100 selection:text-blue-900 animate-in fade-in duration-500">
            <FirebaseNotificationHandler token={managerToken} role="store-manager" />
            <NewOrderPopup baseRoute="/store-manager/orders" />
            
            <StoreManagerSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px] w-full transition-all duration-300">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex p-2 bg-blue-50 rounded-xl text-blue-600">
                                <Monitor size={18} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">{getPageTitle()}</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Main Store</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button 
                            onClick={() => navigate('/store-manager/notifications')}
                            className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 group"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="h-4 w-px bg-slate-200"></div>

                        {/* Profile */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white text-xs uppercase shadow-sm border border-slate-800 overflow-hidden ring-2 ring-white ring-offset-1">
                                    {managerUser?.profileImage ? (
                                        <img src={managerUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        (managerUser?.name || 'M').charAt(0)
                                    )}
                                </div>
                                <div className="text-left hidden md:block pr-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-slate-800">{managerUser?.name || 'Manager'}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{managerUser?.role || 'Staff'}</p>
                                </div>
                            </button>

                            {showProfileMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 mb-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Account</p>
                                            <p className="text-xs font-bold text-slate-900 truncate">{managerUser?.email || 'manager@Saathigro.com'}</p>
                                        </div>
                                        <div className="p-1 space-y-0.5">
                                            <button
                                                onClick={() => { navigate('/store-manager/profile'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group"
                                            >
                                                <User size={16} className="mr-3 text-slate-400 group-hover:text-blue-600" />
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => { navigate('/store-manager/settings'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group"
                                            >
                                                <Settings size={16} className="mr-3 text-slate-400 group-hover:text-blue-600" />
                                                Settings
                                            </button>
                                            <div className="my-1 border-t border-slate-100"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                                            >
                                                <LogOut size={16} className="mr-3 text-red-400 group-hover:text-red-600" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="py-4 px-8 border-t border-slate-100 bg-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                System Online
                            </p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            © 2026 saathiGro • version 2.4.0
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default StoreManagerLayout;
