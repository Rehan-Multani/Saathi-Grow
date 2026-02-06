import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, LayoutGrid, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileFooter = ({ setIsMenuOpen }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Do not show on auth pages or checkout
    const hideOnPages = ['/login', '/register', '/checkout', '/order-success'];
    if (hideOnPages.includes(location.pathname)) return null;

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/orders', label: 'Order Again', icon: ShoppingBag },
        { path: '/category', label: 'Categories', icon: LayoutGrid },
        { path: '/profile', label: 'Profile', icon: User },
        { label: 'Menu', icon: Menu, action: () => setIsMenuOpen(true) },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-white/10 z-[999] px-6 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-safe">
            <div className="flex items-center justify-between">
                {navItems.map((item, index) => (
                    item.action ? (
                        <button
                            key={index}
                            onClick={item.action}
                            className="flex flex-col items-center gap-1.5 text-[#0c831f] dark:text-[#0c831f] transition-all duration-300"
                        >
                            <item.icon
                                size={22}
                                strokeWidth={2}
                                className="transition-transform duration-300"
                            />
                            <span className="text-[9px] font-bold tracking-tight font-medium">
                                {item.label}
                            </span>
                        </button>
                    ) : (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-[#0c831f]' : 'text-[#0c831f] opacity-70 dark:text-[#0c831f]/80'}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                                        fill={isActive && item.label !== 'Categories' && item.label !== 'Order Again' ? "currentColor" : "none"}
                                    />
                                    <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    )
                ))}
            </div>
        </div>
    );
};

export default MobileFooter;
