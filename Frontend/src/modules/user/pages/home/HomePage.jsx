import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import LowestPricesSection from '../../components/product/LowestPricesSection';
import { useSearch } from '../../context/SearchContext';
import { useShop } from '../../context/ShopContext';
import { ChevronRight, ArrowRight, ArrowLeft, TrendingDown } from 'lucide-react';
import { BannerSkeleton, CategorySkeleton, ProductCardSkeleton } from '../../components/common/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import categoryPlaceholder from '../../assets/images/category-placeholder.png';

const categoryColors = {
    'staples-and-grains': '#f0f4f8',
    'masala-and-spices': '#fdf0d5',
    'dairy-egg-frozen': '#fff9c4',
    'oil-and-ghee': '#f5f5f5',
    'fruit-and-vegetables': '#e8f5e9',
    'meat-and-seafood': '#ffebee',
    'snacks-bakery': '#fff3e0',
    'food-beverage': '#e1f5fe',
    'personal-care': '#f3e5f5',
    'cleaning-essentials': '#e8f5e9',
    'home-office': '#e3f2fd',
    'pet-care': '#f3e5f5',
    'baby-care': '#fff3e0',
    'beauty-grooming': '#fce4ec'
};

const HomePage = ({ }) => {
    const navigate = useNavigate();
    const { searchQuery } = useSearch();
    const { isDarkMode } = useTheme();
    const { categories, products, campaigns, offers, loading, getProductsByCategory } = useShop();
    const scrollContainerRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeOffers = offers.length > 0 ? offers : [];
    const maxItemsToShow = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3;
    const itemsToShow = Math.min(maxItemsToShow, activeOffers.length || 1);
    const isCarousel = activeOffers.length > itemsToShow;

    // Manual & Infinite Scroll Logic - Starts at middle set to allow bidirectional scrolling
    const [offerIndex, setOfferIndex] = useState(isCarousel ? activeOffers.length : 0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Initial positioning check
    useEffect(() => {
        // If loaded with 0 (from previous state or SSR mismatch), jump to middle
        if (isCarousel && offerIndex === 0 && activeOffers.length > 0) {
            setOfferIndex(activeOffers.length);
        }
    }, [activeOffers.length, isCarousel]);

    // Handle Infinite Loop Reset (Bidirectional)
    useEffect(() => {
        if (!isCarousel || activeOffers.length === 0) return;

        const totalItems = activeOffers.length * 3;
        // If we reach the end of the 2nd set (start of 3rd set visually) or start of 1st set
        if (offerIndex >= activeOffers.length * 2) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setOfferIndex(activeOffers.length + (offerIndex % activeOffers.length));
            }, 1000);
            return () => clearTimeout(timer);
        } else if (offerIndex < activeOffers.length) {
            // If we are in the first set, we want to snap to the second set
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setOfferIndex(activeOffers.length + ((offerIndex % activeOffers.length + activeOffers.length) % activeOffers.length));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [offerIndex, activeOffers.length]);

    // Restore transition capability after a snap reset
    useEffect(() => {
        if (!isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(true);
            }, 50); // Small delay to ensure render cycle completes
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    const handleNextOffer = (e) => {
        e.stopPropagation();
        if (!isTransitioning) setIsTransitioning(true);
        setOfferIndex((prev) => prev + 1);
    };

    const handlePrevOffer = (e) => {
        e.stopPropagation();
        if (!isTransitioning) setIsTransitioning(true);
        setOfferIndex((prev) => prev - 1);
    };

    const handleDotClick = (index) => {
        setIsTransitioning(true);
        setOfferIndex(activeOffers.length + index);
    };

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const handleCategoryScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 20);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleCategoryScroll);
            return () => container.removeEventListener('scroll', handleCategoryScroll);
        }
    }, [loading]);

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const isSearching = searchQuery.length > 0;

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // getProductsByCategory comes from ShopContext, uses live backend data
    const getProductsByCategoryLocal = (categoryName) => {
        return getProductsByCategory(categoryName);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#000000] dark:to-[#000000] md:bg-none md:bg-white md:dark:bg-black transition-colors duration-300">


            {/* Premium Offers Carousel - 1 at a time on mobile, 3 on desktop */}
            {!isSearching && !loading && activeOffers.length > 0 && (
                <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-3 mb-2 group/offers relative">
                    <div className="relative overflow-hidden rounded-none sm:rounded-2xl">
                        <div
                            className={`flex ${isTransitioning && isCarousel ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                            style={{
                                transform: isCarousel ? `translateX(-${offerIndex * (100 / itemsToShow)}%)` : 'none',
                                gap: itemsToShow === 1 ? '0px' : '16px'
                            }}
                        >
                            {(isCarousel ? [...activeOffers, ...activeOffers, ...activeOffers] : activeOffers).map((offer, idx) => (
                                <div
                                    key={`${offer._id || offer.id}-${idx}`}
                                    className="flex-shrink-0"
                                    style={{
                                        width: itemsToShow === 1 ? '100%' : `calc(${100 / itemsToShow}% - ${(16 * (itemsToShow - 1)) / itemsToShow}px)`
                                    }}
                                >
                                    <div
                                        onClick={() => navigate(`/offer/${offer._id || offer.id}`)}
                                        className="relative cursor-pointer transition-all duration-300 mx-0 border-none group/banner block z-10"
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="aspect-[16/7.5] sm:aspect-[16/7] overflow-hidden rounded-lg sm:rounded-2xl shadow-sm border border-gray-100/10 pointer-events-none">
                                            <img
                                                src={offer.bannerImage || offer.image}
                                                alt={offer.title || "Special Offer"}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        {isCarousel && (
                            <>
                                <button
                                    onClick={handlePrevOffer}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-black dark:text-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-md flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer border border-gray-200 dark:border-white/10"
                                    aria-label="Previous Offer"
                                >
                                    <ArrowLeft size={20} className="md:w-6 md:h-6" />
                                </button>
                                <button
                                    onClick={handleNextOffer}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-black dark:text-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-md flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer border border-gray-200 dark:border-white/10"
                                    aria-label="Next Offer"
                                >
                                    <ArrowRight size={20} className="md:w-6 md:h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Pagination Lines (Blinkit Style) - Moved below image */}
                    {isCarousel && (
                        <div className="flex justify-center gap-2.5 mt-4">
                            {activeOffers.map((_, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleDotClick(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer hover:scale-110 ${(offerIndex % activeOffers.length) === idx
                                        ? 'w-10 bg-[#0c831f] shadow-[0_0_8px_rgba(12,131,31,0.2)]'
                                        : 'w-4 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Categories */}
            {(filteredCategories.length > 0 || !isSearching) && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-10">
                    <div className="flex items-center justify-between mb-2 md:mb-6">
                        <h2 className="text-[13px] md:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Shop by Category</h2>
                        {!isSearching && (
                            <Link
                                to="/category"
                                className="flex items-center gap-1 text-[#0c831f] text-[10px] md:text-sm font-black tracking-widest hover:opacity-80 transition-all border-b-2 border-transparent hover:border-[#0c831f]"
                            >
                                See all
                                <ChevronRight size={12} strokeWidth={3} />
                            </Link>
                        )}
                    </div>
                    <div className="relative group/nav">
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-2 sm:gap-8 pt-1 pb-2 md:pb-8 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-smooth items-start"
                            onScroll={handleCategoryScroll}
                        >
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-24">
                                        <CategorySkeleton />
                                    </div>
                                ))
                            ) : (
                                filteredCategories.map((cat) => {
                                    const bgColor = categoryColors[cat.slug] || '#f3f4f6';
                                    return (
                                        <Link key={cat._id || cat.id} to={`/category/${cat.slug || cat.name}`} className="flex flex-col items-center group w-[80px] sm:w-28 flex-shrink-0 active:scale-95 transition-transform duration-200">
                                            <div
                                                className="w-[70px] h-[70px] sm:w-[95px] sm:h-[95px] rounded-2xl sm:rounded-3xl shadow-sm flex items-center justify-center mb-1.5 transition-all duration-300 group-hover:shadow-lg group-active:shadow-md relative overflow-hidden group-hover:-translate-y-1.5 border border-transparent hover:border-green-100/30 dark:hover:border-white/10"
                                                style={{ backgroundColor: isDarkMode ? 'var(--bg-surface)' : bgColor }}
                                            >
                                                {/* Glassy reflection overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
                                                <img
                                                    src={cat.image || categoryPlaceholder}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-active:scale-110 z-10"
                                                    onError={(e) => {
                                                        e.target.src = categoryPlaceholder;
                                                        e.target.classList.add('opacity-80');
                                                        e.target.style.objectFit = 'cover';
                                                    }}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-[9px] sm:text-[13px] font-bold text-center text-gray-800 dark:text-gray-300 leading-tight line-clamp-2 w-full px-1 min-h-[26px] sm:min-h-[32px] flex items-center justify-center tracking-tight group-hover:text-[var(--saathi-green)] transition-colors">
                                                {cat.name}
                                            </span>
                                        </Link>
                                    );
                                })
                            )}
                        </div>

                        {!loading && (
                            <>
                                {canScrollLeft && (
                                    <button
                                        onClick={scrollLeft}
                                        className="absolute -left-4 top-10 md:top-14 z-30 bg-white dark:bg-[#1c1c1c] text-black dark:text-white w-9 h-9 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer hidden md:flex border border-gray-100 dark:border-white/5"
                                        aria-label="Scroll left"
                                    >
                                        <ArrowLeft size={18} strokeWidth={2.5} />
                                    </button>
                                )}
                                {canScrollRight && (
                                    <button
                                        onClick={scrollRight}
                                        className="absolute -right-4 top-10 md:top-14 z-30 bg-white dark:bg-[#1c1c1c] text-black dark:text-white w-9 h-9 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer hidden md:flex border border-gray-100 dark:border-white/5"
                                        aria-label="Scroll right"
                                    >
                                        <ArrowRight size={18} strokeWidth={2.5} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Dynamic Campaign Sections — admin-controlled (festive + lowest prices) */}
            {!isSearching && campaigns.map((campaign) => {
                // Build normalized product list for this campaign
                const campaignProducts = campaign.products
                    .filter(cp => cp.productId)
                    .map(cp => ({
                        ...cp.productId,
                        // Campaign deal price overrides base price
                        basePrice: cp.dealPrice || cp.productId.basePrice,
                        price: cp.dealPrice || cp.productId.basePrice,
                        // Keep mrp for discount % calculation
                        mrp: cp.productId.mrp || cp.productId.basePrice,
                    }));
                return (
                    <React.Fragment key={campaign._id}>
                        {campaign.displayType === 'lowest_prices' ? (
                            <LowestPricesSection
                                campaignProducts={campaignProducts}
                                loading={loading}
                                sectionTitle={campaign.title}
                                highlightText={campaign.highlightText || '🔥 Massive Discounts - Limited Time Only!'}
                            />
                        ) : (
                            <OccasionSection
                                title={campaign.title}
                                subtitle={campaign.subtitle || ''}
                                badgeText={campaign.highlightText || ''}
                                products={campaignProducts}
                                loading={loading}
                                themeColor={campaign.accentColor || '#0c831f'}
                                bgColor={campaign.bgColor || '#f0fdf4'}
                                slug={null}
                                campaignId={campaign._id}
                            />
                        )}
                        <div className="h-4 sm:h-8" />
                    </React.Fragment>
                );
            })}

            {/* Category Sections */}
            {!isSearching && (
                <div className="pb-12">
                    {categories.map((category) => (
                        <ProductRow
                            key={category._id || category.id}
                            category={category}
                            loading={loading}
                            getProductsByCategory={getProductsByCategoryLocal}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Normalizes a backend product object to the format expected by ProductCard.
 * Backend:  { _id, name, basePrice, mrp, image, unitType, unitValue, category, status }
 * Frontend: { id, name, price, originalPrice, image, weight, category, status }
 */
export const normalizeProduct = (product) => ({
    ...product,
    id: product._id || product.id,
    price: product.basePrice ?? product.price,
    originalPrice: (product.mrp && product.mrp > product.basePrice) ? product.mrp : (product.originalPrice || null),
    weight: product.unitValue ? `${product.unitValue} ${product.unitType || ''}`.trim() : (product.weight || ''),
    image: product.image || null,
    status: product.status,
});

// Sub-component for individual product rows to manage scroll state
const ProductRow = ({ category, loading, getProductsByCategory }) => {
    const sectionRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);
    // Backend stores category as a string (the category name)
    const categoryProducts = getProductsByCategory(category.name || category.slug);

    // ✅ useEffect MUST be before any early return (Rules of Hooks)
    const handleScroll = () => {
        if (sectionRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sectionRef.current;
            setShowLeft(scrollLeft > 20);
            setShowRight(scrollLeft + clientWidth < scrollWidth - 20);
        }
    };

    useEffect(() => {
        // Initial check after loading finishes
        if (!loading) {
            setTimeout(handleScroll, 100);
        }
    }, [loading]);

    // Early return AFTER all hooks
    if (!categoryProducts || categoryProducts.length === 0) return null;

    const sectionScroll = (dir) => {
        if (sectionRef.current) {
            const scrollAmt = dir === 'left' ? -400 : 400;
            sectionRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-8 border-b border-gray-50 dark:border-white/5 last:border-0">
            <div className="flex items-center justify-between mb-2 md:mb-6">
                <h2 className="text-[11px] md:text-base font-black text-[#1e293b] dark:text-gray-300 tracking-tight capitalize">
                    {category.name}
                </h2>
                <Link
                    to={`/category/${category.slug || category.name}`}
                    className="flex items-center gap-1 text-[var(--saathi-green)] text-[10px] md:text-sm font-bold tracking-wider hover:opacity-80 transition-all"
                >
                    See all
                    <ChevronRight size={14} />
                </Link>
            </div>

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
                        categoryProducts.map((product) => (
                            <div key={product._id || product.id} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[200px]">
                                <ProductCard product={normalizeProduct(product)} />
                            </div>
                        ))
                    )}
                </div>

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

// Reusable Occasion Section Component
const OccasionSection = ({
    title,
    subtitle,
    products,
    loading,
    themeColor,
    bgColor,
    slug,
    badgeText,
    className,
    campaignId,
    wishlistPosition
}) => {
    const { isDarkMode } = useTheme();
    const sectionRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    // ✅ useEffect MUST be before any early return (Rules of Hooks)
    const handleScroll = () => {
        if (sectionRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sectionRef.current;
            setShowLeft(scrollLeft > 20);
            setShowRight(scrollLeft + clientWidth < scrollWidth - 20);
        }
    };

    useEffect(() => {
        if (!loading) setTimeout(handleScroll, 100);
    }, [loading]);

    // Early return AFTER all hooks
    if (!products || products.length === 0) return null;

    const sectionScroll = (dir) => {
        if (sectionRef.current) {
            const scrollAmt = dir === 'left' ? -400 : 400;
            sectionRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        }
    };

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 my-0 rounded-xl relative transition-all duration-300 ${className || ''}`} style={{ backgroundColor: isDarkMode ? '' : bgColor }}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col">
                    <h2 className="text-lg md:text-xl font-black tracking-tight" style={{ color: isDarkMode ? 'var(--text-primary)' : themeColor }}>
                        {title}
                    </h2>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'opacity-70'}`} style={{ color: isDarkMode ? '' : themeColor }}>{subtitle}</p>
                </div>
                {slug && (
                    <Link
                        to={`/occasion/${slug}`}
                        className="flex items-center gap-1 text-[10px] md:text-sm font-bold tracking-wider hover:opacity-80 transition-all border-b-2 border-transparent hover:border-current"
                        style={{ color: isDarkMode ? 'var(--saathi-yellow)' : themeColor }}
                    >
                        See All
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </Link>
                )}
            </div>

            {/* Promotional Badge (Optional) */}
            {badgeText && (
                <div className="mb-1">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm"
                        style={{
                            backgroundColor: `${themeColor}10`, // 10% opacity of theme color
                            borderColor: `${themeColor}30`
                        }}
                    >
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: themeColor }}
                        />
                        <span
                            className="text-[9px] md:text-xs font-black tracking-wide uppercase"
                            style={{ color: themeColor }}
                        >
                            {badgeText}
                        </span>
                    </div>
                </div>
            )}

            <div className="relative group/section">
                <div
                    ref={sectionRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-3 md:gap-5 pb-2 md:pb-4 scrollbar-hide -mx-0 px-0 scroll-smooth items-stretch"
                >
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[200px]">
                                <ProductCardSkeleton />
                            </div>
                        ))
                    ) : (
                        products.map((product) => (
                            <div key={product._id || product.id} className="flex-shrink-0 w-[128px] sm:w-[170px] md:w-[200px]">
                                <ProductCard
                                    product={normalizeProduct(product)}
                                    customTheme={{
                                        themeColor: isDarkMode ? 'var(--saathi-yellow)' : themeColor,
                                        bgColor: isDarkMode ? '' : bgColor
                                    }}
                                    wishlistPosition={wishlistPosition}
                                />
                            </div>
                        ))
                    )}
                </div>

                {!loading && (
                    <>
                        {showLeft && (
                            <button
                                onClick={() => sectionScroll('left')}
                                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 hidden md:flex"
                            >
                                <ArrowLeft size={18} strokeWidth={2.5} />
                            </button>
                        )}
                        {showRight && (
                            <button
                                onClick={() => sectionScroll('right')}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 hidden md:flex"
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

export default HomePage;
