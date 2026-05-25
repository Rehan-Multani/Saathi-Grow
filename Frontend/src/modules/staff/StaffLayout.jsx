import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import { Bell, Menu, User, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import { staffSidebarMenu } from './data/staffSidebarMenu';
import { useStaffAuth } from './context/StaffAuthContext';
import FirebaseNotificationHandler from '../../common/components/FirebaseNotificationHandler';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const StaffLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const { staffUser, staffLogout } = useStaffAuth();
    const staffToken = staffUser?.token;

    const fetchNotifications = async () => {
        try {
            if (!staffToken) return;
            const res = await axios.get(`${API_BASE_URL}/notifications/my?limit=3`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            if (res.data.success) setRecentNotifications(res.data.notifications);
            const countRes = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            if (countRes.data.success) setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        
        const handleFirebaseMessage = (e) => {
            fetchNotifications(); // Instant refresh when a push arrives
        };
        window.addEventListener('onFirebaseMessage', handleFirebaseMessage);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('onFirebaseMessage', handleFirebaseMessage);
        };
    }, [staffToken]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/read/${id}`, {}, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getCurrentTitle = () => {
        for (const item of staffSidebarMenu) {
            if (item.path === location.pathname) return item.title;
            if (item.submenu) {
                const subItem = item.submenu.find(sub => sub.path === location.pathname);
                if (subItem) return subItem.title;
            }
        }
        return 'Overview';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-blue-100 selection:text-blue-900 staff-portal-root overflow-x-hidden">
            <FirebaseNotificationHandler token={staffToken} role="staff" showToast={true} />
            
            <StaffSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 lg:ml-[260px] w-full`}>
                <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm shadow-slate-200/50">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-6 bg-blue-600 rounded-full hidden sm:block"></div>
                             <h5 className="mb-0 font-black text-slate-900 uppercase tracking-tighter text-base sm:text-lg">{getCurrentTitle()}</h5>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                                className={`relative p-2.5 rounded-xl border transition-all duration-300 ${showNotificationMenu ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white font-black animate-bounce shadow-sm">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotificationMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)}></div>
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                                            <h6 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em] mb-0">Updates</h6>
                                            {unreadCount > 0 && <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest">{unreadCount} New</span>}
                                        </div>
                                        <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                                            {recentNotifications.length > 0 ? (
                                                recentNotifications.map(notif => (
                                                    <div 
                                                        key={notif._id} 
                                                        onClick={() => { handleMarkAsRead(notif._id); setShowNotificationMenu(false); }}
                                                        className={`p-5 hover:bg-slate-50 transition-all cursor-pointer relative group ${!notif.isRead ? 'bg-blue-50/20' : ''}`}
                                                    >
                                                        <div className="flex gap-4">
                                                            <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 transition-all ${!notif.isRead ? 'bg-blue-600 scale-125' : 'bg-slate-200 opacity-0 group-hover:opacity-100'}`}></div>
                                                            <div className="space-y-1">
                                                                <p className="text-[12px] font-black text-slate-900 leading-tight line-clamp-1">{notif.title}</p>
                                                                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{notif.body}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter pt-1">{new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 px-8 text-center">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                        <CheckCircle2 size={24} className="text-slate-200" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Everything read</p>
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => { navigate('/staff/notifications'); setShowNotificationMenu(false); }}
                                            className="w-full p-4 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all border-t border-slate-100 group"
                                        >
                                            View Archive <ChevronRight size={14} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className={`flex items-center gap-3 p-1 rounded-2xl transition-all duration-300 group border ${showProfileMenu ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-white border-transparent hover:bg-slate-50'}`}
                            >
                                <div className="text-right hidden md:block pl-2">
                                    <div className={`font-black text-[11px] uppercase tracking-tighter leading-none transition-colors ${showProfileMenu ? 'text-white' : 'text-slate-900'}`}>{staffUser?.name || 'Staff'}</div>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-1 transition-colors ${showProfileMenu ? 'text-slate-400' : 'text-slate-400'}`}>{staffUser?.role || 'Associate'}</div>
                                </div>
                                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center font-black text-xs text-white border border-white/10 shadow-lg overflow-hidden shrink-0 group-hover:scale-95 transition-transform">
                                    {staffUser?.profileImage ? (
                                        <img src={staffUser.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (staffUser?.name || 'S').charAt(0).toUpperCase()
                                    )}
                                </div>
                            </button>

                            {showProfileMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
                                        <div className="px-4 py-2 mb-1 text-left">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Center</p>
                                        </div>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => { navigate('/staff/profile'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group/item text-left"
                                            >
                                                <User size={16} className="mr-3 text-slate-400 group-hover/item:text-blue-500" /> My Account
                                            </button>
                                            <div className="border-t border-slate-50 my-1 mx-2 text-left"></div>
                                            <button
                                                onClick={staffLogout}
                                                className="w-full flex items-center px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all group/item text-left"
                                            >
                                                <LogOut size={16} className="mr-3 opacity-50 group-hover/item:opacity-100" /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-x-hidden relative">
                    {/* Page Content Entry Animation Wrapper */}
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                        <Outlet />
                    </div>
                </main>
                
                <footer className="px-8 py-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Saathigro • staff ecosystem</p>
                    <div className="flex items-center gap-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Secure & Online</p>
                    </div>
                </footer>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StaffLayout;
