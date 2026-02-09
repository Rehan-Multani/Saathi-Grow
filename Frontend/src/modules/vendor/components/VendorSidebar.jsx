import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Wallet, User, Menu, X, LogOut, BarChart2, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';

const VendorSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const routerLocation = useLocation();

    const toggle = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        // Clear auth logic here (e.g., localStorage, context)
        localStorage.removeItem('vendor_token');
        navigate('/vendor/login');
    };

    const [expandedMenus, setExpandedMenus] = useState(['Products']);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor/dashboard' },
        { icon: BarChart2, label: 'Analysis', path: '/vendor/analysis' },
        {
            icon: Package,
            label: 'Products',
            path: '/vendor/products',
            subItems: [
                { label: 'Manage Products', path: '/vendor/products' },
                { label: 'Add Product', path: '/vendor/products/add' },
                { label: 'Bulk Upload', path: '/vendor/products/bulk' },
                { label: 'Product FAQs', path: '/vendor/products/faqs' },
                { label: 'Tax & Pricing', path: '/vendor/products/tax-pricing' },
                { label: 'Product Attributes', path: '/vendor/products/attributes' },
            ]
        },
        { icon: Layers, label: 'Stock Management', path: '/vendor/stock' },
        {
            icon: ShoppingBag,
            label: 'Orders',
            path: '/vendor/orders',
            subItems: [
                { label: 'All Orders', path: '/vendor/orders' },
                { label: 'Order Tracking', path: '/vendor/orders/tracking' },
            ]
        },
        { icon: Wallet, label: 'Earnings', path: '/vendor/earnings' },
        { icon: User, label: 'Profile', path: '/vendor/profile' },
    ];

    const toggleMenu = (e, label) => {
        e.preventDefault();
        setExpandedMenus(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button onClick={toggle} className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-md shadow-md text-gray-700">
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 bg-white border-r border-gray-100 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out z-40 flex flex-col`}>

                {/* Brand */}
                <div className="h-16 flex items-center px-6 pl-14 md:pl-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0c831f] rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-[#f7cb15] font-extrabold text-xl">S</span>
                        </div>
                        <span className="text-xl font-extrabold text-[#0c831f] tracking-tight">SaathiGro</span>
                    </div>
                </div>

                {/* Nav */}
                <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems.map((item) => {
                        const isExpanded = expandedMenus.includes(item.label);
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                            <div key={item.label} className="space-y-1">
                                <NavLink
                                    to={item.path}
                                    onClick={(e) => hasSubItems && toggleMenu(e, item.label)}
                                    className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${(isActive && !hasSubItems) || (hasSubItems && isExpanded)
                                        ? 'bg-[#0c831f]/10 text-[#0c831f]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className={((item.path === routerLocation?.pathname && !hasSubItems) || (hasSubItems && isExpanded)) ? 'text-[#0c831f]' : 'text-gray-500'} />
                                        <span>{item.label}</span>
                                    </div>
                                    {hasSubItems && (
                                        isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                    )}
                                </NavLink>

                                {hasSubItems && isExpanded && (
                                    <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.label}
                                                to={sub.path}
                                                onClick={() => setIsOpen(false)}
                                                className={({ isActive }) => `block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isActive
                                                    ? 'bg-[#0c831f]/5 text-[#0c831f] font-bold'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                    <p className="mt-4 text-[10px] text-gray-400 text-center">v1.2.0 • SaathiGro Vendor</p>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-30" onClick={toggle}></div>}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <LogOut size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center">Sign Out</h3>
                        <p className="text-sm text-gray-500 mt-2 text-center">Are you sure you want to log out of your account?</p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-2.5 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19] transition-colors shadow-lg shadow-green-900/20"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorSidebar;
