import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Search, User, LogOut, ChevronDown, MapPin, X, Menu, Settings, Bell, HelpCircle, Sun, Moon, Map, Mic, Globe } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';
import logo from '../../../../assets/logo.png';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';

const Navbar = ({ isMenuOpen, setIsMenuOpen, customTheme }) => {
  const { cartCount, cartTotal, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const { location, openLocationModal } = useLocation();
  const { searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen } = useSearch();
  const { isDarkMode, toggleTheme } = useTheme();
  // isMenuOpen is now a prop
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('preferredLanguage') || 'English');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const recognitionRef = React.useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        handleSuggestionClick(transcript);
        navigate(`/category?search=${transcript}`);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [navigate, setSearchQuery]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    if (routerLocation.state?.openMenu) {
      setIsMenuOpen(true);
      // Clean up state to prevent menu opening on random refreshes/re-navigates
      window.history.replaceState({ ...routerLocation.state, openMenu: false }, '');
    }
    // Load recent searches on mount
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, [routerLocation]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsLoading(true);
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);

      const timer = setTimeout(() => {
        setSuggestions(filtered);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleSuggestionClick = (query) => {
    if (query) {
      const updatedRecent = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    }
    setSearchQuery('');
    setSuggestions([]);
    setIsMobileSearchOpen(false);
    setIsFocused(false);
  };

  const handleRecentClick = (query) => {
    setSearchQuery(query);
    // Keep it focused to show results
    setIsFocused(true);
  };

  const removeRecent = (e, query) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = recentSearches.filter(q => q !== query);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div className="z-50 transition-colors duration-300 font-sans">

      {/* MOBILE LAYOUT */}
      <div className="md:hidden transition-colors duration-300">
        {/* Row 1: Logo & Actions */}
        <div
          className={`flex items-center justify-between px-4 pt-4 pb-2 gap-3 transition-colors duration-300 relative ${isDarkMode ? 'bg-black' : 'backdrop-blur-md'}`}
          style={{
            background: (!isDarkMode && customTheme)
              ? `linear-gradient(to right, ${customTheme.bgColor}, #ffffff90)`
              : undefined
          }}
        >
          {/* Default Background if no custom theme - Light Mode Only */}
          {!customTheme && !isDarkMode && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#e8f5e9] to-[#ffffff]/90 -z-10" />
          )}
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src={logo}
              alt="SaathiGro"
              className={`h-9 w-auto object-contain transition-all duration-300 ${isDarkMode
                ? 'invert hue-rotate-[195deg] brightness-[2] saturate-[4] contrast-[1.1] mix-blend-screen'
                : 'brightness-[1.05] contrast-[1.05] mix-blend-multiply'
                }`}
            />
          </Link>

          {/* Right Side: Notification & Location Group */}
          <div className="flex items-center gap-2.5">
            {/* Notification Icon */}
            <Link to="/notifications" className="relative p-2 bg-white/50 dark:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 border border-white dark:border-white/5 shadow-sm active:scale-90 transition-transform">
              <Bell size={20} className="text-[#0c831f] dark:text-white" strokeWidth={2.5} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>
            </Link>

            {/* Location Selector (Polished Design) */}
            <div
              onClick={openLocationModal}
              className="flex flex-col items-end justify-center leading-none cursor-pointer max-w-[140px]"
            >
              <div className="flex items-center gap-1 mb-0.5 w-full justify-end">
                <span className="text-[14px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter truncate text-right">
                  {location.city || 'Home'}
                </span>
                <ChevronDown size={12} className="text-[#0c831f] flex-shrink-0" strokeWidth={4} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-right truncate w-full tracking-tight">
                {location.address || 'Select locality'}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Search & Actions (Mobile) */}
        <div
          className={`px-4 pb-4 pt-2 flex items-center gap-3 transition-colors duration-300 relative ${isDarkMode ? 'bg-black' : 'backdrop-blur-md'}`}
          style={{
            background: (!isDarkMode && customTheme)
              ? `linear-gradient(to right, ${customTheme.bgColor}, #ffffff90)`
              : undefined
          }}
        >
          {/* Default Background if no custom theme - Light Mode Only */}
          {!customTheme && !isDarkMode && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#e8f5e9] to-[#ffffff]/90 -z-10" />
          )}
          {/* Search Input */}
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder='Search "dal"'
              value=""
              onClick={() => setIsSearchOverlayOpen(true)}
              readOnly
              className="w-full pl-10 pr-10 py-3 bg-[#f6fbf7] border border-[#e8f5e9] dark:bg-[#1c1c1c] dark:border-white/5 rounded-2xl text-[14px] font-bold text-gray-800 dark:text-gray-100 focus:outline-none shadow-sm transition-all placeholder:text-gray-400 cursor-pointer"
            />
            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} strokeWidth={2.5} />
            <Mic className="absolute right-3.5 top-3.5 text-[#0c831f]" size={18} strokeWidth={2.5} />
          </div>

          {/* Language Switcher - Transparent in Light Mode */}
          <div className="relative ml-1">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[32px] ${isDarkMode
                  ? 'bg-white/10 border border-white/5 shadow-sm'
                  : 'bg-transparent border-transparent shadow-none'
                }`}
            >
              <Globe size={18} className="text-[#0c831f] dark:text-gray-100" strokeWidth={2.5} />
              <span className="text-[8px] font-black text-[#0c831f] dark:text-gray-300 uppercase tracking-tighter mt-0.5 leading-none">
                {language === 'English' ? 'EN' : 'HI'}
              </span>
            </button>

            {isLanguageMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLanguageMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { name: 'English', sub: 'Default' },
                      { name: 'Hindi', sub: 'हिंदी' }
                    ].map((lang) => (
                      <button
                        key={lang.name}
                        onClick={() => {
                          setLanguage(lang.name);
                          localStorage.setItem('preferredLanguage', lang.name);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${language === lang.name
                          ? 'bg-[#0c831f] text-white shadow-md'
                          : 'hover:bg-[#f0fdf4] dark:hover:bg-[#0c831f] text-gray-700 dark:text-gray-200 dark:hover:text-white'
                          }`}
                      >
                        <div className="flex flex-col items-start translate-y-[1px]">
                          <span className="text-[13px] font-bold leading-none">{lang.name}</span>
                          <span className={`text-[9px] mt-0.5 font-medium ${language === lang.name ? 'text-white/70' : 'text-gray-400'}`}>
                            {lang.sub}
                          </span>
                        </div>
                        {language === lang.name && (
                          <div className="w-1 h-1 rounded-full bg-white opacity-80" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (Hidden on Mobile) */}
      <nav
        className={`hidden md:block border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300 relative ${isDarkMode ? 'bg-black' : 'backdrop-blur-md'}`}
        style={{ backgroundColor: (!isDarkMode && customTheme) ? customTheme.bgColor : undefined }}
      >
        {!customTheme && !isDarkMode && <div className="absolute inset-0 bg-white/90 -z-10" />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Left: Logo & Location */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <img
                  src={logo}
                  alt="SaathiGro Logo"
                  className={`h-10 w-auto object-contain transition-all duration-300 hover:scale-105 ${isDarkMode
                    ? 'invert hue-rotate-[195deg] brightness-[2] saturate-[4] contrast-[1.1] mix-blend-screen'
                    : 'brightness-[1.05] contrast-[1.05] mix-blend-multiply'
                    }`}
                />
              </Link>

              {/* Location Selector - Desktop */}
              <div
                onClick={openLocationModal}
                className="flex flex-col items-start leading-none px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5"
              >
                <span className="text-[10px] uppercase font-bold text-[#0c831f] tracking-wider mb-1 flex items-center gap-1">
                  Delivering to <ChevronDown size={10} strokeWidth={3} />
                </span>
                <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 max-w-[180px]">
                  {location.city ? location.address : 'Select Location'}
                </span>
              </div>
            </div>

            {/* Center: Search Bar - Desktop */}
            <div className="flex-1 max-w-xl relative group mx-8">
              <div
                onClick={() => setIsSearchOverlayOpen(true)}
                className="w-full pl-11 pr-24 py-2.5 bg-gray-100/50 dark:bg-[#1c1c1c] border border-transparent dark:border-white/5 rounded-full text-sm font-medium text-gray-400 dark:text-gray-500 shadow-inner group-hover:shadow-sm cursor-pointer flex items-center"
              >
                Search for 'milk', 'bread'...
              </div>
              <Search className="absolute left-4 top-3 text-[#0c831f]" size={18} strokeWidth={2.5} />
              <div className="absolute right-3 top-2 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchOverlayOpen(true);
                  }}
                  className="p-1.5 rounded-full transition-all text-gray-400 hover:text-[#0c831f] hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <Mic size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            {/* Right: Actions (Desktop) */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-gray-400 hover:text-[#0c831f] hover:bg-green-50/50 dark:hover:bg-white/5 rounded-full transition-all"
              >
                {isDarkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
              </button>

              {user ? (
                <div className="flex items-center">
                  <Link to="/profile" className="flex items-center gap-2 px-1 py-1 pr-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-[#f0fff4] dark:bg-[#0c831f]/20 flex items-center justify-center text-[#0c831f] border border-[#0c831f]/20">
                      {user.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full object-cover" /> : <User size={16} strokeWidth={2.5} />}
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{user.name?.split(' ')[0] || 'User'}</span>
                  </Link>
                </div>
              ) : (
                <Link
                  to={`/login?redirect=${encodeURIComponent(routerLocation.pathname)}`}
                  style={{ borderRadius: '16px' }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <User size={14} strokeWidth={3} />
                  Login
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={toggleCart}
                  className="p-2.5 bg-gray-100 dark:bg-white/5 hover:bg-[#0c831f] hover:text-white dark:hover:bg-[#0c831f] text-gray-800 dark:text-[#0c831f] rounded-full transition-all duration-300 group shadow-sm"
                >
                  <ShoppingBag size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0c831f] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-sm transform scale-100 animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
