import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { adminSidebarMenu } from '../data/sidebarMenu';
import { Collapse } from 'react-bootstrap';

const AdminSidebar = ({ showMobile, onClose }) => {
    const location = useLocation();
    const [openSubmenus, setOpenSubmenus] = useState({});

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
        return <Icon size={18} className="me-3 flex-shrink-0" />;
    };

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div
                className={`sidebar-overlay d-lg-none ${showMobile ? 'show' : ''}`}
                onClick={onClose}
            />

            <aside className={`admin-sidebar-wrapper ${showMobile ? 'show' : ''}`}>
                <div className="sidebar-brand text-white">
                    <Icons.ShieldCheck className="me-2 text-primary" size={24} />
                    <span>SathiGro</span>
                </div>

                <nav className="sidebar-nav py-3">
                    <div className="d-flex flex-column gap-1">
                        {adminSidebarMenu.map((item, index) => {
                            const hasChildActive = item.submenu?.some(sub => location.pathname === sub.path);
                            const isMenuOpen = openSubmenus[item.title];

                            return (
                                <div key={index}>
                                    {item.submenu ? (
                                        <>
                                            <div
                                                className={`nav-link cursor-pointer ${hasChildActive ? 'text-white' : ''}`}
                                                onClick={() => toggleSubmenu(item.title)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {renderIcon(item.icon)}
                                                <span className="flex-grow-1">{item.title}</span>
                                                <Icons.ChevronDown
                                                    size={14}
                                                    style={{
                                                        transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                />
                                            </div>
                                            <Collapse in={isMenuOpen}>
                                                <div>
                                                    <div className="bg-black bg-opacity-25">
                                                        {item.submenu.map((subItem, subIndex) => (
                                                            <NavLink
                                                                key={subIndex}
                                                                to={subItem.path}
                                                                end={true}
                                                                className={({ isActive }) =>
                                                                    `nav-link ps-5 py-2 small ${isActive ? 'active' : ''}`
                                                                }
                                                                onClick={() => showMobile && onClose()} // Close sidebar on mobile nav
                                                            >
                                                                {subItem.title}
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            className="nav-link"
                                            onClick={() => showMobile && onClose()}
                                        >
                                            {renderIcon(item.icon)}
                                            <span>{item.title}</span>
                                        </NavLink>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
                    <button className="btn btn-link nav-link text-white-50 w-100 text-decoration-none d-flex align-items-center bg-transparent border-0 p-0">
                        <Icons.LogOut size={18} className="me-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
