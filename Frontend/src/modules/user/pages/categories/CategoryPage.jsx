import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight, Filter } from 'lucide-react';
import { ProductCardSkeleton } from '../../components/common/Skeleton';

const CategoryPage = () => {
    const { slug } = useParams();
    const [selectedSubCat, setSelectedSubCat] = useState('all');
    const [loading, setLoading] = useState(true);

    // Find the current main category
    const currentCategory = categories.find(c => c.slug === slug) || categories[0];

    // Reset subcategory and loading when main category changes
    useEffect(() => {
        setLoading(true);
        setSelectedSubCat('all');
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [slug]);

    // Filter products based on main category and selected subcategory
    const displayedProducts = products.filter(p => {
        const matchesMain = p.category === slug;
        const matchesSub = selectedSubCat === 'all' || p.subCategory === selectedSubCat;
        return matchesMain && matchesSub;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#212121] pb-20 transition-colors duration-300">
            {/* Breadcrumbs */}
            <div className="bg-white dark:bg-[#212121] border-b border-gray-100 dark:border-gray-800 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center text-[10px] md:text-sm text-gray-400 gap-1 uppercase tracking-wider font-medium">
                        <Link to="/" className="hover:text-[var(--saathi-green)] transition-colors">Home</Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-800 dark:text-white font-semibold">{currentCategory?.name}</span>
                        {selectedSubCat !== 'all' && (
                            <>
                                <ChevronRight size={14} />
                                <span className="text-[var(--saathi-green)] dark:text-[#10b981] font-bold">
                                    {currentCategory?.subCategories?.find(s => s.slug === selectedSubCat)?.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-Category Horizontal List */}
            <div className="bg-white dark:bg-[#212121] border-b border-gray-100 dark:border-gray-800 sticky top-[112px] z-30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={() => setSelectedSubCat('all')}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all border ${selectedSubCat === 'all' ? 'bg-[#0c831f] border-[#0c831f] dark:bg-[#0c831f] dark:border-[#0c831f] text-white shadow-sm' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#0c831f] hover:text-[#0c831f] dark:hover:border-[#10b981] dark:hover:text-[#10b981]'}`}
                        >
                            All {currentCategory?.name}
                        </button>
                        {currentCategory?.subCategories?.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSubCat(sub.slug)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all border ${selectedSubCat === sub.slug ? 'bg-[#0c831f] border-[#0c831f] dark:bg-[#0c831f] dark:border-[#0c831f] text-white shadow-sm' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#0c831f] hover:text-[#0c831f] dark:hover:border-[#10b981] dark:hover:text-[#10b981]'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Product Section */}
                <div className="mb-6">
                    <h1 className="text-xs md:text-sm font-bold text-slate-800 dark:text-gray-300 tracking-tight flex items-center gap-2">
                        {loading ? 'Loading...' : (selectedSubCat === 'all' ? currentCategory?.name : currentCategory?.subCategories?.find(s => s.slug === selectedSubCat)?.name)}
                        {!loading && (
                            <span className="text-gray-400 dark:text-gray-600 text-[10px] md:text-xs font-medium bg-gray-100 dark:bg-gray-900/50 px-2 py-0.5 rounded-md">
                                {displayedProducts.length} items
                            </span>
                        )}
                    </h1>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                        {displayedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#212121] rounded-3xl p-16 text-center shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No items found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">We couldn't find any products in this sub-category right now.</p>
                        <button
                            onClick={() => setSelectedSubCat('all')}
                            className="bg-[var(--saathi-green)] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
                        >
                            Browse All Items
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
