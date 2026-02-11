import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { ChevronRight, ArrowLeft, ArrowRight, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LowestPricesSection = ({ products, loading = false, sectionTitle = "Lowest Prices Ever" }) => {
    const { isDarkMode } = useTheme();
    const sectionRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    // Filter products with significant discounts and sort by absolute discount amount
    const lowestPriceProducts = products
        .filter(p => p.originalPrice && p.originalPrice > p.price)
        .map(p => ({
            ...p,
            discountAmount: p.originalPrice - p.price,
            discountPercentage: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        }))
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 12); // Show top 12 products with best discounts

    if (!loading && lowestPriceProducts.length === 0) return null;

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

    const sectionScroll = (dir) => {
        if (sectionRef.current) {
            const scrollAmt = dir === 'left' ? -400 : 400;
            sectionRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4 border-b border-gray-50 dark:border-white/5 my-0 rounded-xl transition-all duration-300" style={{ background: isDarkMode ? '' : 'linear-gradient(to right, #fef2f2, #fecaca)' }}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-[#0c831f] to-[#0a6b19] p-1.5 md:p-2 rounded-lg md:rounded-xl">
                        <TrendingDown size={16} className="md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[13px] md:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                        {sectionTitle}
                    </h2>
                </div>
                <Link
                    to="/lowest-prices"
                    className="flex items-center gap-1 text-[#dc2626] dark:text-[#f7cb15] text-[10px] md:text-sm font-bold tracking-wider hover:opacity-80 transition-all"
                >
                    See all
                    <ChevronRight size={14} />
                </Link>
            </div>

            {/* Promotional Badge */}
            <div className="mb-1 md:mb-2">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-200/50 dark:border-red-800/50">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] md:text-xs font-bold text-red-700 dark:text-red-400 tracking-wide uppercase">
                        🔥 Massive Discounts - Limited Time Only!
                    </span>
                </div>
            </div>

            {/* Products Scrollable Row */}
            <div className="relative group/section">
                <div
                    ref={sectionRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-2 md:gap-5 pb-2 md:pb-4 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-smooth items-stretch"
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[200px]">
                                <ProductCardSkeleton />
                            </div>
                        ))
                    ) : (
                        lowestPriceProducts.map((product) => (
                            <div key={product.id} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[200px] relative">
                                {/* Discount Badge */}
                                <div className="absolute top-1 right-1 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black shadow-lg">
                                    {product.discountPercentage}% OFF
                                </div>
                                <ProductCard
                                    product={product}
                                    customTheme={{ themeColor: isDarkMode ? '#f7cb15' : '#dc2626' }}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Navigation Arrows - Desktop Only */}
                {!loading && (
                    <>
                        {showLeft && (
                            <button
                                onClick={() => sectionScroll('left')}
                                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-[#1c1c1c] text-black dark:text-white w-9 h-9 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer hidden md:flex border border-gray-100 dark:border-white/5"
                                aria-label="Scroll left"
                            >
                                <ArrowLeft size={18} strokeWidth={2.5} />
                            </button>
                        )}
                        {showRight && (
                            <button
                                onClick={() => sectionScroll('right')}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-[#1c1c1c] text-black dark:text-white w-9 h-9 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer hidden md:flex border border-gray-100 dark:border-white/5"
                                aria-label="Scroll right"
                            >
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LowestPricesSection;
