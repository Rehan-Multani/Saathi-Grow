import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, MapPin, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSearch } from '../../context/SearchContext';
import { products } from '../../data/products';

const Navbar = () => {
  const { cartCount, cartTotal, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const { location } = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">

          {/* Logo & Location */}
          <div className="flex items-center gap-2 sm:gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 bg-[var(--saathi-green)] rounded-lg flex items-center justify-center">
                <span className="text-[var(--saathi-yellow)] font-bold text-xl">S</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[var(--saathi-green)] tracking-tight">
                Saathi<span className="text-[var(--saathi-green)]">Gro</span>
              </span>
            </Link>

            {/* Location Selector - Desktop */}
            <Link
              to="/address"
              className="hidden md:flex flex-col items-start leading-tight hover:bg-gray-50 p-1.5 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#0c831f] uppercase tracking-wider">
                Delivering to <ChevronDown size={12} className="group-hover:text-[#0c831f] transition-colors" />
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-gray-800 line-clamp-1 max-w-[150px]">
                {location.city ? location.address : 'Select Location'}
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl relative hidden md:block group text-left">
            <div className="relative z-50">
              <input
                type="text"
                placeholder="Search for 'milk', 'vegetables'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--saathi-green)] focus:border-[var(--saathi-green)] transition-all text-sm font-medium focus:bg-white focus:shadow-md"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
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

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Search size={22} />
            </button>

            {/* Location - Mobile (Icon Only) */}
            <Link to="/address" className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <MapPin size={22} className={location.city ? "text-[#0c831f]" : ""} />
            </Link>

            {/* User Account */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Account</span>
                  <span className="text-sm font-bold text-gray-800">{user.name?.split(' ')[0]}</span>
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
                className="flex items-center gap-2 text-gray-700 font-bold hover:text-[var(--saathi-green)] bg-gray-50 hover:bg-green-50 px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all"
              >
                <User size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Cart Button */}
            <div
              className="relative group cursor-pointer"
              onClick={toggleCart}
            >
              <div className="flex items-center gap-2 bg-[var(--saathi-green)] text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md shadow-green-100">
                <ShoppingCart size={20} className="text-[var(--saathi-yellow)] w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm font-bold">{cartCount} items</span>
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
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--saathi-green)]/20 focus:border-[var(--saathi-green)] transition-all shadow-inner"
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
  );
};

export default Navbar;
