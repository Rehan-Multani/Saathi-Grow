import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ChevronDown, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';
import ProductCard from '../../components/product/ProductCard';

const LowestPricesPage = () => {
    const navigate = useNavigate();

    const { isDarkMode } = useTheme();

    const themeColor = isDarkMode ? "#ffffff" : "#dc2626"; // White for dark, Red for light
    const bgColor = isDarkMode ? "#000000" : "#fef2f2"; // Black for dark, Red 50 for light
    const accentColor = isDarkMode ? "#000000" : "#fecaca"; // Black for dark, Red 200 for light

    // Filter for products with discounts
    const discountedProducts = useMemo(() => {
        return products
            .filter(p => p.originalPrice && p.originalPrice > p.price)
            .sort((a, b) => {
                const discountA = ((a.originalPrice - a.price) / a.originalPrice);
                const discountB = ((b.originalPrice - b.price) / b.originalPrice);
                return discountB - discountA; // Sort by highest discount percentage
            });
    }, []);

    return (
        <div
            className="min-h-screen pb-20 transition-colors duration-300"
            style={{
                background: `linear-gradient(to bottom, ${bgColor}, ${accentColor})`,
                minHeight: '100vh'
            }}
        >
            {/* Header */}
            <div
                className="sticky top-0 z-40 px-4 pt-[82px] pb-3 flex items-center gap-4 shadow-sm transition-colors duration-300 backdrop-blur-md bg-opacity-95"
                style={{ backgroundColor: bgColor }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors active:scale-95"
                >
                    <ArrowLeft size={20} style={{ color: themeColor }} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-black leading-none tracking-tight flex items-center gap-2" style={{ color: themeColor }}>
                        Lowest Prices Ever <TrendingDown size={18} />
                    </h1>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'opacity-70'}`} style={{ color: isDarkMode ? '' : themeColor }}>
                        Massive discounts on top products
                    </p>
                </div>
            </div>

            {/* Filter/Sort Bar */}
            <div
                className="sticky top-[134px] z-30 px-4 py-2 backdrop-blur-md transition-colors duration-300"
                style={{ backgroundColor: `${bgColor}90` }}
            >
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/60 rounded-full text-xs font-bold border border-white/20 shadow-sm transition-all whitespace-nowrap" style={{ color: themeColor }}>
                        <Filter size={12} strokeWidth={2.5} />
                        Filter
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/60 rounded-full text-xs font-bold border border-white/20 shadow-sm transition-all whitespace-nowrap" style={{ color: themeColor }}>
                        Sort By <ChevronDown size={12} strokeWidth={2.5} />
                    </button>
                    <div className="w-[1px] h-4 bg-black/5 mx-1"></div>
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider" style={{ color: themeColor }}>
                        {discountedProducts.length} Items
                    </span>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-12 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {discountedProducts.map(product => (
                        <div key={product.id} className="relative">
                            {/* Discount Badge */}
                            <div className="absolute top-2 right-2 z-50 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </div>
                            <ProductCard
                                product={product}
                                customTheme={{ themeColor: themeColor, bgColor: bgColor }}
                                imgPadding="p-4"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LowestPricesPage;
