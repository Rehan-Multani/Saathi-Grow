import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, Search, Sparkles, Mic, MicOff } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { products } from '../../data/products';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton, SuggestionSkeleton } from '../common/Skeleton';
import logo from '../../../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';

const SearchOverlay = () => {
    const { searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen } = useSearch();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState(null);

    const recognitionRef = React.useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-IN'; // Better support for Indian users
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                setIsListening(false);
                addToHistory(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'audio-capture') {
                    setMicError('Microphone not found or hardware error');
                } else if (event.error === 'not-allowed') {
                    setMicError('Mic permission denied. Please enable in browser settings.');
                } else if (event.error !== 'aborted') {
                    setMicError('Voice search failed. Please try again.');
                }
                setTimeout(() => setMicError(null), 4000);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [setSearchQuery]);

    const startListening = () => {
        if (!recognitionRef.current) {
            alert('Voice search is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setMicError(null);
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

    // Filter products based on search query
    const filteredProducts = searchQuery
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    // Generate autocomplete suggestions with images
    const suggestions = searchQuery
        ? products
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
            .map(p => ({
                id: p.id,
                name: p.name,
                image: p.image,
                category: p.category
            }))
        : [];

    // Simulate loading when typing
    useEffect(() => {
        if (searchQuery) {
            setIsLoading(true);
            const timer = setTimeout(() => setIsLoading(false), 600);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    const addToHistory = (query) => {
        if (!query || query.trim() === '') return;
        const trimmedQuery = query.trim();
        const updated = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleClose = () => {
        setIsSearchOverlayOpen(false);
        setSearchQuery('');
    };

    const handleRecentClick = (query) => {
        setSearchQuery(query);
        addToHistory(query);
    };

    const removeRecent = (e, query) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== query);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    if (!isSearchOverlayOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#e8f5e9] via-white to-white md:bg-white dark:bg-none dark:bg-black md:dark:bg-black z-[9999] overflow-y-auto transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 md:bg-white dark:bg-black/80 md:dark:bg-[#111111] backdrop-blur-md md:backdrop-blur-none border-b border-gray-100 dark:border-white/5 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors flex-shrink-0">
                            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
                        </button>

                        {/* Logo (Desktop Only) */}
                        <Link
                            to="/"
                            onClick={() => setIsSearchOverlayOpen(false)}
                            className="hidden md:flex items-center group flex-shrink-0"
                        >
                            <img
                                src={logo}
                                alt="SaathiGro Logo"
                                className={`h-8 w-auto object-contain transition-all duration-300 hover:scale-105 ${isDarkMode
                                    ? 'invert hue-rotate-[195deg] brightness-[2] saturate-[4] contrast-[1.1] mix-blend-screen'
                                    : 'brightness-[1.05] contrast-[1.05] mix-blend-multiply'
                                    }`}
                            />
                        </Link>
                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block">
                                <Search size={20} className="text-[#0c831f]" strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                placeholder='Search for "dal", "milk", or "snacks"'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addToHistory(searchQuery);
                                    }
                                }}
                                autoFocus
                                className={`w-full pl-4 md:pl-12 pr-12 md:pr-24 py-2.5 md:py-3.5 bg-white/50 md:bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 md:border-transparent focus:border-[#0c831f] rounded-xl text-[14px] md:text-[15px] font-medium text-gray-800 dark:text-gray-100 focus:outline-none transition-all placeholder:text-gray-400 ${isListening ? 'ring-2 ring-[#0c831f]/50' : ''}`}
                            />
                            <div className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:gap-1">
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <X size={20} />
                                    </button>
                                )}
                                <div className="w-[1px] h-5 md:h-6 bg-gray-200 dark:bg-white/10 mx-0.5 md:mx-1"></div>
                                <button
                                    onClick={startListening}
                                    className={`p-2 rounded-lg transition-all ${isListening ? 'bg-[#0c831f] text-white animate-pulse' : 'text-[#0c831f] hover:bg-[#e8f5e9] dark:hover:bg-white/5'}`}
                                    title={isListening ? "Stop listening" : "Voice search"}
                                >
                                    <Mic size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {micError && (
                    <div className="mt-2 text-center animate-in slide-in-from-top duration-300">
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/10 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/20 shadow-sm">
                            {micError}
                        </span>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Recent Searches (When search input is focused but empty) */}
                {!searchQuery && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-bold text-gray-900 dark:text-gray-100">Recent searches</h3>
                            {recentSearches.length > 0 && (
                                <button onClick={clearRecent} className="text-[12px] font-bold text-[#0c831f]">
                                    Clear all
                                </button>
                            )}
                        </div>
                        {recentSearches.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((query, i) => (
                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#0c831f] rounded-lg transition-all group">
                                        <button
                                            onClick={() => handleRecentClick(query)}
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#0c831f]"
                                        >
                                            {query}
                                        </button>
                                        <button
                                            onClick={(e) => removeRecent(e, query)}
                                            className="p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl text-center border border-dashed border-gray-100 dark:border-white/10">
                                <p className="text-[12px] font-medium text-gray-400">No recent searches yet</p>
                            </div>
                        )}

                        <div className="mt-8">
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">Popular categories</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                                {[
                                    { name: 'Vegetables', slug: 'fruit-and-vegetables' },
                                    { name: 'Fruits', slug: 'fruit-and-vegetables' },
                                    { name: 'Dairy', slug: 'dairy-egg-frozen' },
                                    { name: 'Snacks', slug: 'snacks-bakery' }
                                ].map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => {
                                            setSearchQuery(cat.name);
                                            addToHistory(cat.name);
                                        }}
                                        className="h-20 bg-[#e8f5e9] md:bg-white/40 dark:bg-white/5 rounded-lg text-left border border-green-100/50 md:border-gray-100 dark:border-white/10 group hover:border-[#0c831f] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 flex items-center"
                                    >
                                        <p className="text-[14px] font-bold text-[#1e293b] dark:text-gray-200 group-hover:text-[#0c831f]">{cat.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search State: Suggestions & Recommendations (When typing) */}
                {searchQuery && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* 1. Text Suggestions (The "Recommendations" based on input) */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={14} className="text-yellow-500" />
                                <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Suggestions</h3>
                            </div>
                            {isLoading ? (
                                <SuggestionSkeleton />
                            ) : suggestions.length > 0 ? (
                                <div className="space-y-0.5 max-w-2xl">
                                    {suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                addToHistory(suggestion.name);
                                                navigate(`/product/${suggestion.id}`);
                                                setIsSearchOverlayOpen(false);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                                        >
                                            <div className="w-10 h-10 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-white/5 flex items-center justify-center p-1 flex-shrink-0">
                                                <img src={suggestion.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#0c831f] transition-colors">
                                                    {suggestion.name.toLowerCase().split(searchQuery.toLowerCase()).map((part, index, array) => (
                                                        <React.Fragment key={index}>
                                                            {part}
                                                            {index < array.length - 1 && (
                                                                <span className="font-black text-[#0c831f]">
                                                                    {searchQuery.toLowerCase()}
                                                                </span>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                    {suggestion.category}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Finding the best matches...</p>
                            )}
                        </div>

                        {/* 2. Scalable Product Grid */}
                        <div>
                            {!isLoading && filteredProducts.length > 0 && (
                                <h2 className="text-[13px] md:text-[18px] font-bold text-gray-800 dark:text-gray-100 mb-6 px-1">
                                    Showing results for <span className="text-[#0c831f]">"{searchQuery}"</span>
                                </h2>
                            )}

                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <ProductCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} onClick={() => {
                                            addToHistory(searchQuery);
                                            setIsSearchOverlayOpen(false);
                                        }}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                                    <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Search size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No products found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try a different keyword or category</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
