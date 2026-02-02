import React from 'react';
import { Link } from 'react-router-dom';
import { banners } from '../../data/banners';
import { categories } from '../../data/categories';
import { products } from '../../data/products';
import ProductCard from '../../components/product/ProductCard';
import { useSearch } from '../../context/SearchContext';
import { ChevronRight, Carrot, Milk, Cookie, CupSoda, Snowflake, Coffee, Croissant, Wheat, SprayCan, Sparkles } from 'lucide-react';

const categoryIcons = {
    'vegetables-fruits': { icon: Carrot, color: '#16a34a' },
    'dairy-breakfast': { icon: Milk, color: '#16a34a' },
    'munchies': { icon: Cookie, color: '#16a34a' },
    'cold-drinks-juices': { icon: CupSoda, color: '#16a34a' },
    'instant-frozen-food': { icon: Snowflake, color: '#16a34a' },
    'tea-coffee-health-drinks': { icon: Coffee, color: '#16a34a' },
    'bakery-biscuits': { icon: Croissant, color: '#16a34a' },
    'atta-rice-dal': { icon: Wheat, color: '#16a34a' },
    'cleaning-household': { icon: SprayCan, color: '#16a34a' },
    'personal-care': { icon: Sparkles, color: '#16a34a' }
};

const HomePage = () => {
    const { searchQuery } = useSearch();

    // Search Logic
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSearching = searchQuery.length > 0;

    // Group products by category
    const getProductsByCategory = (categorySlug) => {
        return products.filter(p => p.category === categorySlug).slice(0, 8);
    };

    return (
        <div className="pb-20 bg-[#efefef] min-h-screen">
            {/* Hero Section - Hide if searching */}
            {!isSearching && (
                <div className="w-full bg-[#efefef] overflow-hidden">
                    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg relative aspect-[2.5/1] md:aspect-[3/1]">
                            <img
                                src={banners[0].image}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-4 md:px-16 text-white">
                                <h1 className="text-2xl md:text-5xl font-bold mb-1 md:mb-2 leading-tight">Groceries in <br /><span className="text-[var(--saathi-yellow)]">10 Minutes</span></h1>
                                <p className="text-xs md:text-lg opacity-90 mb-2 md:mb-6 max-w-[180px] md:max-w-md line-clamp-2">Get fresh vegetables, fruits, and daily essentials delivered.</p>
                                <Link to="/category" className="bg-[var(--saathi-green)] text-white px-4 py-1.5 md:px-8 md:py-3 rounded-full font-bold w-fit text-xs md:text-base shadow-lg shadow-green-900/20">Shop Now</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories */}
            {(filteredCategories.length > 0 || !isSearching) && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <h2 className="text-sm md:text-2xl font-bold text-gray-800">Shop by Category</h2>
                        {!isSearching && <Link to="/category" className="text-[var(--saathi-green)] text-xs md:text-base font-semibold">See All</Link>}
                    </div>
                    <div className="flex overflow-x-auto gap-5 md:gap-10 pb-2 scrollbar-hide -ml-3">
                        {filteredCategories.map((cat) => {
                            const iconData = categoryIcons[cat.slug] || { icon: Carrot, color: '#16a34a' };
                            const IconComponent = iconData.icon;
                            return (
                                <Link key={cat.id} to={`/category/${cat.slug}`} className="flex flex-col items-center flex-shrink-0 w-16 md:w-24 group">
                                    <div
                                        className="w-16 h-16 md:w-24 md:h-24 bg-white/60 rounded-xl md:rounded-2xl flex items-center justify-center mb-1.5 md:mb-3 ring-1 ring-transparent group-hover:ring-[#16a34a] ring-offset-0 shadow-sm relative overflow-hidden transition-all duration-300 group-hover:scale-105"
                                        style={{ color: iconData.color }}
                                    >
                                        <IconComponent size={32} strokeWidth={1.5} className="md:w-10 md:h-10" />
                                    </div>
                                    <span className="text-[9px] md:text-sm font-medium text-center text-gray-700 leading-tight line-clamp-2 h-[24px] md:h-[40px] overflow-hidden flex items-center justify-center w-full">{cat.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Search Results */}
            {isSearching && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50/50 rounded-t-3xl border-t border-gray-100">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                        Search Results for "{searchQuery}"
                    </h2>
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500">No products found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Category Sections - Only show when not searching */}
            {!isSearching && (
                <div>
                    {categories.map((category) => {
                        const categoryProducts = getProductsByCategory(category.slug);

                        // Only show category section if it has products
                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                                {/* Category Header */}
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h2 className="text-base md:text-xl font-bold text-gray-900">
                                        {category.name}
                                    </h2>
                                    <Link
                                        to={`/category/${category.slug}`}
                                        className="flex items-center gap-1 text-[var(--saathi-green)] text-xs md:text-sm font-semibold hover:gap-2 transition-all"
                                    >
                                        see all
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>

                                {/* Products Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                                    {categoryProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HomePage;
