import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, MapPin, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';

const Navbar = () => {
  const { cartCount, cartTotal, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const { location } = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const uniqueCategories = [...new Set(products.map(p => p.category))];

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
      <nav className="bg-white dark:!bg-[#212121] border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">

            {/* Logo & Location */}
            <div className="flex items-center gap-2 sm:gap-6">
              <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
                <div className="w-8 h-8 bg-[var(--saathi-green)] dark:bg-[#7e978e] rounded-lg flex items-center justify-center">
                  <span className="text-[var(--saathi-yellow)] font-bold text-xl">S</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-[var(--saathi-green)] dark:text-[#7e978e] tracking-tight">
                  SaathiGro
                </span>
              </Link>

              {/* Location Selector - Desktop */}
              <Link
                to="/address"
                className="hidden md:flex flex-col items-start leading-tight p-1.5 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#0c831f] dark:text-[#7e978e] uppercase tracking-wider">
                  Delivering to <ChevronDown size={12} className="group-hover:text-[#0c831f] dark:group-hover:text-[#7e978e] transition-colors" />
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-white line-clamp-1 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {location.city ? location.address : 'Select Location'}
                </div>
              </Link>

              {/* Categories Dropdown - Desktop */}
              <div
                className="hidden md:flex relative items-center h-full"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <div className="flex items-center gap-1 cursor-pointer py-2">
                  <span className="text-sm font-bold text-gray-800 dark:text-white hover:text-[var(--saathi-green)] dark:hover:text-[#7e978e] transition-colors">
                    Categories
                  </span>
                  <ChevronDown size={14} className="text-gray-500 dark:text-white" />
                </div>

                {showCategories && (
                  <div className="absolute top-full left-0 w-64 bg-white dark:!bg-[#212121] rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {uniqueCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-3 text-sm font-medium text-gray-700 dark:!text-white hover:bg-green-50 dark:hover:bg-[#7e978e] hover:text-[var(--saathi-green)] dark:hover:!text-white transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--saathi-green)] dark:focus:ring-[#7e978e] focus:border-[var(--saathi-green)] dark:focus:border-[#7e978e] transition-all text-sm font-medium focus:bg-white dark:focus:bg-[#1a1a1a] focus:shadow-md dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
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
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Dark Mode Toggle (Desktop/Mobile - Icon Only) */}
              <div className="cursor-pointer select-none" onClick={toggleTheme}>
                <div className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors duration-300 ${isDarkMode ? 'bg-[#8edab8]' : 'bg-[#004d40]'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <Search size={22} />
              </button>

              {/* Location - Mobile (Icon Only) */}
              <Link to="/address" className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <MapPin size={22} className={location.city ? "text-[#0c831f] dark:text-[#7e978e]" : ""} />
              </Link>

              {/* User Account */}
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end leading-none">
                    <span className="text-[10px] text-gray-500 dark:text-white font-bold uppercase">Account</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{user.name?.split(' ')[0]}</span>
                  </div>
                  {/* Mobile User Icon / Desktop Logout */}
                  <button onClick={logout} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors hidden sm:block">
                    <LogOut size={18} />
                  </button>
                  {/* Mobile User Icon (Simple) - Logs out for now on mobile */}
                  <button onClick={logout} className="sm:hidden p-2 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <User size={24} className="text-[var(--saathi-green)] dark:text-[#7e978e]" />
                </Link>
              )}

              {/* Cart Button */}
              <div
                className="relative group cursor-pointer"
                onClick={toggleCart}
              >
                <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
                  <ShoppingCart size={24} className="text-[var(--saathi-green)] dark:text-[#7e978e]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-black leading-none text-white bg-[#0c831f] dark:bg-[#7e978e] rounded-full shadow-sm z-10">
                      {cartCount}
                    </span>
                  )}
                </div>
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--saathi-green)]/20 dark:focus:ring-[#7e978e]/30 focus:border-[var(--saathi-green)] dark:focus:border-[#7e978e] transition-all shadow-inner dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />

                {/* Mobile Suggestions */}
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
            </div>
          )}
        </div>
      </nav>

    </div>
  );
};

export default Navbar;
