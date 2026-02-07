import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Clock, Tag, Sparkles, Filter, ChevronDown,
    Copy, Check, Zap, ShoppingBag, Info, ShoppingCart, Truck,
    TrendingUp, Gift, Percent, Plus, Minus
} from 'lucide-react';
import { offerBanners } from '../../data/offers';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import categoryPlaceholder from '../../assets/images/category-placeholder.png';

// Helper for countdown
const useCountdown = (targetDate) => {
    const countDownDate = new Date(targetDate).getTime();
    const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [countDownDate]);

    return Math.max(0, countDown);
};

// Flyer-Style Product Card (Matched to app styling)
const FlyerProductCard = ({ product, badgeText }) => {
    const { cart, addToCart, updateQuantity } = useCart();
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="bg-white dark:bg-[#111111] rounded-xl md:rounded-2xl p-1 md:p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-200/60 dark:border-white/20 hover:border-[#0c831f]/40 dark:hover:border-white/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex flex-col gap-1 h-auto md:h-full group relative overflow-hidden">


            {/* Discount Badge - Flyer Style */}
            <div className="absolute -top-1 -left-1 w-11 h-11 md:w-12 md:h-12 bg-[#0c831f] rounded-full flex flex-col items-center justify-center text-white font-bold leading-tight border-2 border-white dark:border-gray-800 shadow-md z-20 rotate-[-5deg] group-hover:rotate-0 transition-transform">
                <span className="text-[7px] md:text-[8px] uppercase font-black">{badgeText.split(' ')[0]}</span>
                <span className="text-[9px] md:text-[10px] font-black">{badgeText.split(' ').slice(1).join(' ')}</span>
            </div>

            {/* Product Image Section */}
            <Link to={`/product/${product.id}`} className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-[#0a0a0a] z-10 flex items-center justify-center p-3">
                <img
                    src={product.image || categoryPlaceholder}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = categoryPlaceholder;
                        e.target.style.objectFit = 'cover';
                    }}
                />
                {/* Sale Tag */}
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                    -{discount}%
                </div>
            </Link>

            {/* Product Details */}
            <div className="flex flex-col flex-grow z-10">
                <Link to={`/product/${product.id}`}>
                    <h4 className="font-medium md:font-bold text-gray-900 dark:text-gray-100 text-[8.5px] sm:text-[13px] md:!text-[11px] leading-tight mb-1 line-clamp-2 min-h-[22px] sm:min-h-[32px]">
                        {product.name}
                    </h4>
                </Link>
                <div className="text-gray-500 dark:text-gray-400 text-[9px] mb-2 font-medium">
                    {product.weight} • {product.subCategory || "Premium"}
                </div>

                {/* Pricing & Add Button */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-gray-400 dark:text-gray-500 line-through text-[11px]">₹{product.originalPrice}</span>
                        <span className="text-xs sm:text-[15px] font-black text-gray-900 dark:text-[#f8fafc]">₹{product.price}</span>
                    </div>

                    {quantity > 0 ? (
                        <div className="flex items-center bg-[#0c831f] text-white !rounded-full shadow-lg h-[28px] sm:h-[36px] min-w-[70px] sm:min-w-[85px] border border-[#0c831f]">
                            <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-l-full will-change-transform"
                            >
                                <Minus size={12} sm:size={14} strokeWidth={2.5} />
                            </button>
                            <span className="text-[11px] sm:text-[14px] font-black w-5 sm:w-7 text-center select-none leading-none">
                                {quantity}
                            </span>
                            <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-r-full will-change-transform"
                            >
                                <Plus size={12} sm:size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => addToCart(product)}
                            className="px-4 py-1 bg-[#0c831f] text-white border border-transparent hover:bg-[#0a6b19] active:scale-95 transition-all text-[10px] sm:text-[11px] font-black !rounded-full uppercase tracking-wider shadow-sm h-[28px] sm:h-[34px] flex items-center justify-center"
                            aria-label="Add to cart"
                        >
                            ADD
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const OfferPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Hot Deals');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const offer = useMemo(() => offerBanners.find(o => o.id === parseInt(id)), [id]);

    const timeLeft = useCountdown(offer?.expiry || new Date().setDate(new Date().getDate() + 1));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft / 1000) % 60);

    const dealProducts = useMemo(() => {
        if (!offer) return [];
        let base = products.filter(p => p.category === offer.category).slice(0, 15);
        if (base.length === 0) base = products.slice(0, 15);

        if (activeFilter === 'Hot Deals') return base;
        if (activeFilter === 'Under ₹99') return base.filter(p => p.price < 99);
        if (activeFilter === 'Buy 1 Get 1') return base.slice(0, 6);
        if (activeFilter === 'Best Price') return [...base].sort((a, b) => a.price - b.price);

        return base;
    }, [offer, activeFilter]);

    if (!offer) return null;

    return (
        <>
            {/* Desktop-only rebuilt layout */}
            <div className="hidden md:block min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] font-sans pb-16 transition-colors duration-300">
                {/* Desktop Header */}
                <div className="sticky top-0 z-50 bg-transparent backdrop-blur-xl border-b border-gray-100/50 dark:border-white/10 px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all">
                            <ArrowLeft size={22} className="text-gray-900 dark:text-white" />
                        </button>
                        <span className="text-sm font-black text-[#0c831f] tracking-widest capitalize">
                            {offer.title.toLowerCase()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full border border-green-100 dark:border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">Live Deals</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">
                    {/* Hero Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <img
                            src={offer.image}
                            alt={offer.title}
                            className="w-full aspect-[16/6] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                        <div className="absolute left-8 right-8 bottom-8 flex items-end justify-between">
                            <div className="text-white space-y-1">
                                <h1 className="text-5xl font-black leading-tight capitalize">{offer.title.toLowerCase()}</h1>
                                <p className="text-base font-bold opacity-90 tracking-wide capitalize">{offer.subTitle.toLowerCase()}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-right">
                                <p className="text-[10px] uppercase font-black opacity-80">Ends In</p>
                                <p className="text-sm font-black font-mono">{hours}h {minutes}m {seconds}s</p>
                            </div>
                        </div>
                    </div>

                    {/* Offer Info + Coupon */}
                    <div className="grid grid-cols-12 gap-8 items-start">
                        <div className="col-span-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/10 p-6 space-y-5">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                Grab <span className="text-[#0c831f]">{offer.discount}</span> on {offer.category.replace('-', ' ')}
                            </h2>
                            <p className="text-base text-gray-500 dark:text-gray-400 italic">
                                "{offer.description}"
                            </p>
                            <div className="flex items-center justify-between bg-[#fffdf0] dark:bg-[#1a1914] border-2 border-dashed border-yellow-200 dark:border-yellow-900/20 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                                        <Percent size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Apply Code</p>
                                        <p className="text-2xl font-mono font-black text-yellow-700 dark:text-yellow-500 uppercase">{offer.couponCode}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(offer.couponCode);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className={`h-10 px-6 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md ${copied ? 'bg-green-600 text-white shadow-green-500/30' : 'bg-black text-white dark:bg-[#0c831f] dark:text-white shadow-black/10'}`}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Info size={14} />
                                <span className="text-sm font-bold uppercase tracking-tight">{offer.terms}</span>
                            </div>
                        </div>

                        {/* Deals Grid */}
                        <div className="col-span-8">
                            <div className="flex items-center gap-3 mb-2 md:mb-4">
                                <div className="w-1.5 h-8 bg-[#0c831f] rounded-full"></div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Featured Deals</h3>
                            </div>
                            <div className="grid grid-cols-3 xl:grid-cols-4 gap-6">
                                {dealProducts.map(product => (
                                    <FlyerProductCard
                                        key={product.id}
                                        product={product}
                                        badgeText={offer.badge}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View (Redesigned) */}
            <div className="md:hidden min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] font-sans pb-24 transition-colors duration-300">
                {/* Header / Navbar */}
                <div className="sticky top-0 z-50 bg-transparent backdrop-blur-xl border-b border-gray-100/50 dark:border-white/10 px-4 h-14 flex items-center justify-between" >
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all">
                            <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                        </button>
                        <div className="h-4 w-[2px] bg-gray-200 dark:bg-white/10 rounded-full mx-1"></div>
                        <span className="text-xs font-black text-[#0c831f] tracking-widest capitalize truncate max-w-[150px]">
                            {offer.title.toLowerCase()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full border border-green-100 dark:border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Live Deals</span>
                    </div>
                </div >

                <div className="px-4 py-4 space-y-6">

                    {/* Mobile Hero Section (Redesigned to Match Home Carousel) */}
                    <div className="relative w-full bg-gradient-to-r from-[#718355] to-[#4f5c3a] dark:from-[#141414] dark:to-[#141414] pb-8 pt-4 px-6 overflow-hidden shadow-sm border border-white/50 dark:border-white/5">
                        <div className="relative z-10 flex flex-col items-start max-w-[70%]">
                            <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-bold text-white mb-2 uppercase tracking-wider shadow-sm border border-white/10">
                                {offer.subTitle || 'Limited Time Offer'}
                            </span>
                            <h1 className="text-3xl font-black text-white dark:text-gray-100 leading-[0.9] mb-1 tracking-tighter uppercase line-clamp-2">
                                {offer.title.split(' ')[0]}<br />
                                <span className="text-[#e2e8db]">{offer.discount}</span>
                            </h1>
                            <p className="text-[11px] font-bold text-white/80 dark:text-gray-400 mb-4 bg-black/20 dark:bg-white/5 px-2.5 py-1 rounded-full inline-block line-clamp-1 border border-white/10 backdrop-blur-sm">
                                Code: {offer.couponCode} • Tab to Apply
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="bg-white dark:bg-white text-[#556b2f] dark:text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                    Offer Active <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1"></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Hero Icons (Dynamic Matching Home) */}
                        <div className="absolute right-[-10px] top-[20px] w-[140px] h-[140px] z-0 pointer-events-none">
                            {(() => {
                                const getIcons = (id) => {
                                    if (id === 1) return ['🥬', '🥕', '🥦'];
                                    if (id === 2) return ['🍎', '🍌', '🍇'];
                                    if (id === 3) return ['🍚', '🌾', '🥛'];
                                    if (id === 4) return ['🧹', '🧽', '🧼'];
                                    return ['🎁', '✨', '🛍️'];
                                };
                                const icons = getIcons(offer.id);
                                return (
                                    <>
                                        <div className="absolute top-0 right-0 text-[80px] drop-shadow-xl animate-bounce duration-[3000ms] select-none text-opacity-90">{icons[0]}</div>
                                        <div className="absolute bottom-0 left-[-10px] text-[60px] drop-shadow-lg animate-pulse duration-[2000ms] select-none text-opacity-90">{icons[1]}</div>
                                        <div className="absolute top-[60px] left-[-30px] text-[40px] drop-shadow-md animate-spin-slow select-none text-opacity-90">{icons[2]}</div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-10 right-20 w-8 h-8 rounded-full bg-yellow-400/20 blur-xl pointer-events-none"></div>
                        <div className="absolute bottom-5 left-10 w-12 h-12 rounded-full bg-green-400/10 blur-xl pointer-events-none"></div>
                    </div>

                    {/* Free Delivery Bar */}
                    <div className="bg-[#0c831f] rounded-[20px] p-4 text-white flex items-center justify-between shadow-lg shadow-green-500/10 active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <Truck size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-lg capitalize tracking-tight leading-none mb-0.5">Zero Shipping Cost</h4>
                                <p className="text-[10px] font-bold opacity-80 tracking-wide">Valid on all deals today!</p>
                            </div>
                        </div>
                        <ChevronDown size={18} className="-rotate-90 opacity-60" />
                    </div>

                    {/* Hot Deals Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between sticky top-14 bg-transparent backdrop-blur-sm z-30 py-3 -mx-4 px-4 border-b border-gray-200/50 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-[#0c831f] rounded-full"></div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">Featured</h3>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {['Hot Deals', 'Under ₹99', 'Buy 1 Get 1'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(f)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${activeFilter === f
                                            ? 'bg-[#0c831f] text-white border-[#0c831f]'
                                            : 'bg-white text-gray-500 border-gray-200 dark:bg-[#111] dark:border-white/10'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {dealProducts.map(product => (
                                <FlyerProductCard
                                    key={product.id}
                                    product={product}
                                    badgeText={activeFilter === 'Buy 1 Get 1' ? 'BUY 1 GET 1' : offer.badge}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div >

            {/* End Mobile View */}
        </>
    );
};

export default OfferPage;
