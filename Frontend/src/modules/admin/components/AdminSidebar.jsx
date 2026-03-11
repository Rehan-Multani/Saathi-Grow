import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { adminSidebarMenu } from '../data/sidebarMenu';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminSidebar = ({ showMobile, onClose }) => {
    const { adminUser, adminLogout } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [openSubmenus, setOpenSubmenus] = useState({});

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const hasAccess = (permissionCode) => {
        if (!adminUser) return false;
        // Role 'Admin' is Super Admin and has all permissions
        if (adminUser.role === 'Admin') return true;
        if (!permissionCode) return true;
        const permissions = Array.isArray(adminUser.permissions) ? adminUser.permissions : [];
        if (permissions.includes(permissionCode)) return true;
        if (permissionCode === 'MANAGE_DELIVERY' && permissions.includes('MANAGE_DELIVERY_BOYS')) return true;
        if (permissionCode === 'MANAGE_DELIVERY_BOYS' && permissions.includes('MANAGE_DELIVERY')) return true;
        return false;
    };

    useEffect(() => {
        // Auto-expand menu if active link is inside
        adminSidebarMenu.forEach(item => {
            if (item.submenu?.some(sub => location.pathname === sub.path)) {
                setOpenSubmenus(prev => ({ ...prev, [item.title]: true }));
            }
        });
    }, [location.pathname]);

    const toggleSubmenu = (title) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const renderIcon = (iconName) => {
        const Icon = Icons[iconName] || Icons.Circle;
        return <Icon size={18} className="mr-3 flex-shrink-0" />;
    };

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-[1045] lg:hidden transition-opacity duration-300 ${showMobile ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={onClose}
            />

            <aside
                className={`fixed top-0 left-0 h-full w-[260px] bg-slate-800 text-slate-200 overflow-y-auto z-[1050] transition-transform duration-300 ease-in-out 
                ${showMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="h-[60px] flex items-center px-6 font-bold text-xl border-b border-white/10 text-white">
                    <Icons.ShieldCheck className="mr-2 text-violet-500" size={24} />
                    <span>SathiGro</span>
                </div>

                <nav className="py-3 flex-grow">
                    <div className="flex flex-col gap-1">
                        {adminSidebarMenu.map((item, index) => {
                            // Enact role-based filtration check securely against this sidebar option mapping
                            if (!hasAccess(item.permission)) return null;

                            const hasChildActive = item.submenu?.some(sub => location.pathname === sub.path);
                            const isMenuOpen = openSubmenus[item.title];

                            return (
                                <div key={index}>
                                    {item.submenu ? (
                                        <>
                                            <div
                                                className={`flex items-center px-4 py-3 mx-3 rounded-lg cursor-pointer transition-colors duration-200 
                                                ${hasChildActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white text-slate-400'}`}
                                                onClick={() => toggleSubmenu(item.title)}
                                            >
                                                {renderIcon(item.icon)}
                                                <span className="flex-grow text-left">{item.title}</span>
                                                <Icons.ChevronDown
                                                    size={14}
                                                    className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>

                                            <div className={`overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="bg-black/20 py-1">
                                                    {item.submenu.map((subItem, subIndex) => (
                                                        <NavLink
                                                            key={subIndex}
                                                            to={subItem.path}
                                                            end={true}
                                                            className={({ isActive }) =>
                                                                `flex items-center justify-start pl-12 pr-4 py-2 text-sm text-slate-400 hover:text-white transition-colors
                                                                ${isActive ? 'text-violet-400 font-medium' : ''}`
                                                            }
                                                            onClick={() => showMobile && onClose()}
                                                        >
                                                            {subItem.title}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-3 mx-3 rounded-lg transition-colors duration-200
                                                ${isActive ? 'bg-violet-600 text-white font-medium shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
                                            }
                                            onClick={() => showMobile && onClose()}
                                        >
                                            {renderIcon(item.icon)}
                                            <span className="flex-grow text-left">{item.title}</span>
                                        </NavLink>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-3 border-t border-white/10 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Icons.LogOut size={18} className="mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
