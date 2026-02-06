import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';
import ProductCard from '../product/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

const MobileRecommendations = () => {
    // Get Best Seller products for recommendations
    const recommendedProducts = products
        .filter(p => p.isBestSeller)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    return (
        <div className="md:hidden bg-gray-50 dark:bg-[#0c0c0c] py-8 px-4 border-t border-gray-100 dark:border-white/5 pb-24">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
                        <Sparkles size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-[14px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Best Deals for You</h2>
                        <p className="text-[10px] text-gray-400 font-medium">Flash deals on top brands</p>
                    </div>
                </div>
                <Link to="/category" className="bg-white dark:bg-white/5 p-2 rounded-full shadow-sm">
                    <ArrowRight size={16} className="text-[#0c831f]" />
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {recommendedProducts.map((product) => (
                    <div key={product.id} className="min-w-0">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-[11px] text-gray-400 font-medium mb-3">Don't miss out on these essentials!</p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-[#0c831f] text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default MobileRecommendations;
