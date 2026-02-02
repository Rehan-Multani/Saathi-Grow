import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import { Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';
import { staffSidebarMenu } from './data/staffSidebarMenu';
import { useStaffAuth } from './context/StaffAuthContext';

const StaffLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const location = useLocation();
    const { staffUser, staffLogout } = useStaffAuth();

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
        <div className="min-h-screen bg-gray-50 flex">
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
                        <div className="hidden md:block relative">
                            <input
                                type="text"
                                className="w-[280px] pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                                placeholder="Search inventory..."
                            />
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

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
                                <div className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                                    {(staffUser?.name || 'S').charAt(0)}
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
                                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                                            <User size={16} className="mr-2" /> Profile
                                        </a>
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
