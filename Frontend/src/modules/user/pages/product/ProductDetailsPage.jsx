import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ChevronRight, Star, Heart, ShoppingCart } from 'lucide-react';
import { ProductDetailSkeleton } from '../../components/common/Skeleton';

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

    if (!product) return <div className="p-8 text-center text-gray-500">Product not found</div>;

    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    if (loading) return (
        <div className="min-h-screen bg-[#efefef] dark:bg-black transition-colors duration-300">
            <ProductDetailSkeleton />
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#1a1a1a] pb-20 transition-colors duration-300">
            {/* Minimal Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center text-[11px] text-gray-400 gap-2 uppercase tracking-widest">
                    <Link to="/" className="hover:text-[#0c831f]">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-300">{product.name}</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                    {/* Left: Image Section */}
                    <div className="flex flex-col gap-6">
                        <div className="relative aspect-square bg-white dark:bg-[#111] rounded-[32px] overflow-hidden flex items-center justify-center group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0c831f]/10 dark:border-white/5 p-8 md:p-12 max-w-[400px] mx-auto w-full transition-all duration-500 hover:shadow-xl">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                            {productImages.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center p-2.5 cursor-pointer transition-all duration-300 shadow-sm ${selectedImage === img
                                        ? 'border-[#0c831f] bg-[#fdfdfd] dark:bg-[#0c831f]/10 shadow-md scale-105 ring-1 ring-[#0c831f]/20'
                                        : 'border-[#0c831f]/30 dark:border-white/10 hover:border-[#0c831f] bg-white dark:bg-[#222]'
                                        }`}
                                >
                                    <img src={img} alt="thumb" className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details Section */}
                    <div className="flex flex-col text-left py-0 md:py-2">
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-200 mb-2 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1 bg-[#2a2a2a] px-2.5 py-1 rounded-md">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-400">0.0</span>
                            </div>
                            <div className="border border-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#0c831f] dark:text-[#10b981]">
                                In Stock
                            </div>
                        </div>

                        <div className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                            {product.weight}
                        </div>

                        <div className="text-xl font-bold text-[#0c831f] dark:text-[#10b981] mb-6">
                            ₹ {product.price}.00
                        </div>

                        <div className="mb-1">
                            <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-widest">Total Amount:</p>
                            <div className="text-2xl md:text-3xl font-black text-[#0c831f] dark:text-[#10b981]">
                                ₹ {product.price * (quantity || 1)}.00
                            </div>
                        </div>

                        <div className="mt-8 mb-8">
                            {quantity === 0 ? (
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full md:w-fit flex items-center justify-center gap-2 bg-[#0c831f] hover:bg-[#0a6b19] text-white font-bold py-3 px-12 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                >
                                    <ShoppingCart size={18} className="fill-white" />
                                    <span className="uppercase tracking-widest text-xs">Add to Cart</span>
                                </button>
                            ) : (
                                <div className="flex items-center bg-[#0c831f] rounded-lg p-1 w-fit shadow-lg shadow-green-500/20">
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
                        <div className="border-t border-gray-100 dark:border-white/5 pt-8">
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4">Product Details</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Fresh and natural coconut water combo. Perfect for a refreshing drink any time of the day. Packed with electrolytes and nutrients.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
