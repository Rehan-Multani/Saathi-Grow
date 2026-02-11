import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ChevronDown } from 'lucide-react';
import { products } from '../../data/products';
import ProductCard from '../../components/product/ProductCard';
import { getOccasionConfig } from '../../data/occasions';
import { useTheme } from '../../context/ThemeContext';

const OccasionPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    // Configuration for different occasions based on slug
    const occasionConfig = useMemo(() => getOccasionConfig(slug), [slug]);

    const displayProducts = useMemo(() => {
        if (!occasionConfig) return [];
        return products.filter(p => occasionConfig.productIds.includes(p.id));
    }, [occasionConfig]);

    if (!occasionConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-white dark:bg-black text-black dark:text-white">
                <h2 className="text-xl font-bold">Occasion Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-[var(--saathi-green)] text-white rounded-lg font-bold"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-20 transition-colors duration-300"
            style={{
                background: isDarkMode ? '#000000' : `linear-gradient(to bottom, ${occasionConfig.bgColor} 0%, #ffffff 100%)`
            }}
        >
            {/* Header */}
            <div
                className="sticky top-0 z-40 px-4 pt-[82px] pb-3 flex items-center gap-4 shadow-sm transition-colors duration-300 backdrop-blur-md bg-opacity-95"
                style={{ backgroundColor: isDarkMode ? '#000000' : occasionConfig.bgColor }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors active:scale-95"
                >
                    <ArrowLeft size={20} style={{ color: isDarkMode ? '#ffffff' : occasionConfig.themeColor }} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-black leading-none tracking-tight" style={{ color: isDarkMode ? '#ffffff' : occasionConfig.themeColor }}>
                        {occasionConfig.title}
                    </h1>
                    <p className="text-xs font-bold opacity-70" style={{ color: isDarkMode ? '#94a3b8' : occasionConfig.themeColor }}>
                        {occasionConfig.subtitle}
                    </p>
                </div>
            </div>

            {/* Banner Section */}
            <div className={`px-6 py-2 ${isDarkMode ? 'bg-[#111111]' : ''}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="max-w-[100%]">
                        <div className="text-4xl mb-2 animate-bounce duration-[2000ms]">{occasionConfig.icon}</div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter">
                            {occasionConfig.title}
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium max-w-2xl">
                            {occasionConfig.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter / Sort Bar (Visual Only for now) */}
            <div className="sticky top-[134px] z-30 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-gray-100/20 py-3 px-4 shadow-sm mb-6 transition-colors duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{displayProducts.length} Items Found</p>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm">
                            Filters <Filter size={12} strokeWidth={2.5} />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm">
                            Sort By <ChevronDown size={12} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {displayProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            customTheme={{ themeColor: isDarkMode ? '#f7cb15' : occasionConfig.themeColor }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OccasionPage;
