import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import StoreManagerSidebar from './components/StoreManagerSidebar';
import { Menu, Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';

const StoreManagerLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { managerUser, managerLogout } = useStoreManagerAuth();

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
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-blue-100 selection:text-blue-900">
            <StoreManagerSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px] w-full transition-all duration-300">
                {/* Professional Compact Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
                            <p className="text-[10px] text-slate-500 font-medium">Store Management Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="hidden md:block relative group">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-[280px] pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm text-slate-700 focus:bg-white focus:border-blue-500 transition-all outline-none"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>

                        <div className="h-6 w-px bg-slate-200"></div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-all"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase overflow-hidden">
                                    {managerUser?.profileImage ? (
                                        <img src={managerUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        (managerUser?.name || 'M').charAt(0)
                                    )}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-slate-800">{managerUser?.name || 'Manager'}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </button>

                            {showProfileMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-slate-100 mb-1">
                                            <p className="text-xs font-medium text-slate-500">Logged in as</p>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{managerUser?.email || 'manager@saathigro.corp'}</p>
                                        </div>
                                        <div className="px-1">
                                            <button
                                                onClick={() => { navigate('/store-manager/profile'); setShowProfileMenu(false); }}
                                                className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                            >
                                                <User size={16} className="mr-2 text-slate-400" /> Profile Settings
                                            </button>
                                            <button className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                                                <Settings size={16} className="mr-2 text-slate-400" /> System Settings
                                            </button>
                                            <div className="my-1 border-t border-slate-100"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <LogOut size={16} className="mr-2" /> Logout
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
                            Â© 2026 sathiGro Store Management System
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

