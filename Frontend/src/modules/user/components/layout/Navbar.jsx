import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, MapPin, X, Menu, Settings, Bell, HelpCircle, Sun, Moon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';
import logo from '../../../../assets/logo.png';

const Navbar = () => {
  const { cartCount, cartTotal, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const { location, openLocationModal } = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  useEffect(() => {
    if (routerLocation.state?.openMenu) {
      setIsMenuOpen(true);
      // Clean up state to prevent menu opening on random refreshes/re-navigates
      window.history.replaceState({ ...routerLocation.state, openMenu: false }, '');
    }
  }, [routerLocation]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.includes(searchQuery.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSuggestionClick = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsMobileSearchOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 transition-colors duration-300 font-sans">
      {/* Top Bar */}


      {/* Main Navbar */}
      <nav className="bg-white dark:bg-black/60 dark:backdrop-blur-xl border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">

            {/* Logo & Location */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Hamburger Menu - Mobile */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  src={logo}
                  alt="SaathiGro Logo"
                  className={`h-9 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300 ${isDarkMode
                    ? 'invert hue-rotate-[195deg] brightness-[2] saturate-[4] contrast-[1.1] mix-blend-screen'
                    : 'mix-blend-multiply brightness-[1.05] contrast-[1.05]'
                    }`}
                />
              </Link>

              {/* Location Selector - Desktop */}
              <div
                onClick={openLocationModal}
                className="hidden md:flex flex-col items-start leading-tight p-1.5 rounded-lg transition-colors group hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[10px] font-black text-[#0c831f] dark:text-[#0c831f] uppercase tracking-wider">
                  Delivering to <ChevronDown size={12} className="group-hover:text-[#0c831f] dark:group-hover:text-[#0c831f] transition-colors" />
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {location.city ? location.address : 'Select Location'}
                </div>
              </div>

              {/* Categories Dropdown - Desktop */}
              <div
                className="hidden md:flex relative items-center h-full"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <div className="flex items-center gap-1 cursor-pointer py-2 group">
                  <span className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-[var(--saathi-green)] dark:group-hover:text-[#10b981] transition-colors">
                    Categories
                  </span>
                  <ChevronDown size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-[var(--saathi-green)]" />
                </div>

                {showCategories && (
                  <div className="absolute top-full left-0 w-64 bg-white dark:bg-[#141414] rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 py-1 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[450px] overflow-y-auto scrollbar-hide">
                    {uniqueCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-[#0c831f] hover:text-[var(--saathi-green)] dark:hover:text-white transition-all border-b border-gray-50 dark:border-white/5 last:border-0"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-2xl relative hidden md:block group text-left">
              <div className="relative z-50">
                <input
                  type="text"
                  placeholder="Search for 'milk', 'vegetables'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--saathi-green)] dark:focus:ring-[#0c831f] focus:border-[var(--saathi-green)] dark:focus:border-[#0c831f] transition-all text-sm font-medium focus:bg-white dark:focus:bg-[#1c1c1c] focus:shadow-md dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {suggestions.length > 0 && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      onClick={handleSuggestionClick}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        <span className="text-[10px] text-gray-500">{item.category}</span>
                      </div>
                    </Link>
                  ))}
                  <Link to="/category" className="block p-3 text-center text-xs font-bold text-[var(--saathi-green)] bg-green-50/50 hover:bg-green-50 transition-colors">
                    See all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-4">

              {/* Theme Toggle Icon */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all duration-500 relative group overflow-hidden"
                aria-label="Toggle theme"
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {/* Sun Icon */}
                  <div className={`absolute transition-all duration-500 transform ${isDarkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                    <Sun size={22} className="text-[#0c831f]" />
                  </div>
                  {/* Moon Icon */}
                  <div className={`absolute transition-all duration-500 transform ${isDarkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
                    <Moon size={22} className="text-yellow-400" />
                  </div>
                </div>
              </button>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>

              {/* User Account - Desktop Only (Mobile has it in Sidebar) */}
              {user ? (
                <div className="hidden md:flex items-center">
                  <button onClick={logout} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-600 dark:text-gray-400"
                >
                  <User size={24} className="text-[#0c831f] dark:text-[#0c831f]" />
                </Link>
              )}

              {/* Cart Icon */}
              <div className="relative group cursor-pointer p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all" onClick={toggleCart}>
                <ShoppingCart size={20} className="text-[#0c831f] dark:text-[#0c831f] md:size-[24px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0 -right-0 bg-[#0c831f] text-white text-[8px] md:text-[9px] font-black w-3.5 h-3.5 md:w-5 md:h-5 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-[#0a0a0a] shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar (Expandable) */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-3 px-1 animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--saathi-green)] dark:focus:ring-[#0c831f] transition-all dark:text-white"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />

                {/* Mobile Suggestions */}
                {suggestions.length > 0 && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#141414] rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-[60]">
                    {suggestions.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        onClick={handleSuggestionClick}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 bg-white flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.name}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.category}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-[#141414] z-[101] md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-green-50/30 dark:bg-[#0c831f]/10">
            <button
              onClick={() => {
                if (user) {
                  navigate('/profile', { state: { from: routerLocation.pathname } });
                  setIsMenuOpen(false);
                } else {
                  navigate('/login');
                  setIsMenuOpen(false);
                }
              }}
              className="flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--saathi-green)] flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
                  {user ? (user.name || user.email) : 'Welcome Guest'}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {user ? 'View Profile' : 'Login to your account'}
                </span>
              </div>
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto py-2">
            {/* Location Section - Mobile Drawer */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Location</p>
              <button
                onClick={() => {
                  openLocationModal();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 transition-all active:scale-95 group"
              >
                <div className="w-10 h-10 bg-green-50 dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center text-[#0c831f] group-hover:bg-[#0c831f]/20 transition-colors">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-[14px] font-black text-gray-800 dark:text-gray-100 line-clamp-1">
                    {location.city ? location.address : 'Select Location'}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tap to change</span>
                </div>
              </button>
            </div>


            {/* Quick Links */}
            {/* Quick Links */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Support & Info</p>
              <div className="space-y-4">
                {[
                  { icon: Bell, label: 'Notifications', path: '/notifications' },
                  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
                  { icon: Settings, label: 'Settings', path: '/settings' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(item.path, { state: { from: routerLocation.pathname } });
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 text-gray-700 dark:text-gray-300 transition-all active:scale-95 group"
                  >
                    <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#0c831f]/10 transition-colors">
                      <item.icon size={20} className="text-[#0c831f]" />
                    </div>
                    <span className="text-[14px] font-black tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3 bg-[var(--saathi-green)] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-none transition-all hover:brightness-110"
              >
                <User size={18} />
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
