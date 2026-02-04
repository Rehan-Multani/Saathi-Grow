import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight, Filter, ArrowLeft, LayoutGrid } from 'lucide-react';
import { ProductCardSkeleton } from '../../components/common/Skeleton';

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
    const [selectedSubCat, setSelectedSubCat] = useState('all');
    const [loading, setLoading] = useState(true);

    // If no slug, we represent the "All Categories" view
    const isMainListView = !slug;

    // Find the current main category
    const currentCategory = categories.find(c => c.slug === slug);

    useEffect(() => {
        setLoading(true);
        setSelectedSubCat('all');
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [slug]);

    if (isMainListView) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] dark:bg-black p-4 pt-6 pb-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-[#141414] rounded-full shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">Shop by Category</h1>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/category/${cat.slug}`}
                                className="flex flex-col items-center group"
                            >
                                <div
                                    className="w-full aspect-square rounded-[24px] sm:rounded-[32px] flex items-center justify-center mb-3 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 shadow-sm border border-transparent hover:border-green-100 dark:hover:border-white/10 overflow-hidden"
                                    style={{ backgroundColor: categoryColors[cat.slug] || '#f3f4f6' }}
                                >
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <span className="text-[11px] sm:text-[14px] font-bold text-center text-gray-800 dark:text-gray-300 leading-tight tracking-tight px-1">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Filter products based on main category and selected subcategory
    const displayedProducts = products.filter(p => {
        const matchesMain = p.category === slug;
        const matchesSub = selectedSubCat === 'all' || p.subCategory === selectedSubCat;
        return matchesMain && matchesSub;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-black pb-20 transition-colors duration-300">
            {/* Combined Sticky Headers: Breadcrumbs + Subcategories */}
            <div className="sticky top-16 z-40 bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/5 shadow-sm">
                {/* Breadcrumbs */}
                <div className="px-4 py-2.5 border-b border-gray-50 dark:border-white/5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center text-[9px] md:text-xs text-gray-400 gap-1.5 uppercase tracking-widest font-black">
                            <Link to="/" className="hover:text-[#0c831f] transition-colors">Home</Link>
                            <ChevronRight size={10} strokeWidth={3} />
                            <Link to="/category" className="hover:text-[#0c831f] transition-colors">Categories</Link>
                            <ChevronRight size={10} strokeWidth={3} />
                            <span className="text-gray-900 dark:text-white line-clamp-1">{currentCategory?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Sub-Category Slider */}
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setSelectedSubCat('all')}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${selectedSubCat === 'all' ? 'bg-[#0c831f] border-[#0c831f] text-white shadow-md' : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-bold'}`}
                        >
                            All
                        </button>
                        {currentCategory?.subCategories?.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSubCat(sub.slug)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${selectedSubCat === sub.slug ? 'bg-[#0c831f] border-[#0c831f] text-white shadow-md' : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-bold'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Heading */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            {loading ? 'Thinking...' : (selectedSubCat === 'all' ? currentCategory?.name : currentCategory?.subCategories?.find(s => s.slug === selectedSubCat)?.name)}
                        </h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{displayedProducts.length} Products Available</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-in fade-in duration-500">
                        {displayedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#141414] rounded-[40px] p-20 text-center shadow-sm border border-gray-100 dark:border-white/5 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Filter size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Empty Shelf</h3>
                        <p className="text-sm text-gray-500 font-medium mb-10">We're restocking this shelf. Check back soon!</p>
                        <button
                            onClick={() => setSelectedSubCat('all')}
                            className="bg-[#0c831f] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                        >
                            Explore All {currentCategory?.name}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
