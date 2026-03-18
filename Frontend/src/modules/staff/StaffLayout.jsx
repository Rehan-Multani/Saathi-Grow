import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { staffSidebarMenu } from './data/staffSidebarMenu';
import { useStaffAuth } from './context/StaffAuthContext';
import FirebaseNotificationHandler from '../../common/components/FirebaseNotificationHandler';

const StaffLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { staffUser, staffLogout } = useStaffAuth();
    const staffToken = staffUser?.token;

    // Helper to find current page title
    const getCurrentTitle = () => {
        for (const item of staffSidebarMenu) {
            if (item.path === location.pathname) return item.title;
            if (item.submenu) {
                const subItem = item.submenu.find(sub => sub.path === location.pathname);
                if (subItem) return subItem.title;
            }
        }
        return 'Dashboard'; // Default fallback
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-blue-100 selection:text-blue-900">
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

                        <button className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                            <Bell size={20} className="text-gray-600" />
                        </button>

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

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowProfileMenu(false)}
                                    ></div>
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
                                            <button className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                                                <Settings size={16} className="mr-2 text-slate-400" /> System Settings
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
