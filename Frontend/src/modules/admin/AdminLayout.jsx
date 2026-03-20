import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import { Bell, Menu, User, Settings, LogOut, Languages, ChevronDown } from 'lucide-react';
import { adminSidebarMenu } from './data/sidebarMenu';
import { useAdminAuth } from './context/AdminAuthContext';
import FirebaseNotificationHandler from '../../common/components/FirebaseNotificationHandler';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const AdminLayout = () => {
    const { t, i18n } = useTranslation();
    const { adminLogout, adminUser } = useAdminAuth();
    const adminToken = adminUser?.token;
    const navigate = useNavigate();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setShowLangMenu(false);
    };

    const fetchUnreadCount = async () => {
        try {
            if (!adminToken) return;
            const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${adminToken}` }
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
        const interval = setInterval(fetchUnreadCount, 30000); // Polling every 30s as fallback to push
        return () => clearInterval(interval);
    }, [adminToken]);

    // Helper to find current page title
    const getCurrentTitle = () => {
        for (const item of adminSidebarMenu) {
            if (item.path === location.pathname) {
                return t(`common.${item.key}`) || item.title;
            }
            if (item.submenu) {
                const subItem = item.submenu.find(sub => sub.path === location.pathname);
                if (subItem) return t(`sidebar.${subItem.key}`) || subItem.title;
            }
        }
        return t('common.dashboard'); // Default fallback
    };

    const currentLang = i18n.language || 'en';

    return (
        <div className="min-h-screen bg-gray-50">
            <FirebaseNotificationHandler token={adminToken} role="admin" />
            <AdminSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className={`flex flex-col min-h-screen transition-all duration-300 lg:ml-[260px]`}>
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

                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                            >
                                <Languages size={18} className="text-blue-600" />
                                <span className="hidden md:block">
                                    {currentLang === 'hi' ? 'Hindi' : 'English'}
                                </span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <button
                                            onClick={() => changeLanguage('en')}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${currentLang === 'en' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('hi')}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${currentLang === 'hi' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'}`}
                                        >
                                            हिन्दी
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={() => navigate('/admin/notifications/push')}
                            className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <Bell size={20} className="text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 hover:bg-gray-50 rounded-full pr-2 transition-colors focus:outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="font-bold text-sm text-gray-800 leading-none">
                                        {adminUser?.name || t('common.admin_user')}
                                    </div>
                                    <div className="text-[11px] text-gray-500 leading-none mt-1">
                                        {adminUser?.role || t('common.staff')}
                                    </div>
                                </div>
                                <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                    {adminUser?.profileImage ? (
                                        <img src={adminUser.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (adminUser?.name?.charAt(0) || 'A')
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowProfileMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('common.account')}</p>
                                        </div>
                                        <a href="/admin/settings/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <User size={16} className="mr-2" /> {t('common.profile')}
                                        </a>
                                        <a href="/admin/settings/app" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <Settings size={16} className="mr-2" /> {t('common.settings')}
                                        </a>
                                        <div className="my-1 border-t border-gray-50"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} className="mr-2" /> {t('common.logout')}
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

export default AdminLayout;
