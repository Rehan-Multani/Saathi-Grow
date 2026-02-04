import React, { useState } from 'react';
import { Heart, ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import { toast } from 'react-toastify';

import { useWishlist } from '../../context/WishlistContext';

const WishlistPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, updateQuantity, addToCart } = useCart();
    const { wishlist, toggleWishlist } = useWishlist();

    const handleRemove = (product) => {
        toggleWishlist(product);
    };

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(`${item.name} added to cart!`, {
            icon: <ShoppingCart size={16} className="text-[#0c831f]" />,
            style: {
                borderRadius: '14px',
                background: document.documentElement.classList.contains('dark') ? '#000' : '#f0fdf4',
                color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid #0c831f20'
            }
        });
    };

    const getItemQuantity = (id) => {
        const item = cart.find(i => i.id === id);
        return item ? item.quantity : 0;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black p-4 pt-6 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 bg-gray-50 dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="!text-[12px] font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">My Wishlist</h1>
                        <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{wishlist.length} Items saved</p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-[#fff1f2] rounded-full flex items-center justify-center mb-6">
                            <Heart size={32} className="text-red-500 fill-red-500" />
                        </div>
                        <h2 className="!text-[14px] font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Your wishlist is empty</h2>
                        <p className="!text-[10px] text-gray-400 font-medium mb-8">Save your favorite items here for future shopping.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#0c831f] text-white px-8 py-2.5 rounded-xl font-black !text-[11px] shadow-lg shadow-green-500/20 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            Explore Store
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {wishlist.map((item) => {
                            const quantity = getItemQuantity(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="py-6 flex gap-4 relative group"
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(item)}
                                        className="absolute top-6 right-0 p-1.5 text-gray-300 hover:text-red-500 transition-all active:scale-90"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    {/* Image */}
                                    <div
                                        className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-2 cursor-pointer transition-transform active:scale-95 flex-shrink-0 border border-gray-100 dark:border-white/5"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3
                                            className="text-[8px] font-bold text-gray-800 dark:text-gray-100 leading-tight mb-0.5 truncate cursor-pointer uppercase tracking-tight"
                                            onClick={() => navigate(`/product/${item.id}`)}
                                        >
                                            {item.name}
                                        </h3>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mb-4 opacity-70">{item.weight}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="!text-[15px] font-black text-gray-900 dark:text-gray-100 leading-none">₹{item.price}</span>
                                                {item.originalPrice && (
                                                    <span className="!text-[10px] text-gray-300 dark:text-gray-600 line-through font-bold mt-0.5 leading-none">₹{item.originalPrice}</span>
                                                )}
                                            </div>

                                            {/* Blinkit Style ADD/Quantity Button */}
                                            {quantity > 0 ? (
                                                <div className="flex items-center bg-[#0c831f] text-white rounded-lg shadow-sm border border-[#0c831f] w-16 h-8">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="px-2 h-full hover:bg-[#0a6b19] transition-colors rounded-l-lg flex items-center justify-center"
                                                    >
                                                        <Minus size={10} strokeWidth={4} />
                                                    </button>
                                                    <span className="w-5 text-center !text-[10px] font-black">{quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="px-2 h-full hover:bg-[#0a6b19] transition-colors rounded-r-lg flex items-center justify-center"
                                                    >
                                                        <Plus size={10} strokeWidth={4} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="bg-[#0c831f] dark:bg-black text-white dark:!text-[#0c831f] border border-[#0c831f]/20 hover:border-[#0c831f] w-16 h-8 rounded-lg text-[10px] font-black shadow-sm active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center"
                                                >
                                                    ADD
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
