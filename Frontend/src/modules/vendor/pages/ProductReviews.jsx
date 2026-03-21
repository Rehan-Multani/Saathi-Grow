import React, { useState, useEffect } from 'react';
import { Star, Search, MessageSquare, ThumbsUp, Flag, Eye, Filter, Loader2, X } from 'lucide-react';
import { getVendorReviews, replyToReview } from '../api/vendorProductApi';
import { toast } from 'react-toastify';

const ProductReviews = () => {
    const [filterRating, setFilterRating] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
            const data = await getVendorReviews(token);
            setReviews(data);
        } catch (err) {
            toast.error(err.message || "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        try {
            setIsSubmittingReply(true);
            const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
            await replyToReview(token, selectedReview._id, replyText);
            toast.success("Reply submitted successfully");
            setReplyText('');
            setSelectedReview(null);
            loadReviews();
        } catch (err) {
            toast.error(err.message || "Failed to submit reply");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
        const custName = review.user?.name || 'Anonymous';
        const prodName = review.product?.name || 'Unknown Product';
        const matchesSearch = custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prodName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRating && matchesSearch;
    });

    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
    const fiveStars = reviews.filter(r => r.rating === 5).length;
    const fourStars = reviews.filter(r => r.rating === 4).length;
    const threeStars = reviews.filter(r => r.rating === 3).length;
    const twoStars = reviews.filter(r => r.rating === 2).length;
    const oneStar = reviews.filter(r => r.rating === 1).length;

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

    return (
        <div className="space-y-6 lg:space-y-5 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Product Reviews</h1>
                    <p className="text-sm text-gray-500">Manage customer feedback and ratings</p>
                </div>
            </div>

            {/* Overall Rating Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="premium-card p-6 lg:p-5">
                    <div className="text-center">
                        <h2 className="text-5xl font-extrabold text-gray-900">{avgRating}</h2>
                        <div className="flex items-center justify-center gap-1 my-2">
                            {renderStars(Math.round(avgRating))}
                        </div>
                        <p className="text-sm text-gray-500">{reviews.length} reviews</p>
                    </div>
                </div>

                <div className="premium-card p-6 lg:p-5 lg:col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {[
                            { stars: 5, count: fiveStars },
                            { stars: 4, count: fourStars },
                            { stars: 3, count: threeStars },
                            { stars: 2, count: twoStars },
                            { stars: 1, count: oneStar },
                        ].map(({ stars, count }) => (
                            <div key={stars} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-600 w-8">{stars} ₹</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${(count / reviews.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-600 w-8 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4 lg:p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {['all', '5', '4', '3', '2', '1'].map(rating => (
                            <button
                                key={rating}
                                onClick={() => setFilterRating(rating)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap border transition-colors ${filterRating === rating
                                    ? 'bg-[#0c831f] text-white border-[#0c831f]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {rating === 'all' ? 'All' : `${rating} Star`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#18181b] rounded-3xl border border-gray-100 dark:border-white/5">
                        <Loader2 className="animate-spin text-[#0c831f] mb-4" size={32} />
                        <p className="text-sm font-bold text-gray-400">Loading feedback...</p>
                    </div>
                ) : filteredReviews.map(review => (
                    <div key={review._id} className="premium-card p-5 lg:p-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0c831f] to-[#10b981] rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-inner border border-white/10">
                                {(review.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">{review.user?.name || 'Anonymous User'}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3 bg-gray-50 dark:bg-black/20 p-2 rounded-xl border border-gray-100 dark:border-white/5 w-fit">
                                    <div className="w-8 h-8 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                                        <img src={review.product?.image} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{review.product?.name || 'Unknown Product'}</span>
                                </div>

                                <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3 leading-relaxed">{review.comment}</p>

                                {review.replied && review.reply && (
                                    <div className="bg-[#eefaf1] dark:bg-[#0c831f]/10 border-l-4 border-[#0c831f] p-4 rounded-xl mb-3 shadow-sm">
                                        <p className="text-[10px] font-black text-[#0c831f] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <MessageSquare size={10} /> Your Official Response
                                        </p>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 italic">"{review.reply}"</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-[#0c831f] transition-colors font-bold">
                                        <ThumbsUp size={14} />
                                        {review.helpfulCount || 0} helpful
                                    </button>
                                    {!review.replied && (
                                        <button 
                                            onClick={() => setSelectedReview(review)}
                                            className="flex items-center gap-1 text-[#0c831f] hover:text-[#0a6b19] font-black transition-all bg-[#eefaf1] dark:bg-[#0c831f]/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
                                        >
                                            <MessageSquare size={14} />
                                            Reply Now
                                        </button>
                                    )}
                                    <button className="flex items-center gap-1 hover:text-red-600 transition-colors font-bold">
                                        <Flag size={14} />
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filteredReviews.length === 0 && (
                <div className="premium-card p-20 text-center bg-white dark:bg-[#18181b] border border-gray-100 dark:border-white/5 rounded-[32px]">
                    <Star size={48} className="text-gray-200 dark:text-white/5 mx-auto mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No matching reviews found</p>
                </div>
            )}

            {/* Reply Modal */}
            {selectedReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReview(null)} />
                    <div className="relative bg-white dark:bg-[#09090b] w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 p-8">
                        <button onClick={() => setSelectedReview(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400">
                            <X size={20} />
                        </button>
                        
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Post Official Reply</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">Responding to <span className="text-[#0c831f] font-bold">@{selectedReview.user?.name || 'Anonymous'}</span> about {selectedReview.product?.name}</p>
                        
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl mb-6 italic text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5 font-medium leading-relaxed">
                            "{selectedReview.comment}"
                        </div>
                        
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your professional response..."
                            rows={4}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-xs font-semibold focus:ring-2 focus:ring-[#0c831f]/20 outline-none text-gray-700 dark:text-gray-300 mb-6 placeholder:text-gray-400"
                        />
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReply}
                                disabled={isSubmittingReply || !replyText.trim()}
                                className="flex-[2] bg-[#0c831f] hover:bg-[#0a6b19] disabled:bg-gray-200 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-green-500/10 uppercase tracking-widest text-[10px]"
                            >
                                {isSubmittingReply ? "Posting..." : "Submit Reply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
