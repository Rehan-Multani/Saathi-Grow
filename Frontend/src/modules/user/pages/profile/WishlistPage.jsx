import React from 'react';
import { Heart, ShoppingCart, ArrowLeft, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';

const WishlistPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    // Mock wishlist data (first 3 products)
    const wishlistItems = products.slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-2 bg-white dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none">My Wishlist</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{wishlistItems.length} Saved Items</p>
                    </div>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-[#fff1f2] rounded-full flex items-center justify-center mb-6">
                            <Heart size={48} className="text-pink-500 fill-pink-500" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">Your wishlist is empty</h2>
                        <p className="text-sm text-gray-400 font-medium mb-8">Save your favorite items here for future shopping.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#0c831f] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                        >
                            Explore Store
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {wishlistItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-[#141414] p-4 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm flex gap-4 relative group"
                            >
                                {/* Remove Button */}
                                <button className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>

                                {/* Image */}
                                <div
                                    className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-2 cursor-pointer"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 pr-6">
                                    <h3
                                        className="text-[14px] font-bold text-gray-800 dark:text-gray-100 leading-tight mb-1 truncate cursor-pointer"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-3">{item.weight}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-gray-900 dark:text-gray-100">₹{item.price}</span>
                                            {item.originalPrice && (
                                                <span className="text-[10px] text-gray-400 line-through font-bold">₹{item.originalPrice}</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => addToCart(item)}
                                            className="flex items-center gap-2 bg-[#0c831f] text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-[#0a6b19] active:scale-95 transition-all"
                                        >
                                            <ShoppingCart size={14} strokeWidth={3} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Recommendation Banner */}
                        <div className="mt-10 p-6 bg-gradient-to-br from-green-600 to-[#0c831f] rounded-[32px] text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-xl font-black mb-1">Weekly Sale!</h4>
                                <p className="text-xs opacity-90 font-medium mb-4 pr-10">Items in your wishlist are currently on 20% discount. Grab them now!</p>
                                <button className="bg-white text-[#0c831f] px-6 py-2 rounded-xl text-xs font-black shadow-lg">
                                    Shop Now
                                </button>
                            </div>
                            <Heart size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
