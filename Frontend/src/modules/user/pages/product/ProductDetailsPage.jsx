import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts, logDemandRequest, fetchProductReviews, submitProductReview } from '../../api/shopApi';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ChevronRight, Star, ShoppingCart, Sparkles, TrendingUp, AlertCircle, Bell, MapPin } from 'lucide-react';
import { ProductDetailSkeleton } from '../../components/common/Skeleton';
import ProductCard from '../../components/product/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { ASSET_URLS } from '../../../../constants/assetUrls';
import { toast } from 'react-toastify';
import SEO from '../../../../common/components/SEO';
const categoryPlaceholder = ASSET_URLS.placeholder;

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart, updateQuantity, cart } = useCart();
    const { user, token, protectAction } = useAuth();
    const { activeStore, isStoreOutOfRange, isStoreInactive, openStoreSelector } = useStore();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [error, setError] = useState(false);
    const [isSubmittingDemand, setIsSubmittingDemand] = useState(false);
    const [demandLogged, setDemandLogged] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewsPagination, setReviewsPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
    const [allReviews, setAllReviews] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [hasUserReviewed, setHasUserReviewed] = useState(false);

    const loadProduct = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(false);
            if (!silent) window.scrollTo({ top: 0, behavior: 'smooth' });

            // Fetch product details
            const data = await fetchProductById(id, {
                storeId: activeStore?.id,
                storeType: activeStore?.type
            });

            // Standardize mapping to frontend model
            const p = {
                id: data._id,
                name: data.name,
                image: data.image || (data.gallery && data.gallery.length > 0 ? data.gallery[0] : ''),
                images: data.gallery && data.gallery.length > 0 ? data.gallery : [data.image],
                price: data.basePrice,
                mrp: data.mrp,
                category: data.category?.name || data.category,
                description: data.description,
                weight: `${data.unitValue} ${data.unitType}`,
                tags: data.tags,
                isDeliverable: data.isDeliverable,
                availableStock: data.availableStock,
                lowStockThreshold: data.lowStockThreshold,
                maxAllowed: data.maxAllowed,
                inStore: data.inStore,
                brandInfo: data.brandInfo,
                sourceInfo: data.sourceInfo,
                averageRating: data.averageRating || 0,
                ratingCount: data.ratingCount || 0
            };

            setProduct(p);
            setSelectedImage(p.image);
            setProductImages(p.images.length >= 3 ? p.images : [p.image, p.image, p.image]); // Fill layout if few images

            // Fetch relative products
            if (p.category) {
                try {
                    const simres = await fetchProducts({
                        category: p.category,
                        limit: 10,
                        storeId: activeStore?.id,
                        storeType: activeStore?.type
                    });
                    const sim = (Array.isArray(simres) ? simres : (simres?.products || [])).filter(simP => simP._id !== id).map(simP => ({
                        id: simP._id,
                        name: simP.name,
                        image: simP.image || (simP.gallery && simP.gallery.length > 0 ? simP.gallery[0] : ''),
                        price: simP.basePrice,
                        mrp: simP.mrp,
                        weight: `${simP.unitValue} ${simP.unitType}`,
                        isDeliverable: simP.isDeliverable
                    }));
                    setSimilarProducts(sim);
                } catch (simErr) {
                    console.error("Failed to load similar products:", simErr);
                }
            }

            // General Recommendations
            try {
                const recres = await fetchProducts({
                    limit: 12,
                    storeId: activeStore?.id,
                    storeType: activeStore?.type
                });
                const rec = (Array.isArray(recres) ? recres : (recres?.products || [])).filter(recP => recP._id !== id).sort(() => Math.random() - 0.5).slice(0, 8).map(recP => ({
                    id: recP._id,
                    name: recP.name,
                    image: recP.image || (recP.gallery && recP.gallery.length > 0 ? recP.gallery[0] : ''),
                    price: recP.basePrice,
                    mrp: recP.mrp,
                    weight: `${recP.unitValue} ${recP.unitType}`,
                    isDeliverable: recP.isDeliverable
                }));
                setRecommendedProducts(rec);
            } catch (recErr) {
                console.error("Failed to load recommended products:", recErr);
            }

        } catch (err) {
            console.error("Failed to load product details:", err);
            setError(true);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            setLoadingReviews(true);
            const data = await fetchProductReviews(id, 1, 10);
            const initialReviews = data.data || [];
            setReviews(initialReviews);
            setReviewsPagination(data.pagination);
            
            // Check if current user has already reviewed
            if (token && user) {
               const userReview = initialReviews.find(r => (r.user?._id || r.user) === user?._id);
               if (userReview) setHasUserReviewed(true);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    const loadMoreReviews = async () => {
        if (reviewsPagination.page >= reviewsPagination.pages || isLoadingMore) return;
        
        try {
            setIsLoadingMore(true);
            const nextPage = reviewsPagination.page + 1;
            const data = await fetchProductReviews(id, nextPage, 10);
            setAllReviews(prev => [...prev, ...(data.data || [])]);
            setReviewsPagination(data.pagination);
        } catch (err) {
            console.error("Failed to load more reviews:", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const openAllReviews = async () => {
        setIsAllReviewsModalOpen(true);
        // If we haven't loaded all reviews or only loaded the first page
        if (allReviews.length === 0) {
            try {
                setIsLoadingMore(true);
                const data = await fetchProductReviews(id, 1, 10);
                setAllReviews(data.data || []);
                setReviewsPagination(data.pagination);
            } catch (err) {
                console.error("Failed to load initial full reviews:", err);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        loadProduct();
        loadReviews();

        const handleRefresh = () => {
            loadProduct(true);
            loadReviews();
        };
        window.addEventListener('saathi_refresh', handleRefresh);
        return () => window.removeEventListener('saathi_refresh', handleRefresh);
    }, [id]);

    const handleDemandRequest = async () => {
        if (demandLogged) return;
        setIsSubmittingDemand(true);
        try {
            const requestType = isStoreOutOfRange ? 'OUT_OF_ZONE' : 'OUT_OF_STOCK';

            // Get user location from local storage (matched with LocationContext)
            const savedLocation = JSON.parse(localStorage.getItem('sathiGro_location') || '{}');
            const coordinates = savedLocation.coordinates || [0, 0];
            const address = savedLocation.address || 'Unknown Address';

            await logDemandRequest({
                productId: id,
                storeId: activeStore?.id,
                storeType: activeStore?.type,
                requestType,
                location: {
                    coordinates,
                    address
                }
            }, localStorage.getItem('token'));

            setDemandLogged(true);
            toast.success(requestType === 'OUT_OF_ZONE'
                ? "We've recorded your interest for this area!"
                : "We'll prioritize restocking this item for you!");
        } catch (err) {
            console.error("Demand Logging Failed:", err);
            toast.error("Couldn't save your request. Try again later.");
        } finally {
            setIsSubmittingDemand(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!token) {
            toast.info("Please login to write a review");
            return;
        }

        if (!reviewComment.trim()) {
            toast.error("Please provide a comment");
            return;
        }

        setIsSubmittingReview(true);
        try {
            await submitProductReview({
                productId: id,
                rating: reviewRating,
                comment: reviewComment
            }, token);
            
            toast.success("Thank you for your feedback!");
            setReviewComment('');
            setReviewRating(5);
            setHasUserReviewed(true);
            loadReviews(); // Refresh reviews
            loadProduct(true); // Refresh product stats
        } catch (err) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (error || (!loading && !product)) return <div className="p-8 text-center text-gray-500">Product not found. <Link to="/" className="text-green-600 underline">Return Home</Link></div>;

    const cartItem = cart.find(item => item.id === (product?.id || id));
    const quantity = cartItem ? cartItem.quantity : 0;

    // Check if product is disabled based on stock/delivery
    const isOutOfStock = (product?.availableStock ?? 999) <= 0;
    const isLowStock = (product?.availableStock ?? 999) <= (product?.lowStockThreshold ?? 0);
    const isBtnDisabled = product?.isDeliverable === false || isStoreOutOfRange || isOutOfStock || isLowStock;

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white dark:from-[#141414] dark:to-[#141414] transition-colors duration-300">
            <ProductDetailSkeleton />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-none md:bg-white md:dark:bg-[#09090b] pb-20 transition-colors duration-300">
            <SEO 
                title={product.name} 
                description={product.description || `Buy ${product.name} at the best price from Saathi-Grow. Fresh quality and super fast delivery.`}
                image={product.image}
                type="product"
                schemaData={{
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": product.name,
                    "image": [product.image, ...product.images],
                    "description": product.description || `Premium quality ${product.name} available at Saathi-Grow.`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Saathi-Grow"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href,
                        "priceCurrency": "INR",
                        "price": product.price,
                        "availability": product.availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        "itemCondition": "https://schema.org/NewCondition"
                    }
                }}
            />
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
                                    if (e.target.src !== categoryPlaceholder) {
                                        e.target.src = categoryPlaceholder;
                                        e.target.classList.add('opacity-80');
                                        e.target.style.objectFit = 'cover';
                                    }
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
                                            if (e.target.src !== categoryPlaceholder) {
                                                e.target.src = categoryPlaceholder;
                                                e.target.style.objectFit = 'cover';
                                            }
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
                                <span className="text-xs font-bold text-gray-400">{product.averageRating > 0 ? product.averageRating.toFixed(1) : '0.0'}</span>
                                {product.ratingCount > 0 && (
                                    <span className="text-[10px] text-gray-500 font-medium">({product.ratingCount})</span>
                                )}
                            </div>
                            <div className={`border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isStoreOutOfRange
                                ? 'border-orange-500 text-orange-500'
                                : (product.isDeliverable !== false
                                    ? (isLowStock ? 'border-orange-500 text-orange-500' : 'border-gray-600 text-[#0c831f] dark:text-[#10b981]')
                                    : (product.inStore ? 'border-red-500 text-red-500' : 'border-orange-500 text-orange-500'))
                                }`}>
                                {isStoreOutOfRange ? 'Out of Zone' : (product.isDeliverable !== false ? (isLowStock ? 'Low Stock' : 'In Stock') : (product.inStore ? 'Out of Stock' : 'Out of Zone'))}
                            </div>
                        </div>

                        <div className="text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wide">
                            {product.weight}
                        </div>

                        <div className="text-lg font-bold text-[#0c831f] dark:text-[#10b981] mb-2">
                            ₹ {product.price}.00
                        </div>

                        {product.maxAllowed > 0 && (
                            <div className="flex items-center gap-1.5 mb-3">
                                <AlertCircle size={12} className="text-[#0c831f]" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Qty: <span className="text-[#0c831f]">{product.maxAllowed} units </span>
                                </span>
                            </div>
                        )}

                        {/* Brand & Source Section - Ultra Compact Pills */}
                        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide no-scrollbar pr-4">
                            {/* Brand Pill */}
                            {product.brandInfo && (
                                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-white/5 shadow-sm min-w-fit">
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-gray-50 dark:bg-[#222] flex items-center justify-center overflow-hidden">
                                        {product.brandInfo.logo ? (
                                            <img src={product.brandInfo.logo} alt="brand" className="w-full h-full object-cover" />
                                        ) : (
                                            <Star size={14} className="text-[#0c831f] fill-[#0c831f]/20" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[6.5px] text-gray-400 font-black uppercase tracking-tighter leading-none mb-0.5">Brand Source</span>
                                        <span className="text-[10px] text-gray-900 dark:text-gray-100 font-black leading-none">{product.brandInfo.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Source Pill */}
                            {product.sourceInfo && (
                                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-white/5 shadow-sm min-w-fit">
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-gray-50 dark:bg-[#222] flex items-center justify-center overflow-hidden">
                                        {product.sourceInfo.logo ? (
                                            <img src={product.sourceInfo.logo} alt="source" className="w-full h-full object-cover" />
                                        ) : (
                                            <MapPin size={14} className="text-[#0c831f] fill-[#0c831f]/20" />
                                        )}
                                    </div>
                                    <div className="flex flex-col max-w-[140px]">
                                        <span className="text-[6.5px] text-gray-400 font-black uppercase tracking-tighter leading-none mb-1">
                                            {product.sourceInfo.type} • {product.sourceInfo.phone}
                                        </span>
                                        <span className="text-[10px] text-gray-900 dark:text-gray-100 font-black leading-none truncate">{product.sourceInfo.name}</span>
                                        {product.sourceInfo.email && (
                                            <span className="text-[7px] text-gray-500 font-medium lowercase truncate mt-0.5">{product.sourceInfo.email}</span>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                    onClick={() => protectAction(() => addToCart(product))}
                                    disabled={isBtnDisabled}
                                    className={`w-full md:w-fit flex items-center justify-center gap-2 font-bold py-4 px-12 !rounded-full transition-all shadow-lg ${isBtnDisabled
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-[#0c831f] hover:bg-[#0a6b19] text-white active:scale-95 shadow-green-500/20'
                                        }`}
                                >
                                    <ShoppingCart size={18} className={isBtnDisabled ? '' : 'fill-white'} />
                                    <span className="uppercase tracking-widest text-[11px] font-black">
                                        {isBtnDisabled
                                            ? (isStoreOutOfRange || !product.inStore ? 'Out of Zone' : (isLowStock ? 'Low Stock' : 'Out of Stock'))
                                            : 'Add to Cart'
                                        }
                                    </span>
                                </button>
                            ) : (
                                <div className={`flex items-center bg-[#0c831f] rounded-2xl p-1 w-fit shadow-lg shadow-green-500/20 ${isBtnDisabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}>
                                    <button
                                        onClick={() => !isBtnDisabled && protectAction(() => updateQuantity(product.id, -1))}
                                        disabled={isBtnDisabled}
                                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors disabled:cursor-not-allowed"
                                    >
                                        <Minus size={20} strokeWidth={3} />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg text-white">{quantity}</span>
                                    <button
                                        onClick={() => !isBtnDisabled && protectAction(() => updateQuantity(product.id, 1))}
                                        disabled={isBtnDisabled}
                                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors disabled:cursor-not-allowed"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            )}

                            {/* New Demand Button */}
                            {isBtnDisabled && (
                                <button
                                    onClick={handleDemandRequest}
                                    disabled={isSubmittingDemand || demandLogged}
                                    className={`w-full md:w-fit mt-4 flex items-center justify-center gap-3 font-black py-4 px-10 rounded-[20px] transition-all border-2 ${demandLogged
                                        ? 'bg-green-50 border-green-200 text-green-600'
                                        : 'bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-[#0c831f] hover:text-[#0c831f]'
                                        }`}
                                >
                                    {demandLogged ? (
                                        <Sparkles size={18} className="animate-pulse" />
                                    ) : (
                                        isStoreOutOfRange ? <MapPin size={18} /> : <Bell size={18} />
                                    )}
                                    <span className="uppercase tracking-[0.1em] text-[10px]">
                                        {demandLogged
                                            ? 'Interest Recorded'
                                            : (isStoreOutOfRange ? 'Request in my area' : 'Notify me when available')
                                        }
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Additional Info (Minimal) */}
                        <div className="border-t border-gray-100 dark:border-white/5 pt-4 md:pt-8">
                            {isStoreInactive ? (
                                <div className="flex flex-col gap-2 p-5 bg-red-50 dark:bg-red-500/5 rounded-3xl border border-red-200/50 dark:border-red-500/20 mb-8 shadow-sm">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <AlertCircle size={18} className="text-red-600" />
                                        </div>
                                        <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Store Currently Inactive</p>
                                    </div>
                                    <p className="text-[11px] text-red-600/80 dark:text-red-400/80 font-semibold leading-relaxed pl-10">
                                        This store <b>{activeStore?.name}</b> is currently not accepting orders.
                                        Please select another store to continue shopping.
                                    </p>
                                </div>
                            ) : isStoreOutOfRange ? (
                                <div className="flex flex-col gap-2 p-5 bg-orange-50 dark:bg-orange-500/5 rounded-3xl border border-orange-200/50 dark:border-orange-500/20 mb-8 shadow-sm">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <AlertCircle size={18} className="text-orange-600" />
                                        </div>
                                        <p className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">Out of Delivery Zone</p>
                                    </div>
                                    <p className="text-[11px] text-orange-600/80 dark:text-orange-400/80 font-semibold leading-relaxed pl-10">
                                        This store <b>{activeStore?.name}</b> is currently outside your delivery radius.
                                        Please select a closer store or update your delivery location to order this item.
                                    </p>
                                </div>
                            ) : (!product.isDeliverable && activeStore && (
                                <div className={`flex flex-col gap-2 p-5 ${!product.inStore ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-200/50' : 'bg-red-50 dark:bg-red-500/5 border-red-200/50'} rounded-3xl border mb-8 shadow-sm`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-full ${!product.inStore ? 'bg-orange-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
                                            <AlertCircle size={18} className={!product.inStore ? 'text-orange-600' : 'text-red-600'} />
                                        </div>
                                        <p className={`text-xs font-black ${!product.inStore ? 'text-orange-700' : 'text-red-700'} uppercase tracking-widest`}>
                                            {!product.inStore ? 'Out of Zone' : 'Out of Stock'}
                                        </p>
                                    </div>
                                    <p className={`text-[11px] ${!product.inStore ? 'text-orange-600/80' : 'text-red-600/80'} font-semibold leading-relaxed pl-10`}>
                                        {!product.inStore
                                            ? `This product is not currently available at your selected store: ${activeStore.name}.`
                                            : `This product has reached its minimum delivery threshold at ${activeStore.name}.`}
                                    </p>
                                </div>
                            ))}

                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4">Product Details</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                {product.description || "Fresh and natural products packed with vitamins and essential nutrients for your daily needs."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Feedback Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Rating Stats & Write Review */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-2 mb-4">
                             <div className="w-1.5 h-6 bg-[#0c831f] rounded-full" />
                             <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                                 Product Feedback
                             </h2>
                        </div>

                        <div className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-white/5 rounded-[28px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-4xl font-black text-[#0c831f]">{product.averageRating > 0 ? product.averageRating.toFixed(1) : '–'}</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={12} className={s <= Math.round(product.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mt-1">{product.ratingCount} REVIEWS</p>
                                </div>
                                {!hasUserReviewed && (
                                    <div className="bg-[#eefaf1] px-4 py-2 rounded-2xl border border-[#0c831f]/10">
                                        <p className="text-[10px] font-black text-[#0c831f] uppercase tracking-tighter">Share Experience</p>
                                    </div>
                                )}
                            </div>

                            {!hasUserReviewed ? (
                                <form onSubmit={handleSubmitReview} className="space-y-3">
                                    <div className="flex justify-center gap-3 py-1 border-t border-gray-50 dark:border-white/5 pt-4">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setReviewRating(s)}
                                                className={`transition-all ${reviewRating >= s ? "scale-110" : "opacity-30 grayscale"}`}
                                            >
                                                <Star size={18} className={reviewRating >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Add your thoughts..."
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-black/20 border-0 rounded-2xl p-3 text-[11px] font-semibold focus:ring-2 focus:ring-[#0c831f]/20 outline-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="w-full bg-[#0c831f] hover:bg-[#0a6b19] disabled:bg-gray-200 text-white font-black py-3 rounded-2xl transition-all shadow-md shadow-green-500/10 uppercase tracking-widest text-[9px]"
                                    >
                                        {isSubmittingReview ? "Posting..." : "Post Review"}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center p-4 bg-green-50 dark:bg-green-500/5 rounded-2xl border border-green-100 dark:border-green-500/10">
                                    <Sparkles size={18} className="text-[#0c831f] mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-green-700 dark:text-green-400 tracking-tight">Review shared!</p>
                                    <p className="text-[9px] text-green-600/70 font-medium mt-0.5">Thanks for helping us grow.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Reviews List / Slider */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Customer Stories ({product.ratingCount})
                            </h3>
                            {reviews.length > 0 && (
                                <button 
                                    onClick={openAllReviews}
                                    className="text-[10px] font-black text-[#0c831f] uppercase tracking-widest hover:underline"
                                >
                                    View All
                                </button>
                            )}
                        </div>

                        {loadingReviews ? (
                            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse bg-white dark:bg-[#18181b] rounded-2xl px-5 py-4 border border-gray-50 dark:border-white/5 min-w-[240px] w-[240px]">
                                        <div className="flex gap-3 mb-3">
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-full" />
                                            <div className="space-y-1.5 flex-1">
                                                <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                                <div className="h-1.5 w-10 bg-gray-100 dark:bg-white/5 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded mb-1.5" />
                                        <div className="h-2 w-2/3 bg-gray-100 dark:bg-white/5 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-[#18181b] rounded-[28px] border border-gray-100 dark:border-white/5">
                                <Star size={20} className="text-gray-200 mx-auto mb-2" />
                                <h4 className="text-xs font-black text-gray-900 dark:text-gray-100">No stories yet</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Share your first impression!</p>
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                                {reviews.slice(0, 3).map((review) => (
                                    <div key={review._id} className="bg-white dark:bg-[#18181b] rounded-[24px] px-5 py-4 border border-gray-50 dark:border-white/5 min-w-[260px] w-[260px] flex-shrink-0 shadow-sm transition-all hover:border-[#0c831f]/20">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0c831f] to-[#10b981] flex items-center justify-center text-white text-[9px] font-black uppercase shadow-inner">
                                                    {review.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{review.user?.name || 'Anonymous User'}</h4>
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} size={6} className={s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                                {reviews.length > 3 && (
                                    <button 
                                        onClick={openAllReviews}
                                        className="bg-gray-50 dark:bg-white/5 rounded-[24px] px-6 py-4 flex flex-col items-center justify-center min-w-[120px] group transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-black flex items-center justify-center text-[#0c831f] mb-2 group-hover:scale-110 transition-transform">
                                            <ChevronRight size={18} />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">See More Stories</p>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* All Reviews Modal */}
            {isAllReviewsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAllReviewsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-[#09090b] w-full max-w-xl sm:rounded-[40px] h-[90vh] sm:h-auto sm:max-h-[80vh] overflow-hidden shadow-2xl flex flex-col items-center p-0">
                        {/* Header */}
                        <div className="w-full px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#09090b] z-10">
                            <div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Customer Experiences</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{reviewsPagination.total} reviews for {product.name}</p>
                            </div>
                            <button 
                                onClick={() => setIsAllReviewsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        {/* Reviews List */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 w-full space-y-6">
                            {allReviews.map((review) => (
                                <div key={review._id} className="border-b border-gray-50 dark:border-white/5 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black uppercase text-[#0c831f]">
                                                {review.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{review.user?.name || 'Anonymous User'}</h4>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="px-2 py-0.5 rounded-full bg-[#eefaf1] border border-[#0c831f]/10 flex items-center gap-0.5">
                                                <Star size={8} className="text-yellow-500 fill-yellow-500" />
                                                <span className="text-[10px] font-black text-[#0c831f]">{review.rating}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(review.createdAt).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                        {review.comment}
                                    </p>
                                    {review.replied && (
                                        <div className="bg-[#eefaf1] dark:bg-[#0c831f]/10 p-4 rounded-xl border border-[#0c831f]/5 ml-6">
                                            <p className="text-[9px] font-black text-[#0c831f] uppercase tracking-widest mb-1">Official Response</p>
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 italic leading-relaxed">"{review.reply}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {reviewsPagination.page < reviewsPagination.pages && (
                                <div className="py-4">
                                    <button 
                                        onClick={loadMoreReviews}
                                        disabled={isLoadingMore}
                                        className="w-full font-black text-[10px] text-[#0c831f] uppercase tracking-widest bg-[#eefaf1] py-4 rounded-2xl hover:bg-[#0c831f]/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                               <div className="w-3 h-3 border-2 border-[#0c831f]/30 border-t-[#0c831f] rounded-full animate-spin" />
                                               Fetching more stories...
                                            </>
                                        ) : "Load more reviews"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8 md:space-y-12">

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
                                    <ProductCard product={p} isCompact={true} />
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
                                    <ProductCard product={p} isCompact={true} />
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
