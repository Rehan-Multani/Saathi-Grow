import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/product/ProductCard';

const WishlistPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { wishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] dark:bg-black px-4 pt-6 md:pt-8 pb-24 transition-colors duration-300">
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
                        <p className="!text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-1">{wishlist.length} Items saved</p>
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {wishlist.map((item) => (
                            <ProductCard
                                key={item.id}
                                product={item}
                                customTheme={{
                                    bgColor: 'linear-gradient(to right, #e8f5e9, #ffffff)',
                                    themeColor: '#0c831f'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
