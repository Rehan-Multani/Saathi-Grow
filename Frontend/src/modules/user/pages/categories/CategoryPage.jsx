import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { fetchProducts, fetchBrands, fetchSubCategories } from '../../api/shopApi';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight, Filter, ArrowLeft, Search, X, SlidersHorizontal, Leaf, Info, TrendingUp } from 'lucide-react';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { useStore } from '../../context/StoreContext';
import { ASSET_URLS } from '../../../../constants/assetUrls';
import { normalizeProduct } from '../home/HomePage';
import SEO from '../../../../common/components/SEO';
import { useTheme } from '../../context/ThemeContext';
// import { catSlug } from '../../../../constants/catSlug';

const categoryPlaceholder = ASSET_URLS.placeholder;

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

const CategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { categories, products: globalProducts, refreshShopData } = useShop();
    const { activeStore } = useStore();
    const { isDarkMode } = useTheme();

    // Parse URL search params
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    // Local State for Pagination & Filtering
    const [pageProducts, setPageProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [localSearch, setLocalSearch] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [showSearch, setShowSearch] = useState(!!initialSearch);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState('-createdAt'); // '-createdAt', 'basePrice', '-basePrice'
    const [isVegOnly, setIsVegOnly] = useState(false);
    const [selectedSubCat, setSelectedSubCat] = useState(queryParams.get('sub') || 'all');
    const [availableBrands, setAvailableBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const isProductsRoute = location.pathname.endsWith('/products');

    // If no slug, we represent the "All Categories" view
    const isMainListView = !slug;

    const currentCategory = categories.find(c => {
        const catSlug = c.slug || c.name?.toLowerCase().replace(/\s+/g, '-');
        const decodedSlug = decodeURIComponent(slug || '');
        return catSlug === slug || c.slug === slug || c.name === decodedSlug || c.name?.toLowerCase() === decodedSlug.toLowerCase();
    });

    const categoryName = currentCategory?.name;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(localSearch), 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    // Fetch Brands and Subcategories for current category
    useEffect(() => {
        const loadCategoryData = async () => {
            if (!categoryName) return;
            try {
                const [brandsData, subCatsData] = await Promise.all([
                    fetchBrands(categoryName),
                    fetchSubCategories(categoryName)
                ]);
                setAvailableBrands(brandsData);
                setAvailableSubCategories(subCatsData);
            } catch (err) {
                console.error("Error loading category metadata:", err);
            }
        };
        loadCategoryData();
    }, [categoryName]);

    const loadCategoryProducts = useCallback(async (pageNum = 1, append = false) => {
        if (!categoryName && !isMainListView) return;

        try {
            if (append) setIsFetchingMore(true);
            else setIsLoading(true);

            const params = {
                page: pageNum,
                limit: 20,
                sort: sortOption,
                status: ['Active', 'Low Stock', 'Out of Stock']
            };

            if (categoryName) params.category = categoryName;
            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedSubCat !== 'all') params.subCategory = selectedSubCat;
            if (isVegOnly) params.isVeg = 'true';
            if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
            if (activeStore) {
                params.activeStoreId = activeStore.id;
                params.activeStoreType = activeStore.type;
            }

            const response = await fetchProducts(params);
            const newProducts = response.products || [];

            setPageProducts(prev => append ? [...prev, ...newProducts] : newProducts);
            setTotalPages(response.pages || 1);
            setTotalResults(response.total || 0);
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch category products:", err);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [categoryName, debouncedSearch, sortOption, isVegOnly, isMainListView, selectedSubCat]);

    // Initial load and filter change
    useEffect(() => {
        setPage(1);
        loadCategoryProducts(1, false);
    }, [debouncedSearch, sortOption, isVegOnly, slug, categoryName, selectedSubCat, selectedBrands]);

    // Reset filters on category change
    useEffect(() => {
        setSelectedBrands([]);
        setSelectedSubCat('all');
        setLocalSearch('');
    }, [slug]);

    const { setIsBottomSheetOpen } = useShop();

    useEffect(() => {
        setIsBottomSheetOpen(isFilterOpen);
        return () => setIsBottomSheetOpen(false);
    }, [isFilterOpen, setIsBottomSheetOpen]);

    useEffect(() => {
        const handleRefresh = () => loadCategoryProducts(1, false);
        window.addEventListener('saathi_refresh', handleRefresh);
        return () => window.removeEventListener('saathi_refresh', handleRefresh);
    }, [loadCategoryProducts]);

    if (isMainListView) {
        return (
            <div className="category-products-page category-products-index min-h-screen bg-gradient-to-br from-[#f6fbf7] to-[#e8f5e9] md:bg-none md:bg-white dark:bg-none dark:bg-black p-4 pt-6 pb-24">
                <SEO title="All Categories" description="Browse through all categories of fresh products and groceries available on Saathi-Grow." />
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 bg-gray-50 dark:bg-[#141414] rounded-full shadow-sm hidden md:flex"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className="text-sm md:text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Categories</h1>
                    </div>

                    {/* Highly rounded categories grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 px-1">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-full aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl sm:rounded-[32px] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-6 px-1">
                            {categories.map((cat) => {
                                return (
                                    <Link
                                        key={cat._id || cat.id}
                                        to={`/category/${encodeURIComponent(cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'))}`}
                                        className="flex flex-col group w-full h-[110px] sm:h-[155px] transition-all duration-300 active:scale-95 rounded-2xl sm:rounded-[32px] overflow-hidden border border-gray-100/50 dark:border-white/5 shadow-sm"
                                        style={{ 
                                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : (cat.bgColor || categoryColors[cat.slug] || '#f8f9fa') 
                                        }}
                                    >
                                        <span className="text-[10px] sm:text-[13px] font-black text-center text-gray-900 dark:text-gray-100 leading-tight tracking-tight pt-2 sm:pt-4 px-1 capitalize group-hover:text-[#0c831f] transition-colors">
                                            {cat.name?.toLowerCase() || 'Category'}
                                        </span>
                                        <div className="flex-1 w-full p-2 flex items-center justify-center">
                                            <img
                                                src={cat.image || categoryPlaceholder}
                                                alt={cat.name}
                                                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                                                onError={(e) => {
                                                    if (e.target.src !== categoryPlaceholder) {
                                                        e.target.src = categoryPlaceholder;
                                                        e.target.classList.add('opacity-80');
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const normalizedProducts = pageProducts.map(normalizeProduct);

    return (
        <div className="category-products-page min-h-screen bg-white dark:bg-black pb-28 transition-colors duration-300">
            <style dangerouslySetInnerHTML={{ __html: `
                .back-btn-clear, .back-btn-clear:hover, .back-btn-clear:active {
                    background: transparent !important;
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .shop-pill-btn {
                    border-radius: 9999px !important;
                }
                .sort-pill-btn {
                    border-radius: 9999px !important;
                }
            ` }} />
            <SEO
                title={currentCategory?.name || 'Category'}
                description={`Shop for ${currentCategory?.name || 'products'} at Saathi-Grow. Best quality and fast delivery for all your needs.`}
                image={currentCategory?.image}
            />
            {/* Compact Header - No Sticky */}
            <div className="category-products-header relative bg-white dark:bg-black border-b border-gray-50 dark:border-white/5 px-3 py-1.5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(isProductsRoute && slug ? `/category/${encodeURIComponent(slug)}` : '/category')}
                                className="back-btn-clear p-2 text-gray-800 dark:text-gray-200 active:scale-90 transition-all"
                            >
                                <ArrowLeft size={22} strokeWidth={2.5} />
                            </button>
                            {!showSearch ? (
                                <div className="flex flex-col">
                                    <h1 className="text-base font-black text-gray-900 dark:text-gray-100 leading-tight">
                                        {currentCategory?.name || 'Store'}
                                    </h1>
                                    <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                                        {totalResults} Products
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Fast Search Toggle */}
                        <div className={`flex-1 transition-all duration-300 ${showSearch ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute invisible max-w-0'}`}>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search...`}
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-white/5 border-none rounded-full text-[13px] font-bold text-gray-900 dark:text-white focus:outline-none shadow-inner"
                                    autoFocus
                                />
                                {localSearch && (
                                    <button
                                        onClick={() => setLocalSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                                    >
                                        <X size={14} className="text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    setShowSearch(!showSearch);
                                    if (showSearch) setLocalSearch('');
                                }}
                                className={`back-btn-clear p-2 transition-all ${showSearch ? 'text-[#0c831f]' : 'text-gray-600'}`}
                            >
                                <Search size={22} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`back-btn-clear p-2 transition-all ${isFilterOpen ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                <SlidersHorizontal size={22} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Subcategories Horizontal Scroll Row (Mobile App Style) */}
                    {availableSubCategories.length > 0 && (
                        <div className="mt-4 mb-4">
                            <div className="category-products-subcategories flex items-center gap-3 overflow-x-auto scrollbar-hide px-1 py-1">
                                {/* "All" as a compact card */}
                                <button
                                    onClick={() => setSelectedSubCat('all')}
                                    className="flex-shrink-0 flex flex-col items-center group w-16 sm:w-20 transition-all duration-300 active:scale-95"
                                >
                                    <div 
                                        className={`w-full aspect-square rounded-2xl flex items-center justify-center border transition-all ${selectedSubCat === 'all' ? 'bg-green-50 border-[#0c831f] shadow-sm' : 'bg-gray-50 dark:bg-white/5 border-transparent'}`}
                                    >
                                        <Leaf size={20} className={selectedSubCat === 'all' ? 'text-[#0c831f]' : 'text-gray-400'} />
                                    </div>
                                    <span className={`text-[10px] font-black mt-2 transition-colors ${selectedSubCat === 'all' ? 'text-[#0c831f]' : 'text-gray-600'}`}>
                                        All
                                    </span>
                                </button>

                                {availableSubCategories.map((sc) => {
                                    const scSlug = sc.slug || sc.name?.toLowerCase().replace(/\s+/g, '-');
                                    const isActive = selectedSubCat === sc.name || selectedSubCat === scSlug;
                                    
                                    return (
                                        <button
                                            key={sc._id}
                                            onClick={() => {
                                                setSelectedSubCat(sc.name);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="flex-shrink-0 flex flex-col group w-20 sm:w-28 h-[100px] sm:h-[140px] transition-all duration-300 active:scale-95 rounded-2xl overflow-hidden border border-gray-100/50 dark:border-white/5 shadow-sm"
                                            style={{ 
                                                backgroundColor: isActive ? 'rgba(12, 131, 31, 0.08)' : (isDarkMode ? 'rgba(255,255,255,0.03)' : (categoryColors[scSlug] || categoryColors[slug] || '#f8f9fa')),
                                                borderColor: isActive ? '#0c831f' : undefined
                                            }}
                                        >
                                            <span className={`text-[9px] sm:text-[11px] font-black pt-2 px-1 text-center capitalize transition-colors ${isActive ? 'text-[#0c831f]' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {sc.name?.toLowerCase()}
                                            </span>
                                            <div className="flex-1 w-full p-2 flex items-center justify-center">
                                                <img 
                                                    src={sc.image || currentCategory?.image || categoryPlaceholder} 
                                                    alt={sc.name}
                                                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                                                    onError={(e) => { e.target.src = categoryPlaceholder; }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Highly Compact Pill Filter Row */}
                    <div className="category-products-filter-row mt-3 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                        <button
                            onClick={() => setIsVegOnly(!isVegOnly)}
                            className={`shop-pill-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${isVegOnly ? 'bg-[#0c831f] border-[#0c831f] text-white' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400'}`}
                        >
                            <Leaf size={12} className={isVegOnly ? 'text-white' : 'text-green-600'} />
                            Veg Only
                        </button>

                        {[
                            { id: '-createdAt', label: 'Recent' },
                            { id: 'basePrice', label: 'Price: Low' },
                            { id: '-basePrice', label: 'Price: High' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSortOption(opt.id)}
                                className={`sort-pill-btn px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${sortOption === opt.id ? 'bg-black text-white border-black' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400'}`}
                            >
                                {opt.label}
                            </button>
                        ))}

                        {availableBrands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => {
                                    setSelectedBrands(prev =>
                                        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                                    );
                                }}
                                className={`sort-pill-btn px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${selectedBrands.includes(brand) ? 'bg-black text-white border-black shadow-md' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-white/5'}`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Applied Counter */}
            {(debouncedSearch || isVegOnly || sortOption !== '-createdAt' || selectedBrands.length > 0) && (
                <div className="max-w-7xl mx-auto px-4 mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0c831f] animate-pulse" />
                    Filters Applied: {(debouncedSearch ? 1 : 0) + (isVegOnly ? 1 : 0) + (sortOption !== '-createdAt' ? 1 : 0) + (selectedBrands.length)}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-6 gap-x-5 sm:gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : normalizedProducts.length > 0 ? (
                    <>
                        <div className="category-products-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-6 gap-x-5 sm:gap-4 animate-in fade-in duration-500">
                            {normalizedProducts.map((product) => (
                                <ProductCard
                                    key={product._id || product.id}
                                    product={product}
                                    isCompact={true}
                                />
                            ))}
                        </div>

                        {/* Pagination / Load More */}
                        {page < totalPages && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={() => loadCategoryProducts(page + 1, true)}
                                    disabled={isFetchingMore}
                                    className="category-products-loadmore group flex items-center gap-3 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] text-gray-900 dark:text-white shadow-xl shadow-gray-200/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isFetchingMore ? (
                                        <div className="w-4 h-4 border-2 border-[#0c831f] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <TrendingUp size={16} className="text-[#0c831f]" />
                                    )}
                                    {isFetchingMore ? 'Cooking more results...' : 'Load More Products'}
                                </button>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                Showing {normalizedProducts.length} of {totalResults} items
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="py-20 text-center max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Search size={32} className="text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">No matches found</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-8">Try clearing search or filters</p>
                        <button
                            onClick={() => {
                                setLocalSearch('');
                                setSortOption('-createdAt');
                                setIsVegOnly(false);
                            }}
                            className="bg-[#0c831f] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
            {/* Mobile Bottom Float Info */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                {debouncedSearch && (
                    <div className="bg-black/90 text-white text-[8px] font-black px-4 py-2 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
                        <Info size={10} className="text-yellow-400" />
                        FILTERED BY "{debouncedSearch.toUpperCase()}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
