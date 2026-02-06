import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Search, User, LogOut, ChevronDown, MapPin, X, Menu, Settings, Bell, HelpCircle, Sun, Moon, Map, Mic } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';
import logo from '../../../../assets/logo.png';

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
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
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.includes(searchQuery.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
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
    setIsFocused(false);
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
      <div className="md:hidden sticky top-0 z-50 bg-white dark:bg-[#141414] shadow-sm transition-colors duration-300">
        {/* Row 1: Logo & Actions */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex-1 flex flex-col items-start overflow-hidden">
            <button
              onClick={openLocationModal}
              className="text-[18px] font-black text-[#1f2937] dark:text-gray-100 uppercase tracking-tighter leading-none flex items-center gap-1 active:opacity-70 transition-opacity"
            >
              DELIVERY IN 8 MINS <ChevronDown size={18} className="text-[#1f2937] dark:text-gray-100" strokeWidth={3} />
            </button>
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 truncate max-w-full leading-tight mt-0.5">
              {location.address?.split(',').slice(0, 2).join(',') || "Select your location"}
            </span>
          </div>

          {/* Cart Toggle (Top Right) */}
          <div className="relative">
            <button
              onClick={toggleCart}
              className="w-10 h-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm text-[#0c831f] dark:text-[#0c831f]"
            >
              <ShoppingBag size={20} />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0c831f] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-sm transform scale-100 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Search & Actions (Mobile) */}
        <div className="px-4 pb-4 pt-2 flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder='Search "dal"'
              value=""
              onClick={() => setIsSearchOverlayOpen(true)}
              readOnly
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-[#1c1c1c] rounded-2xl text-[14px] font-bold text-gray-800 dark:text-gray-100 focus:outline-none shadow-sm transition-all placeholder:text-gray-400 cursor-pointer"
            />
            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (Hidden on Mobile) */}
      <nav className="hidden md:block bg-white dark:bg-black/80 dark:backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Left: Logo & Location */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <img
                  src={logo}
                  alt="SaathiGro Logo"
                  className={`h-10 w-auto object-contain transition-all duration-300 ${isDarkMode
                    ? 'invert hue-rotate-[195deg] brightness-[2] saturate-[4] contrast-[1.1] mix-blend-screen'
                    : 'brightness-[1.05] contrast-[1.05]'
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
              <div className="relative z-50 transition-all duration-300 transform group-hover:scale-[1.01]">
                <input
                  type="text"
                  placeholder="Search for 'milk', 'bread'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleSuggestionClick(searchQuery.trim());
                      navigate(`/category?search=${searchQuery.trim()}`);
                    }
                  }}
                  className="w-full pl-11 pr-24 py-2.5 bg-gray-100/50 dark:bg-[#1c1c1c] border border-transparent dark:border-white/5 rounded-full focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1c] focus:ring-2 focus:ring-[#0c831f]/10 dark:focus:ring-[#0c831f]/20 focus:border-[#0c831f]/20 transition-all text-sm font-medium dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner group-hover:shadow-sm"
                />
                <Search className="absolute left-4 top-3 text-gray-400 dark:text-gray-500" size={18} strokeWidth={2} />
                <div className="absolute right-3 top-2 flex items-center gap-1">
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={startListening}
                    className={`p-1.5 rounded-full transition-all ${isListening ? 'bg-[#0c831f] text-white animate-pulse' : 'text-gray-400 hover:text-[#0c831f] hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    title={isListening ? "Stop listening" : "Voice search"}
                  >
                    <Mic size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Search Suggestions (Desktop) */}
              {isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden z-[60] p-1">
                  {!searchQuery && recentSearches.length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent</p>
                      {recentSearches.map((query, i) => (
                        <div key={i} onClick={() => handleRecentClick(query)} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                          <div className="flex items-center gap-3"><Search size={14} className="text-gray-400" /><span className="text-sm font-medium text-gray-700 dark:text-gray-200">{query}</span></div>
                          <button onClick={(e) => removeRecent(e, query)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery && suggestions.length > 0 && (
                    <div className="p-1">
                      {suggestions.map((item) => (
                        <Link key={item.id} to={`/product/${item.id}`} onClick={() => handleSuggestionClick(item.name)} className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 dark:border-white/5 flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-contain" /></div>
                          <div className="flex flex-col"><span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.name}</span><span className="text-[10px] text-gray-500">{item.category}</span></div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-black uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all"
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

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1999] md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-[#141414] z-[2000] md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full pb-24">
          <div className="p-5 flex items-center justify-between border-b border-gray-50 dark:border-white/5">
            <button
              onClick={() => {
                const target = user ? '/profile' : '/login';
                navigate(target, { state: { from: routerLocation.pathname } });
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#eefaf1] dark:bg-[#0c831f]/10 border-4 border-gray-50 dark:border-white/5 flex items-center justify-center text-[#0c831f] shadow-sm overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="!text-[13px] font-black text-gray-900 dark:text-gray-100 leading-none mb-1">
                  {user ? (user.name || "Saathi Member") : 'Welcome Guest'}
                </span>
                <span className="!text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                  {user ? 'View Profile' : 'Login to your account'}
                </span>
              </div>
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <div className="px-6 mb-8">
              <p className="!text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Location</p>
              <button
                onClick={() => {
                  openLocationModal();
                  setIsMenuOpen(false);
                }}
                className="w-full py-2 px-2 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 !rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 bg-green-50 dark:bg-[#0c831f]/10 !rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center text-[#0c831f] shadow-sm">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="!text-[11px] font-black text-gray-900 dark:text-gray-100 line-clamp-1 leading-none mb-1">
                    {location.city ? location.address : 'Select Location'}
                  </span>
                  <span className="!text-[8px] text-gray-400 font-bold uppercase tracking-widest">Tap to change</span>
                </div>
              </button>
            </div>

            <div className="px-6">
              <p className="!text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Support & Info</p>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {[
                  { icon: ShoppingBag, label: 'My Orders', path: '/orders' },
                  { icon: Map, label: 'Saved Addresses', path: '/saved-addresses' },
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
                    className="w-full py-4 px-2 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group group-active:scale-95 !rounded-2xl"
                  >
                    <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 !rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center text-[#0c831f] shadow-sm">
                      <item.icon size={18} />
                    </div>
                    <span className="!text-[11px] font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {user ? (
              <button
                onClick={() => {
                  navigate('/logout-confirmation');
                  setIsMenuOpen(false);
                }}
                className="w-full py-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl font-black !text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link
                to={`/login?redirect=${encodeURIComponent(routerLocation.pathname)}`}
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 bg-[#0c831f] text-white rounded-2xl font-black !text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                <User size={16} />
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
