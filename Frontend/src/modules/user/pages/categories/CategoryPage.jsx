import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight } from 'lucide-react';

const CategoryPage = () => {
    const { slug } = useParams();

    // If slug is present, filter by category, else show all
    const displayedProducts = slug
        ? products.filter(p => p.category === slug)
        : products;

    const currentCategory = slug
        ? categories.find(c => c.slug === slug)
        : { name: 'All Products' };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                        <Link to="/" className="hover:text-[var(--saathi-green)]">Home</Link>
                        <ChevronRight size={14} />
                        <span className="font-semibold text-gray-800">{currentCategory?.name || 'Category'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar for Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 sticky top-32 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-800">Categories</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {categories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/category/${cat.slug}`}
                                        className={`block px-4 py-3 text-sm hover:bg-[#0c831f] hover:text-white transition-colors ${slug === cat.slug ? 'bg-[#0c831f] text-white font-semibold border-l-4 border-[var(--saathi-yellow)]' : 'text-gray-600'}`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">{currentCategory?.name} <span className="text-gray-400 text-lg font-normal">({displayedProducts.length})</span></h1>
                        </div>

                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {displayedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-12 text-center text-gray-500">
                                <p>No products found in this category.</p>
                                <Link to="/" className="text-[var(--saathi-green)] mt-2 inline-block font-medium">Go back Home</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
