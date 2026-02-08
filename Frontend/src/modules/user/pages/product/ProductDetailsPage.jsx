import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ChevronRight, Star, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react';
import { ProductDetailSkeleton } from '../../components/common/Skeleton';
import ProductCard from '../../components/product/ProductCard';
import categoryPlaceholder from '../../assets/images/category-placeholder.png';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart, updateQuantity, cart } = useCart();
    const [loading, setLoading] = useState(true);

    const product = products.find(p => p.id === parseInt(id));
    const [selectedImage, setSelectedImage] = useState(product?.image);
    const productImages = product?.images || [
        product?.image,
        product?.image,
        product?.image
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setSelectedImage(product?.image);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [id, product]);

    // Scroll to top on every product change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    const similarProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter(p => p.category === product.category && p.id !== product.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
    }, [product]);

    const recommendedProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter(p => p.subCategory === product.subCategory && p.id !== product.id && !similarProducts.find(sp => sp.id === p.id))
            .concat(products.filter(p => p.category !== product.category))
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
    }, [product, similarProducts]);

    if (!product) return <div className="p-8 text-center text-gray-500">Product not found</div>;

    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white dark:from-[#141414] dark:to-[#141414] transition-colors duration-300">
            <ProductDetailSkeleton />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-none md:bg-white md:dark:bg-[#09090b] pb-20 transition-colors duration-300">
            {/* Minimal Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center text-[11px] text-gray-400 gap-2 uppercase tracking-widest">
                    <Link to="/" className="hover:text-[#0c831f]">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-300">{product.name}</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">

                    {/* Left: Image Section */}
                    <div className="flex flex-col gap-6">
                        <div className="relative aspect-square bg-white dark:bg-[#111] rounded-[32px] overflow-hidden flex items-center justify-center group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0c831f]/10 dark:border-white/5 p-4 md:p-12 max-w-[260px] md:max-w-[400px] mx-auto w-full transition-all duration-500 hover:shadow-xl">
                            <img
                                src={selectedImage || categoryPlaceholder}
                                alt={product.name}
                                className={`w-full h-full transition-all duration-700 group-hover:scale-110 ${!selectedImage ? 'object-cover' : 'object-contain'}`}
                                onError={(e) => {
                                    e.target.src = categoryPlaceholder;
                                    e.target.classList.add('opacity-80');
                                    e.target.style.objectFit = 'cover';
                                }}
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                            {productImages.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm ${selectedImage === img
                                        ? 'border-[#0c831f] bg-[#fdfdfd] dark:bg-[#0c831f]/10 shadow-md scale-105 ring-1 ring-[#0c831f]/20'
                                        : 'border-[#0c831f]/30 dark:border-white/10 hover:border-[#0c831f] bg-white dark:bg-[#222]'
                                        }`}
                                >
                                    <img
                                        src={img || categoryPlaceholder}
                                        alt="thumb"
                                        className={`w-full h-full transition-all duration-300 ${!img ? 'object-cover' : 'object-contain'}`}
                                        onError={(e) => {
                                            e.target.src = categoryPlaceholder;
                                            e.target.style.objectFit = 'cover';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details Section */}
                    <div className="flex flex-col text-left py-0 md:py-2">
                        <h1 className="text-[15px] md:text-xl font-bold text-gray-900 dark:text-gray-200 mb-1 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 bg-[#2a2a2a] px-2.5 py-1 rounded-md">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-400">0.0</span>
                            </div>
                            <div className="border border-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#0c831f] dark:text-[#10b981]">
                                In Stock
                            </div>
                        </div>

                        <div className="text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wide">
                            {product.weight}
                        </div>

                        <div className="text-lg font-bold text-[#0c831f] dark:text-[#10b981] mb-3">
                            ₹ {product.price}.00
                        </div>

                        <div className="mb-1">
                            <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-widest">Total Amount:</p>
                            <div className="text-2xl md:text-3xl font-black text-[#0c831f] dark:text-[#10b981]">
                                ₹ {product.price * (quantity || 1)}.00
                            </div>
                        </div>

                        <div className="mt-4 mb-6">
                            {quantity === 0 ? (
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full md:w-fit flex items-center justify-center gap-2 bg-[#0c831f] hover:bg-[#0a6b19] text-white font-bold py-4 px-12 !rounded-full transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                >
                                    <ShoppingCart size={18} className="fill-white" />
                                    <span className="uppercase tracking-widest text-xs">Add to Cart</span>
                                </button>
                            ) : (
                                <div className="flex items-center bg-[#0c831f] rounded-2xl p-1 w-fit shadow-lg shadow-green-500/20">
                                    <button
                                        onClick={() => updateQuantity(product.id, -1)}
                                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        <Minus size={20} strokeWidth={3} />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg text-white">{quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(product.id, 1)}
                                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Additional Info (Minimal) */}
                        <div className="border-t border-gray-100 dark:border-white/5 pt-4 md:pt-8">
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4">Product Details</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Fresh and natural coconut water combo. Perfect for a refreshing drink any time of the day. Packed with electrolytes and nutrients.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-12 space-y-8 md:space-y-12">

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-3 md:mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#eefaf1] dark:bg-[#0c831f]/10 flex items-center justify-center text-[#0c831f] shadow-sm">
                                    <TrendingUp size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">Similar Items</h2>
                                    <p className="text-[10px] md:text-xs text-gray-400 font-medium">Explore more items in this category</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0">
                            {similarProducts.map((p) => (
                                <div key={p.id} className="w-[155px] md:w-[200px] flex-shrink-0">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* General Recommendations */}
                {recommendedProducts.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                        <div className="flex items-center justify-between mb-3 md:mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-sm">
                                    <Sparkles size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">You may also like</h2>
                                    <p className="text-[10px] md:text-xs text-gray-400 font-medium">Flash deals on top brands for you</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0">
                            {recommendedProducts.map((p) => (
                                <div key={p.id} className="w-[155px] md:w-[200px] flex-shrink-0">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
