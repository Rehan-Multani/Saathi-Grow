import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminSidebarMenu } from '../data/sidebarMenu';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminSidebar = ({ showMobile, onClose }) => {
    const { t } = useTranslation('admin_sidebar');
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
        if (adminUser.role === 'Admin') return true;
        if (!permissionCode) return true;
        const permissions = Array.isArray(adminUser.permissions) ? adminUser.permissions : [];
        return permissions.includes(permissionCode);
    };

    useEffect(() => {
        adminSidebarMenu.forEach(item => {
            if (item.submenu?.some(sub => location.pathname === sub.path)) {
                setOpenSubmenus(prev => ({ ...prev, [item.key || item.title]: true }));
            }
        });
    }, [location.pathname]);

    const toggleSubmenu = (key) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const renderIcon = (iconName) => {
        const Icon = Icons[iconName] || Icons.Circle;
        return <Icon size={19} className="sidebar-icon" />;
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${showMobile ? 'visible' : 'hidden'}`}
                onClick={onClose}
            />

            <aside className={`admin-sidebar ${showMobile ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-box">
                        <Icons.ShieldCheck size={20} className="text-white" />
                    </div>
                    <div className="logo-text">
                        <span className="main">Saathi<span className="text-blue-500">Grow</span></span>
                        <span className="sub">Administrative Portal</span>
                    </div>
                </div>

                <div className="sidebar-content custom-scrollbar">
                    {adminSidebarMenu.map((item, index) => {
                        if (!hasAccess(item.permission)) return null;

                        const itemKey = item.key || item.title;
                        const hasChildActive = item.submenu?.some(sub => location.pathname === sub.path);
                        const isMenuOpen = openSubmenus[itemKey];

                        return (
                            <div key={index} className="menu-group">
                                {item.submenu ? (
                                    <>
                                        <div
                                            className={`menu-item ${hasChildActive ? 'child-active' : ''} ${isMenuOpen ? 'group-open' : ''}`}
                                            onClick={() => toggleSubmenu(itemKey)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {renderIcon(item.icon)}
                                                <span className="label">{t(item.key, item.title)}</span>
                                            </div>
                                            <Icons.ChevronRight
                                                size={14}
                                                className={`chevron-icon transition-transform ${isMenuOpen ? 'rotate-90' : ''}`}
                                            />
                                        </div>

                                        <div className={`submenu-wrapper ${isMenuOpen ? 'open' : ''}`}>
                                            {item.submenu.map((subItem, subIndex) => (
                                                <NavLink
                                                    key={subIndex}
                                                    to={subItem.path}
                                                    end={true}
                                                    className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => showMobile && onClose()}
                                                >
                                                    <div className="indicator"></div>
                                                    <span>{t(subItem.key, subItem.title)}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `menu-item standalone ${isActive ? 'active' : ''}`}
                                        onClick={() => showMobile && onClose()}
                                    >
                                        <div className="flex items-center gap-3">
                                            {renderIcon(item.icon)}
                                            <span className="label">{t(item.key, item.title)}</span>
                                        </div>
                                    </NavLink>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <Icons.LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .admin-sidebar { position: fixed; top: 0; left: 0; width: 270px; background: #0f172a; display: flex; flex-direction: column; z-index: 1050; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); height: 100vh; border-right: 1px solid rgba(255,255,255,0.05); }
                    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 1045; transition: all 0.3s ease; }
                    .sidebar-overlay.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
                    .sidebar-overlay.visible { opacity: 1; visibility: visible; }
                    
                    @media (max-width: 1023px) { .admin-sidebar:not(.mobile-open) { transform: translateX(-100%); } }
                    
                    .sidebar-header { height: 80px; display: flex; align-items: center; gap: 14px; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .logo-box { width: 36px; height: 36px; background: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
                    .logo-text { display: flex; flex-direction: column; }
                    .logo-text .main { font-size: 18px; font-weight: 800; color: #f8fafc; letter-spacing: -0.02em; }
                    .logo-text .sub { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: -1px; }
                    
                    .sidebar-content { flex: 1; overflow-y: auto; padding: 20px 14px; }
                    .menu-group { margin-bottom: 4px; }
                    .menu-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; color: #94a3b8; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                    .menu-item:hover { background: rgba(255,255,255,0.05); color: #f1f5f9; }
                    .menu-item .label { font-size: 14px; font-weight: 500; }
                    .menu-item .sidebar-icon { opacity: 0.8; }
                    .menu-item .chevron-icon { opacity: 0.5; }
                    
                    .menu-item.active, .menu-item.standalone.active { background: #2563eb; color: #fff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                    .menu-item.active .sidebar-icon, .menu-item.active .chevron-icon { opacity: 1; }
                    .menu-item.active .label { font-weight: 600; }
                    .menu-item.child-active { background: rgba(255,255,255,0.05); color: #f1f5f9; }

                    .submenu-wrapper { max-height: 0; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; }
                    .submenu-wrapper.open { max-height: 600px; opacity: 1; padding: 6px 0; }
                    .submenu-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px 9px 46px; font-size: 13.5px; font-weight: 400; color: #64748b; position: relative; transition: all 0.2s; border-radius: 8px; }
                    .submenu-item:hover { color: #f1f5f9; background: rgba(255,255,255,0.03); }
                    .submenu-item.active { color: #fff; font-weight: 500; background: rgba(37, 99, 235, 0.1); }
                    .submenu-item.active::before { content: ''; position: absolute; left: 40px; top: 18px; width: 4px; height: 4px; background: #2563eb; border-radius: 50%; }
                    
                    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
                    .logout-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; color: #94a3b8; font-size: 14px; font-weight: 500; transition: all 0.2s text-color; border: 1px solid transparent; }
                    .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
                    
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
                `}} />
            </aside>
        </>
    );
};

export default AdminSidebar;
