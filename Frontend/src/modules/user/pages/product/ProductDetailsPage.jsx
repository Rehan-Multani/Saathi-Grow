import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ChevronRight } from 'lucide-react';
import { ProductDetailSkeleton } from '../../components/common/Skeleton';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart, updateQuantity, cart } = useCart();
    const [loading, setLoading] = useState(true);

    const product = products.find(p => p.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [id]);

    if (!product) return <div className="p-8 text-center text-gray-500">Product not found</div>;

    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    if (loading) return (
        <div className="min-h-screen bg-[#efefef] dark:bg-black transition-colors duration-300">
            <ProductDetailSkeleton />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#efefef] dark:bg-black pb-20 transition-colors duration-300">
            <div className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 sticky top-14 md:top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-2.5 md:py-3">
                    <div className="flex items-center text-[10px] md:text-sm text-gray-500 gap-1 uppercase tracking-wider font-bold">
                        <Link to="/" className="hover:text-[var(--saathi-green)] transition-colors">Home</Link>
                        <ChevronRight size={14} />
                        <Link to={`/category/${product.category}`} className="hover:text-[var(--saathi-green)] capitalize transition-colors truncate max-w-[80px] md:max-w-none">{product.category.replace(/-/g, ' ')}</Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-900 dark:text-gray-300 line-clamp-1 flex-1">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                <div className="bg-white dark:bg-black rounded-none border-0 md:rounded-2xl md:shadow-md md:border md:border-gray-100 dark:border-white/10 overflow-hidden min-h-fit md:min-h-[400px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 h-full">

                        {/* Left: Image Section */}
                        <div className="p-3 md:p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 bg-white dark:bg-black">
                            <div className="flex items-center justify-center w-full relative">
                                <img src={product.image} alt={product.name} className="h-56 sm:h-72 md:h-[280px] object-contain transition-transform hover:scale-105 duration-300" loading="lazy" />
                            </div>

                            {/* Thumbnails (Mock) */}
                            <div className="flex gap-3 mt-4 md:mt-8 overflow-x-auto pb-2 w-full justify-start md:justify-center scrollbar-hide">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-16 h-16 border rounded-lg p-1 cursor-pointer hover:border-[var(--saathi-green)] dark:bg-zinc-900 ${i === 1 ? 'border-[var(--saathi-green)]' : 'border-gray-200 dark:border-white/10'}`}>
                                        <img src={product.image} alt="thumbnail" className="w-full h-full object-contain" loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Details Section */}
                        <div className="p-4 md:p-6 flex flex-col text-left">
                            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-400 mb-1.5 md:mb-2 leading-tight tracking-tight">{product.name}</h1>

                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">{product.weight}</span>
                            </div>

                            <div className="mb-6 md:mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 w-full md:w-fit min-w-[180px]">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl md:text-2xl font-black text-gray-900 dark:text-gray-200">₹{product.price}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-base md:text-base text-gray-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">(Inclusive of all taxes)</p>
                            </div>

                            <div className="mb-4 md:mb-6">
                                {quantity === 0 ? (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="product_button bg-[#7e978e] text-white border-2 border-[#7e978e] hover:bg-[#6b827a] font-black py-2 px-10 md:px-10 w-full md:w-fit transition-all shadow-md text-sm uppercase tracking-widest rounded-xl active:scale-95"
                                    >
                                        Add to cart
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between md:justify-start gap-4 bg-[#7e978e] text-white rounded-xl px-4 py-2 w-full md:w-fit shadow-xl">
                                        <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-[#6b827a] rounded-lg transition active:scale-90"><Minus size={18} strokeWidth={3} /></button>
                                        <span className="text-base font-black min-w-[20px] text-center">{quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-[#6b827a] rounded-lg transition active:scale-90"><Plus size={18} strokeWidth={3} /></button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-black text-gray-900 dark:text-[#7e978e] text-sm mb-6 uppercase tracking-widest border-b border-gray-100 dark:border-white/10 pb-2 w-fit">Why shop from SaathiGro?</h3>
                                <div className="space-y-6">
                                    {[
                                        { title: '10 Minute Delivery', desc: 'Get items delivered to your doorstep from dark stores near you.', img: 'https://cdn.iconscout.com/icon/free/png-256/free-fast-delivery-icon-download-in-svg-png-gif-file-formats--truck-vehicle-logistics-services-pack-business-icons-1536254.png' },
                                        { title: 'Best Prices & Offers', desc: 'Best price destination with offers directly from the manufacturers.', img: 'https://cdn-icons-png.flaticon.com/512/2529/2529396.png' },
                                        { title: 'Wide Assortment', desc: 'Choose from 5000+ products across food, personal care, and more.', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' }
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="w-12 h-12 rounded-2xl flex-shrink-0 bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <img src={benefit.img} alt={benefit.title} className="w-7 h-7 object-contain opacity-80" loading="lazy" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">{benefit.title}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-medium">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
