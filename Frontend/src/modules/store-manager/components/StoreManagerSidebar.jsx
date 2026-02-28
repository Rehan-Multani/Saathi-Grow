import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { managerSidebarMenu } from '../data/managerSidebarMenu';
import { useStoreManagerAuth } from '../context/StoreManagerAuthContext';

const StoreManagerSidebar = ({ showMobile, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { managerUser, managerLogout } = useStoreManagerAuth();
    const [openSubmenus, setOpenSubmenus] = useState({});

    const hasAccess = (permissionCode) => {
        if (!managerUser) return false;
        if (!permissionCode) return true;
        if (permissionCode === 'VIEW_DASHBOARD') return true; // Always show Manager Dashboard & Basic modules
        return Array.isArray(managerUser.permissions) && managerUser.permissions.includes(permissionCode);
    };

    const toggleSubmenu = (title) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const handleLogout = () => {
        managerLogout();
        navigate('/store-manager/login');
    };

    const renderIcon = (iconName) => {
        const Icon = Icons[iconName] || Icons.Circle;
        return <Icon size={18} />;
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1045] lg:hidden transition-all duration-300 ${showMobile ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={onClose}
            />

            <aside
                className={`fixed top-0 left-0 h-full w-[240px] bg-[#0f172a] text-slate-300 z-[1050] transition-all duration-300 
                ${showMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'} border-r border-slate-800 flex flex-col`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Icons.Store size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">Saathi<span className="text-blue-500">Gro</span></span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                    <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
                    <nav className="space-y-1">
                        {managerSidebarMenu.map((item, index) => {
                            if (!hasAccess(item.permission)) return null;
                            const isMenuOpen = openSubmenus[item.title];
                            const hasChildActive = item.submenu?.some(sub => location.pathname === sub.path);

                            return (
                                <div key={index}>
                                    {item.submenu ? (
                                        <>
                                            <div
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm
                                                ${hasChildActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                                onClick={() => toggleSubmenu(item.title)}
                                            >
                                                <div className={`${hasChildActive ? 'text-blue-500' : 'text-slate-500'}`}>
                                                    {renderIcon(item.icon)}
                                                </div>
                                                <span className="flex-1">{item.title}</span>
                                                <Icons.ChevronDown
                                                    size={14}
                                                    className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>

                                            <div className={`overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="mt-1 space-y-1">
                                                    {item.submenu.map((sub, sIdx) => {
                                                        if (sub.permission && !hasAccess(sub.permission)) return null;
                                                        return (
                                                            <NavLink
                                                                key={sIdx}
                                                                to={sub.path}
                                                                className={({ isActive }) =>
                                                                    `flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-xs transition-all
                                                                    ${isActive ? 'text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`
                                                                }
                                                                onClick={() => showMobile && onClose()}
                                                            >
                                                                {sub.title}
                                                            </NavLink>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                                                ${isActive
                                                    ? 'bg-blue-600 text-white shadow-md font-medium'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                                            }
                                            onClick={() => showMobile && onClose()}
                                        >
                                            <div className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                                {renderIcon(item.icon)}
                                            </div>
                                            <span>{item.title}</span>
                                        </NavLink>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Profile Section */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                            {(managerUser?.name || 'M').charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{managerUser?.name || 'Manager'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{managerUser?.role || 'Branch Manager'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <span>Logout</span>
                        <Icons.LogOut size={14} />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default StoreManagerSidebar;
