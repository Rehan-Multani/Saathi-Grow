import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
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
            // Fetch latest 3
            const res = await axios.get(`${API_BASE_URL}/notifications/my?limit=3`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            if (res.data.success) {
                setRecentNotifications(res.data.notifications);
            }
            
            // Fetch unread count
            const countRes = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            if (countRes.data.success) {
                setUnreadCount(countRes.data.count);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
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

    // Helper to find current page title
    const getCurrentTitle = () => {
        for (const item of staffSidebarMenu) {
            if (item.path === location.pathname) return item.title;
            if (item.submenu) {
                const subItem = item.submenu.find(sub => sub.path === location.pathname);
                if (subItem) return subItem.title;
            }
        }
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-blue-100 selection:text-blue-900 staff-portal-root animate-page-entry">
            <FirebaseNotificationHandler token={staffToken} role="staff" />
            <StaffSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-[260px] w-full`}>
                <header className="h-[60px] bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h5 className="mb-0 font-bold text-gray-800 hidden sm:block text-lg">{getCurrentTitle()}</h5>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="relative">
                            <button 
                                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                                className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotificationMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                            <h6 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-0">Notifications</h6>
                                            {unreadCount > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{unreadCount} New</span>}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {recentNotifications.length > 0 ? (
                                                recentNotifications.map(notif => (
                                                    <div 
                                                        key={notif._id} 
                                                        onClick={() => { handleMarkAsRead(notif._id); setShowNotificationMenu(false); }}
                                                        className={`p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        {!notif.isRead && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                                        <p className="text-xs font-black text-gray-800 mb-0.5 line-clamp-1">{notif.title}</p>
                                                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{notif.body}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold mt-1.5 tracking-tight uppercase">{new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-400">
                                                    <p className="text-xs font-bold uppercase tracking-widest">Inbox Zero</p>
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => { navigate('/staff/notifications'); setShowNotificationMenu(false); }}
                                            className="w-full p-3 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors border-t border-gray-100"
                                        >
                                            View All Notifications
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 hover:bg-gray-50 rounded-full pr-2 transition-colors focus:outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="font-bold text-sm text-gray-800 leading-none">{staffUser?.name || 'Staff User'}</div>
                                    <div className="text-[11px] text-gray-500 leading-none mt-1">{staffUser?.role || 'Associate'}</div>
                                </div>
                                <div className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                    {staffUser?.profileImage ? (
                                        <img src={staffUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        (staffUser?.name || 'S').charAt(0)
                                    )}
                                </div>
                            </button>

                            {showProfileMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                        </div>
                                        <div className="px-1">
                                            <button
                                                onClick={() => { navigate('/staff/profile'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                            >
                                                <User size={16} className="mr-2 text-slate-400" /> Profile Settings
                                            </button>
                                        </div>
                                        <div className="my-1 border-t border-gray-50"></div>
                                        <button
                                            onClick={staffLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={16} className="mr-2" /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
