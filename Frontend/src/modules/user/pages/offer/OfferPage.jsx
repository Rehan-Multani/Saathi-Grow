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
        <div className="bg-white dark:bg-[#111111] rounded-xl p-2 sm:p-3 shadow-sm border border-gray-200/60 dark:border-white/20 hover:border-[#0c831f]/40 dark:hover:border-white/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex flex-col gap-1.5 h-auto md:h-full group relative overflow-hidden">


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
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-[8.5px] sm:text-[13px] leading-tight mb-1 line-clamp-2 min-h-[22px] sm:min-h-[32px]">
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
        <div className="min-h-screen bg-white dark:bg-black font-sans pb-24 transition-colors duration-300">
            {/* Header / Navbar */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-white/10 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all">
                        <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                    </button>
                    <div className="h-4 w-[2px] bg-gray-200 dark:bg-white/10 rounded-full mx-1"></div>
                    <span className="text-[10px] md:text-xs font-black text-[#0c831f] tracking-widest capitalize truncate max-w-[150px]">
                        {offer.title.toLowerCase()}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full border border-green-100 dark:border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Live Deals</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10">

                {/* Hero Promotion Section */}
                <div className="relative space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight capitalize italic">
                            {offer.title.toLowerCase()}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="h-[2px] w-12 bg-[#0c831f]"></span>
                            <p className="text-[11px] md:text-sm font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] capitalize">
                                {offer.subTitle.toLowerCase()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-[32px] p-2 shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            {/* Visual Side */}
                            <div className="lg:col-span-5 rounded-[20px] overflow-hidden relative shadow-lg group mx-2 mt-2 lg:m-0">
                                <img src={offer.image} alt={offer.title} className="w-full aspect-[16/9] lg:aspect-[4/3] object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white">
                                        <p className="text-[7px] uppercase font-black opacity-80">Ends In</p>
                                        <p className="text-[11px] font-black font-mono">{hours}h {minutes}m {seconds}s</p>
                                    </div>
                                    <div className="bg-[#0c831f] p-2 rounded-xl shadow-lg border-2 border-white/10">
                                        <Sparkles size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="lg:col-span-7 p-4 lg:p-8 space-y-5">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-400/10 text-yellow-600 rounded-md border border-yellow-400/20">
                                        <Zap size={12} className="fill-yellow-600" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Mega Exclusive</span>
                                    </div>
                                    <h3 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                                        Grab <span className="text-[#0c831f]">{offer.discount}</span> Off On <br className="hidden md:block" /> {offer.category.replace('-', ' ')}
                                    </h3>
                                    <p className="text-xs md:text-base text-gray-500 font-medium leading-relaxed italic opacity-80">
                                        "{offer.description}"
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Coupon Widget */}
                                    <div className="flex-grow bg-[#fffdf0] dark:bg-[#1a1914] border-2 border-dashed border-yellow-200 dark:border-yellow-900/20 rounded-xl p-3 flex items-center justify-between group cursor-pointer hover:border-yellow-400 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                                                <Percent size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Apply Code</p>
                                                <p className="text-lg font-mono font-black text-yellow-700 dark:text-yellow-500 uppercase">{offer.couponCode}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(offer.couponCode);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className={`h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-md ${copied ? 'bg-green-600 text-white shadow-green-500/30' : 'bg-black text-white dark:bg-[#0c831f] dark:text-white shadow-black/10'}`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Info size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{offer.terms}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Delivery Bar (Enhanced) */}
                <div className="relative group overflow-hidden">
                    <div className="bg-[#0c831f] rounded-[20px] p-4 text-white flex items-center justify-between shadow-lg shadow-green-500/10">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 rotate-3 group-hover:rotate-0 transition-transform">
                                <Truck size={22} />
                            </div>
                            <div>
                                <h4 className="font-black text-base md:text-xl capitalize tracking-tight leading-none mb-1">Zero Shipping Cost</h4>
                                <p className="text-[9px] md:text-xs font-bold opacity-80 tracking-wide">Valid on all deals until Dec 25th!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hot Deals Grid Section */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[#0c831f] rounded-full"></div>
                            <h3 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Featured Deals</h3>
                        </div>

                        {/* Functional Filter Buttons - Updated with Squircle Shape & Sentence Case */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {['Hot Deals', 'Under ₹99', 'Buy 1 Get 1', 'Best Price'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-[10.5px] md:text-xs font-bold transition-all duration-300 border whitespace-nowrap ${activeFilter === f
                                        ? 'bg-[#0c831f] text-white border-[#0c831f] shadow-lg shadow-green-500/20'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-green-200 dark:bg-[#111] dark:text-gray-500 dark:border-white/5'
                                        }`}
                                >
                                    {f.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
        </div>
    );
};

export default OfferPage;
