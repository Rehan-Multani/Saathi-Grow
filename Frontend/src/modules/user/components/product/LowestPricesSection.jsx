import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { normalizeProduct } from '../../pages/home/HomePage';
import { ProductCardSkeleton } from '../common/Skeleton';
import { ChevronRight, ArrowLeft, ArrowRight, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * LowestPricesSection
 *
 * Two modes:
 *  1. campaignProducts prop is given (array) ₹ use those curated products directly (admin-driven)
 *  2. products prop is given ₹ auto-filter products with mrp > basePrice (legacy auto-mode, no longer used on HomePage)
 */
const LowestPricesSection = ({
    products = [],
    campaignProducts,        // Pre-curated from admin campaign (with dealPrice already applied)
    loading = false,
    sectionTitle = "Lowest Prices Ever",
    highlightText = "🔥 Massive Discounts - Limited Time Only!",
    campaignId = null
}) => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    // ₹ useEffect MUST be before any early return (Rules of Hooks)
    const handleScroll = () => {
        if (sectionRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sectionRef.current;
            setShowLeft(scrollLeft > 20);
            setShowRight(scrollLeft + clientWidth < scrollWidth - 20);
        }
    };

    useEffect(() => {
        if (!loading) {
            setTimeout(handleScroll, 100);
        }
    }, [loading]);

    // Determine which products to show
    let displayProducts;
    if (campaignProducts && campaignProducts.length > 0) {
        // Admin-curated mode: normalize and add discount info
        displayProducts = campaignProducts
            .map(normalizeProduct)
            .map(p => ({
                ...p,
                discountAmount: p.originalPrice ? p.originalPrice - p.price : 0,
                discountPercentage: p.originalPrice && p.originalPrice > p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0
            }));
    } else {
        // Auto-filter mode: from all products, pick discounted ones
        displayProducts = products
            .map(normalizeProduct)
            .filter(p => p.originalPrice && p.originalPrice > p.price)
            .map(p => ({
                ...p,
                discountAmount: p.originalPrice - p.price,
                discountPercentage: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
            }))
            .sort((a, b) => b.discountPercentage - a.discountPercentage)
            .slice(0, 12);
    }

    // Early return AFTER all hooks
    if (!loading && displayProducts.length === 0) return null;

    const sectionScroll = (dir) => {
        if (sectionRef.current) {
            const scrollAmt = dir === 'left' ? -400 : 400;
            sectionRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4 border-b border-gray-50 dark:border-white/5 mb-10 rounded-xl transition-all duration-300" style={{ background: isDarkMode ? '' : 'linear-gradient(to right, #e8f5e9, #ffffff)' }}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-[#0c831f] to-[#0a6b19] p-1.5 md:p-2 rounded-lg md:rounded-xl">
                        <TrendingDown size={16} className="md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[13px] md:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {sectionTitle}
                    </h2>
                </div>
                {campaignId && (
                    <button
                        onClick={() => navigate(`/campaign/${campaignId}`)}
                        className="flex items-center gap-1 group/seeall"
                    >
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0c831f] dark:text-[#f7cb15] transition-colors">See all</span>
                        <div className="p-1 rounded-full bg-green-50 dark:bg-white/5 transition-all group-hover/seeall:translate-x-1">
                            <ArrowRight size={14} className="text-[#0c831f] dark:text-[#f7cb15]" />
                        </div>
                    </button>
                )}
            </div>

            {/* Promotional Badge */}
            <div className="mb-4 md:mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-200/50 dark:border-red-800/50">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] md:text-xs font-bold text-red-700 dark:text-red-400 tracking-wide uppercase">
                        {highlightText}
                    </span>
                </div>
            </div>

            {/* Products Scrollable Row */}
            <div className="relative flex items-center group/section -mx-4 md:mx-0">
                {/* Left Arrow Space */}
                <div className={`hidden md:flex w-10 lg:w-12 shrink-0 justify-start transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={() => sectionScroll('left')}
                        className="bg-white dark:bg-[#1c1c1c] text-black dark:text-white w-9 h-9 lg:w-11 lg:h-11 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all border border-gray-100 dark:border-white/5 hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label="Scroll left"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div
                    ref={sectionRef}
                    onScroll={handleScroll}
                    className="flex-1 flex overflow-x-auto gap-3 md:gap-4 lg:gap-5 pb-2 md:pb-4 scrollbar-hide px-4 md:px-0 scroll-smooth items-stretch md:snap-x md:snap-mandatory w-full"
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[calc(25%-12px)] lg:w-[calc(20%-16px)] xl:w-[calc(16.666667%-16.666667px)] md:snap-start">
                                <ProductCardSkeleton />
                            </div>
                        ))
                    ) : (
                        displayProducts.map((product) => (
                            <div key={product._id || product.id} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[calc(25%-12px)] lg:w-[calc(20%-16px)] xl:w-[calc(16.666667%-16.666667px)] relative md:snap-start">
                                {/* Discount Badge ₹ only show if there's a real discount */}
                                {product.discountPercentage > 0 && (
                                    <div className="absolute top-1 right-1 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold shadow-lg">
                                        {product.discountPercentage}% OFF
                                    </div>
                                )}
                                <ProductCard
                                    product={product}
                                    customTheme={{
                                        themeColor: isDarkMode ? '#f7cb15' : '#0c831f',
                                        bgColor: isDarkMode ? undefined : 'linear-gradient(to right, #e8f5e9, #ffffff)'
                                    }}
                                    wishlistPosition="top-6 right-2"
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Right Arrow Space */}
                <div className={`hidden md:flex w-10 lg:w-12 shrink-0 justify-end transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={() => sectionScroll('right')}
                        className="bg-white dark:bg-[#1c1c1c] text-black dark:text-white w-9 h-9 lg:w-11 lg:h-11 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all border border-gray-100 dark:border-white/5 hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label="Scroll right"
                    >
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowestPricesSection;
