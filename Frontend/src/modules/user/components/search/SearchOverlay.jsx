import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Search } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { products } from '../../data/products';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';

const SearchOverlay = () => {
    const { searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen } = useSearch();
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoading, setIsLoading] = useState(false);

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
            const timer = setTimeout(() => setIsLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    const handleClose = () => {
        setIsSearchOverlayOpen(false);
        setSearchQuery('');
    };

    const handleRecentClick = (query) => {
        setSearchQuery(query);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        if (!recentSearches.includes(suggestion)) {
            const updated = [suggestion, ...recentSearches].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
        }
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    if (!isSearchOverlayOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#fffef5] dark:bg-black z-[9999] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#fffef5] dark:bg-black border-b border-gray-200 dark:border-white/10 p-4">
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
                            autoFocus
                            className="w-full pl-4 pr-10 py-3 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 rounded-xl text-[14px] font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#0c831f] dark:focus:border-[#0c831f] transition-all placeholder:text-gray-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Recent Searches (when empty) */}
                {!searchQuery && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-bold text-gray-900 dark:text-gray-100">Recent searches</h3>
                            {recentSearches.length > 0 && (
                                <button onClick={clearRecent} className="text-[13px] font-bold text-[#0c831f] hover:text-[#0a6b19]">
                                    clear
                                </button>
                            )}
                        </div>
                        {recentSearches.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((query, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleRecentClick(query)}
                                        className="px-3 py-1.5 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 transition-all"
                                    >
                                        {query}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No recent searches</p>
                        )}
                    </div>
                )}

                {/* Suggestions (when typing) */}
                {searchQuery && suggestions.length > 0 && (
                    <div className="mb-6">
                        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                            {suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0 text-left transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded flex items-center justify-center flex-shrink-0">
                                        <Search size={14} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                        {suggestion.charAt(0).toUpperCase() + suggestion.slice(1).toLowerCase()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Results */}
                {searchQuery && (
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Showing results for "{searchQuery}"
                        </h3>
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">No products found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
