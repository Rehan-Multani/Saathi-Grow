import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import { products } from '../../data/products';
import ProductCard from '../../components/product/ProductCard';
import { useSearch } from '../../context/SearchContext';
import { ChevronRight, ArrowRight, ArrowLeft, Carrot, Milk, Cookie, CupSoda, Snowflake, Coffee, Croissant, Wheat, SprayCan, Sparkles } from 'lucide-react';
import { BannerSkeleton, CategorySkeleton, ProductCardSkeleton } from '../../components/common/Skeleton';

// Offer Images
import offer1 from '../../../../assets/offers/offer1.png';
import offer2 from '../../../../assets/offers/offer2.png';
import offer3 from '../../../../assets/offers/offer3.png';
import offer4 from '../../../../assets/offers/offer4.png';

const offerBanners = [
    { id: 1, image: offer1 },
    { id: 2, image: offer2 },
    { id: 3, image: offer3 },
    { id: 4, image: offer4 }
];

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

const HomePage = () => {
    const { searchQuery } = useSearch();
    const scrollContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemsToShow = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3;

    // Simulate initial data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);



    // Auto-scroll Offers (Infinite one-direction)
    const [offerIndex, setOfferIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setOfferIndex((prev) => prev + 1);
            setIsTransitioning(true);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    // Reset for infinite loop
    useEffect(() => {
        if (offerIndex >= offerBanners.length) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setOfferIndex(0);
            }, 1000); // Wait for transition animation to finish
            return () => clearTimeout(timer);
        }
    }, [offerIndex]);

    // Category Scroll State
    const [canScrollLeft, setCanScrollLeft] = useState(false);

    const handleCategoryScroll = () => {
        if (scrollContainerRef.current) {
            setCanScrollLeft(scrollContainerRef.current.scrollLeft > 20);
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

    const getProductsByCategory = (categorySlug) => {
        return products.filter(p => p.category === categorySlug);
    };

    return (
        <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">


            {/* Premium Offers Carousel - 1 at a time on mobile, 3 on desktop */}
            {!isSearching && !loading && (
                <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-3 mb-2 overflow-hidden relative group/offers">
                    <div className="relative">
                        <div
                            className={`flex ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                            style={{
                                transform: `translateX(-${offerIndex * (100 / itemsToShow)}%)`,
                                gap: itemsToShow === 1 ? '0px' : '16px'
                            }}
                        >
                            {[...offerBanners, ...offerBanners, ...offerBanners].map((offer, idx) => (
                                <div
                                    key={`${offer.id}-${idx}`}
                                    className="flex-shrink-0"
                                    style={{
                                        width: itemsToShow === 1 ? '100%' : `calc(${100 / itemsToShow}% - ${(16 * (itemsToShow - 1)) / itemsToShow}px)`
                                    }}
                                >
                                    <div className="relative cursor-pointer overflow-hidden rounded-none sm:rounded-2xl shadow-sm transition-all duration-300 mx-0 border-none">
                                        <div className="aspect-[16/8] sm:aspect-[16/7] overflow-hidden">
                                            <img
                                                src={offer.image}
                                                alt="Special Offer"
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination Lines (Blinkit Style) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                        {offerBanners.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-500 ${(offerIndex % offerBanners.length) === idx
                                    ? 'w-12 bg-[#0c831f] shadow-[0_0_10px_rgba(12,131,31,0.3)]'
                                    : 'w-6 bg-gray-300 dark:bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            {(filteredCategories.length > 0 || !isSearching) && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8">
                    <div className="flex items-center justify-between mb-4 md:mb-8">
                        <h2 className="text-sm md:text-base font-black text-[#1e293b] dark:text-gray-100 tracking-tight">Shop by Category</h2>
                        {!isSearching && <Link to="/category" className="text-[var(--saathi-green)] text-xs md:text-base font-bold underline underline-offset-4">See All</Link>}
                    </div>
                    <div className="relative group/nav">
                        <div
                            ref={scrollContainerRef}
                            className="grid grid-cols-3 sm:flex sm:overflow-x-auto gap-3 sm:gap-8 pb-8 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-smooth items-start"
                            onScroll={handleCategoryScroll}
                        >
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <CategorySkeleton key={i} />
                                ))
                            ) : (
                                filteredCategories.map((cat) => {
                                    const bgColor = categoryColors[cat.slug] || '#f3f4f6';
                                    return (
                                        <Link key={cat.id} to={`/category/${cat.slug}`} className="flex flex-col items-center transition-transform hover:scale-105 group w-full sm:w-32 sm:flex-shrink-0">
                                            <div
                                                className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex items-center justify-center mb-3 transition-all duration-300 group-hover:shadow-md relative overflow-hidden group-hover:-translate-y-1"
                                                style={{ backgroundColor: bgColor }}
                                            >
                                                <img
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-[12px] md:text-[14px] font-extrabold text-center text-[#2d3748] dark:text-gray-300 leading-tight line-clamp-2 w-full px-1 min-h-[36px] flex items-start justify-center tracking-tight">
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
                                        className="absolute -left-5 top-10 md:top-14 z-30 bg-white dark:bg-[#141414] text-[#0c831f] w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 border border-gray-100 dark:border-white/5 cursor-pointer hidden md:flex"
                                        aria-label="Scroll left"
                                    >
                                        <ArrowLeft size={26} strokeWidth={2.5} />
                                    </button>
                                )}
                                <button
                                    onClick={scrollRight}
                                    className="absolute -right-5 top-10 md:top-14 z-30 bg-white dark:bg-[#141414] text-[#0c831f] w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 border border-gray-100 dark:border-white/5 cursor-pointer hidden md:flex"
                                    aria-label="Scroll right"
                                >
                                    <ArrowRight size={26} strokeWidth={2.5} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Category Sections */}
            {!isSearching && (
                <div className="pb-12">
                    {categories.map((category) => (
                        <ProductRow
                            key={category.id}
                            category={category}
                            loading={loading}
                            getProductsByCategory={getProductsByCategory}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Sub-component for individual product rows to manage scroll state
const ProductRow = ({ category, loading, getProductsByCategory }) => {
    const sectionRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const categoryProducts = getProductsByCategory(category.slug);

    if (categoryProducts.length === 0) return null;

    const handleScroll = () => {
        if (sectionRef.current) {
            setShowLeft(sectionRef.current.scrollLeft > 20);
        }
    };

    const sectionScroll = (dir) => {
        if (sectionRef.current) {
            const scrollAmt = dir === 'left' ? -400 : 400;
            sectionRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 border-b border-gray-50 dark:border-white/5 last:border-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-sm md:text-base font-black text-[#1e293b] dark:text-gray-300 tracking-tight capitalize">
                    {category.name}
                </h2>
                <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center gap-1 text-[var(--saathi-green)] text-[11px] md:text-base font-bold underline underline-offset-4"
                >
                    see all
                    <ChevronRight size={18} />
                </Link>
            </div>

            <div className="relative group/section">
                <div
                    ref={sectionRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-smooth items-stretch"
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[145px] sm:w-[170px] md:w-[200px]">
                                <ProductCardSkeleton />
                            </div>
                        ))
                    ) : (
                        categoryProducts.map((product) => (
                            <div key={product.id} className="flex-shrink-0 w-[145px] sm:w-[170px] md:w-[200px]">
                                <ProductCard product={product} />
                            </div>
                        ))
                    )}
                </div>

                {!loading && (
                    <>
                        {showLeft && (
                            <button
                                onClick={() => sectionScroll('left')}
                                className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-black text-[#0c831f] w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 border border-gray-100 dark:border-white/10 cursor-pointer hidden md:flex"
                                aria-label="Scroll left"
                            >
                                <ArrowLeft size={26} strokeWidth={2.5} />
                            </button>
                        )}
                        <button
                            onClick={() => sectionScroll('right')}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-black text-[#0c831f] w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all hover:scale-110 border border-gray-100 dark:border-white/10 cursor-pointer hidden md:flex"
                            aria-label="Scroll right"
                        >
                            <ArrowRight size={26} strokeWidth={2.5} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
