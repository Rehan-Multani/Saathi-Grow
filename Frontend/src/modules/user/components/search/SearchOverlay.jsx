import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Search, Sparkles, Mic, MicOff } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { products } from '../../data/products';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton, SuggestionSkeleton } from '../common/Skeleton';

const SearchOverlay = () => {
    const { searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen } = useSearch();
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

    // Generate autocomplete suggestions
    const suggestions = searchQuery
        ? products
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
            .map(p => p.name)
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
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        addToHistory(suggestion);
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    if (!isSearchOverlayOpen) return null;

    return (
        <div className="fixed inset-0 bg-white dark:bg-[#09090b] z-[9999] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-[#09090b] border-b border-gray-200 dark:border-white/10 p-4">
                <div className="flex items-center gap-3">
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                        <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder='Search for "dal"'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addToHistory(searchQuery);
                                }
                            }}
                            autoFocus
                            className={`w-full pl-4 pr-20 py-3 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 rounded-xl text-[14px] font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#0c831f] dark:focus:border-[#0c831f] transition-all placeholder:text-gray-400 ${isListening ? 'ring-2 ring-[#0c831f]/50' : ''}`}
                        />
                        <div className="absolute right-2 top-1.5 flex items-center gap-1">
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                            <button
                                onClick={startListening}
                                className={`p-2 rounded-lg transition-all ${isListening ? 'bg-[#0c831f] text-white animate-pulse' : 'text-gray-400 hover:text-[#0c831f] hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                title={isListening ? "Stop listening" : "Voice search"}
                            >
                                {isListening ? <Mic size={18} /> : <Mic size={18} />}
                            </button>
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
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                                {recentSearches.map((query, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleRecentClick(query)}
                                        className="px-5 py-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-[#0c831f] hover:text-[#0c831f] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm flex-shrink-0 min-w-[100px] text-center"
                                    >
                                        {query.charAt(0).toUpperCase() + query.slice(1).toLowerCase()}
                                    </button>
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
                                    { name: 'Snacks', slug: 'snacks-and-branded-foods' }
                                ].map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => {
                                            setSearchQuery(cat.name);
                                            addToHistory(cat.name);
                                        }}
                                        className="h-20 bg-white dark:bg-[#111] rounded-lg text-left border border-gray-100 dark:border-white/10 group hover:border-[#0c831f] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 flex items-center"
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
                                <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                                    {suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                addToHistory(suggestion);
                                                const foundProduct = products.find(p => p.name.toLowerCase() === suggestion.toLowerCase());
                                                if (foundProduct) {
                                                    navigate(`/product/${foundProduct.id}`);
                                                    setIsSearchOverlayOpen(false);
                                                } else {
                                                    handleSuggestionClick(suggestion);
                                                }
                                            }}
                                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-white/5 last:border-0 text-left transition-colors group"
                                        >
                                            <Search size={14} className="text-gray-400 group-hover:text-[#0c831f] transition-colors" />
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                {suggestion.charAt(0).toUpperCase() + suggestion.slice(1).toLowerCase()}
                                            </span>
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
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-1 h-3.5 bg-[#0c831f] rounded-full"></div>
                                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100">Results for "{searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase()}"</h3>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <ProductCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
