import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { fetchProducts, fetchBrands } from '../../api/shopApi';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight, Filter, ArrowLeft, Search, X, SlidersHorizontal, Leaf, Info, TrendingUp } from 'lucide-react';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { useStore } from '../../context/StoreContext';
import { ASSET_URLS } from '../../../../constants/assetUrls';
import { normalizeProduct } from '../home/HomePage';
import SEO from '../../../../common/components/SEO';
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

    // Fetch Brands for current category
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchBrands(categoryName || '');
                setAvailableBrands(data);
            } catch (err) {
                console.error("Error loading brands:", err);
            }
        };
        loadBrands();
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
                params.storeId = activeStore.id;
                params.storeType = activeStore.type;
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
            <div className="min-h-screen bg-gradient-to-br from-[#f6fbf7] to-[#e8f5e9] md:bg-none md:bg-white dark:bg-none dark:bg-black p-4 pt-6 pb-24">
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

                    {isLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 px-1">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-20 aspect-square bg-gray-100 dark:bg-white/5 rounded-xl sm:rounded-[32px] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 px-1">
                            {categories.map((cat) => {
                                const catSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                                return (
                                    <Link
                                        key={cat._id || cat.id}
                                        to={`/category/${encodeURIComponent(cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'))}`}
                                        className="flex flex-col items-center group active:scale-95 transition-all"
                                    >
                                        <div
                                            className="w-20 sm:w-28 aspect-square rounded-xl sm:rounded-[32px] flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:shadow-lg shadow-sm border border-transparent hover:border-green-100/30 dark:hover:border-white/10 overflow-hidden"
                                            style={{ backgroundColor: categoryColors[cat.slug] || '#f3f4f6' }}
                                        >
                                            <img
                                                src={cat.image || categoryPlaceholder}
                                                alt={cat.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    if (e.target.src !== categoryPlaceholder) {
                                                        e.target.src = categoryPlaceholder;
                                                        e.target.classList.add('opacity-80');
                                                        e.target.style.objectFit = 'cover';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] sm:text-[14px] font-bold text-center text-gray-800 dark:text-gray-300 leading-tight tracking-tight px-1 capitalize">
                                            {cat.name?.toLowerCase() || 'Category'}
                                        </span>
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
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white dark:bg-none dark:bg-black pb-28 transition-colors duration-300">
            <SEO
                title={currentCategory?.name || 'Category'}
                description={`Shop for ${currentCategory?.name || 'products'} at Saathi-Grow. Best quality and fast delivery for all your needs.`}
                image={currentCategory?.image}
            />
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-4 py-3">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/category')}
                                className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-300"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            {!showSearch ? (
                                <div className="flex flex-col">
                                    <h1 className="text-sm md:text-lg font-black text-gray-900 dark:text-gray-100 leading-none">
                                        {currentCategory?.name || 'Store'}
                                    </h1>
                                    <div className="flex items-center text-[8px] text-gray-400 gap-1.5 uppercase tracking-widest font-bold">
                                        <span>{totalResults} Products</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Search Bar - Toggleable */}
                        <div className={`flex-1 transition-all duration-300 ${showSearch ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute invisible max-w-0'}`}>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search in ${currentCategory?.name || 'Store'}...`}
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0c831f] transition-all"
                                    autoFocus
                                />
                                {localSearch && (
                                    <button
                                        onClick={() => setLocalSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full"
                                    >
                                        <X size={12} className="text-gray-500" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setShowSearch(!showSearch);
                                    if (showSearch) setLocalSearch('');
                                }}
                                className={`p-2 rounded-full transition-all ${showSearch ? 'bg-[#0c831f] text-white shadow-lg shadow-green-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-600'}`}
                            >
                                <Search size={16} />
                            </button>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-2 rounded-full transition-all ${isFilterOpen ? 'bg-black text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}
                            >
                                <SlidersHorizontal size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Drawer - Implementation of "other filters" */}
                    {isFilterOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 pb-2">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Sort By</span>
                                        <div className="flex gap-2">
                                            {[
                                                { id: '-createdAt', label: 'Newest' },
                                                { id: 'basePrice', label: 'Price: Low-High' },
                                                { id: '-basePrice', label: 'Price: High-Low' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSortOption(opt.id)}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${sortOption === opt.id ? 'bg-[#0c831f] text-white shadow-md' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-transparent'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5 ml-auto">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Dietary</span>
                                        <button
                                            onClick={() => setIsVegOnly(!isVegOnly)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isVegOnly ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-transparent'}`}
                                        >
                                            <Leaf size={12} className={isVegOnly ? 'text-white' : 'text-green-600'} />
                                            Veg Only
                                        </button>
                                    </div>
                                </div>

                                {availableBrands.length > 0 && (
                                    <div className="flex flex-col gap-1.5 w-full">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Brands</span>
                                        <div className="flex flex-wrap gap-2">
                                            {availableBrands.map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => {
                                                        setSelectedBrands(prev =>
                                                            prev.includes(brand)
                                                                ? prev.filter(b => b !== brand)
                                                                : [...prev, brand]
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${selectedBrands.includes(brand) ? 'bg-black text-white border-black shadow-md' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-white/10'}`}
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-6 gap-x-5 sm:gap-4 animate-in fade-in duration-500">
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
                                    className="group flex items-center gap-3 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] text-gray-900 dark:text-white shadow-xl shadow-gray-200/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
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
