import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, MapPin, X } from 'lucide-react';
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
      <nav className="bg-white dark:bg-black/60 dark:backdrop-blur-xl border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">

            {/* Logo & Location */}
            <div className="flex items-center gap-2 sm:gap-6">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  src={logo}
                  alt="SaathiGro Logo"
                  className={`h-11 md:h-14 w-auto object-contain transition-all duration-300 ${isDarkMode
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
                <div className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
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
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-[var(--saathi-green)] dark:group-hover:text-[#10b981] transition-colors">
                    Categories
                  </span>
                  <ChevronDown size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-[var(--saathi-green)]" />
                </div>

                {showCategories && (
                  <div className="absolute top-full left-0 w-64 bg-white dark:bg-[#141414] rounded-lg shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {uniqueCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-[#0c831f] hover:text-[var(--saathi-green)] dark:hover:text-white transition-all border-b border-gray-50 dark:border-white/5 last:border-0"
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
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Dark Mode Toggle (Desktop/Mobile - Icon Only) */}
              <div className="cursor-pointer select-none" onClick={toggleTheme}>
                <div className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors duration-300 ${isDarkMode ? 'bg-[#0c831f]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
              >
                <Search size={22} />
              </button>

              {/* Location - Mobile (Icon Only) */}
              <button
                onClick={openLocationModal}
                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
              >
                <MapPin size={22} className={location.city ? "text-[#0c831f] dark:text-[#0c831f]" : "dark:text-[#0c831f]"} />
              </button>

              {/* User Account */}
              {user ? (
                <div className="flex items-center">
                  {/* Desktop/Mobile Logout Icon Only */}
                  <button onClick={logout} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-600 dark:text-gray-400"
                >
                  <User size={24} className="text-[#0c831f] dark:text-[#0c831f]" />
                </Link>
              )}

              {/* Cart Icon */}
              <div className="relative group cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all" onClick={toggleCart}>
                <ShoppingCart size={24} className="text-[#0c831f] dark:text-[#0c831f]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0c831f] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] shadow-sm">
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

    </div>
  );
};

export default Navbar;
