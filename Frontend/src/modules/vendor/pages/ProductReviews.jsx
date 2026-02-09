import React, { useState } from 'react';
import { Star, Search, MessageSquare, ThumbsUp, Flag, Eye, Filter } from 'lucide-react';

const ProductReviews = () => {
    const [filterRating, setFilterRating] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);

    // Mock review data
    const reviews = [
        { id: 1, customer: 'Rahul Sharma', product: 'Fresh Tomatoes (1kg)', rating: 5, comment: 'Excellent quality! Fresh and delivered on time.', date: '2024-02-09', helpful: 12, productImage: 'https://via.placeholder.com/50', replied: false },
        { id: 2, customer: 'Priya Singh', product: 'Organic Carrots (500g)', rating: 4, comment: 'Good quality, but slightly expensive.', date: '2024-02-08', helpful: 8, productImage: 'https://via.placeholder.com/50', replied: true, reply: 'Thank you for your feedback!' },
        { id: 3, customer: 'Amit Kumar', product: 'Fresh Onions (1kg)', rating: 3, comment: 'Average quality, some were spoiled.', date: '2024-02-07', helpful: 5, productImage: 'https://via.placeholder.com/50', replied: false },
        { id: 4, customer: 'Neha Patel', product: 'Green Capsicum (250g)', rating: 5, comment: 'Very fresh! Will order again.', date: '2024-02-06', helpful: 15, productImage: 'https://via.placeholder.com/50', replied: true, reply: 'Glad you liked it!' },
        { id: 5, customer: 'Sanjay Verma', product: 'Fresh Potatoes (2kg)', rating: 2, comment: 'Not satisfied with quality.', date: '2024-02-05', helpful: 3, productImage: 'https://via.placeholder.com/50', replied: false },
        { id: 6, customer: 'Anjali Mehta', product: 'Broccoli (500g)', rating: 5, comment: 'Super fresh and packed well!', date: '2024-02-04', helpful: 20, productImage: 'https://via.placeholder.com/50', replied: true, reply: 'Thank you so much!' },
    ];

    const filteredReviews = reviews.filter(review => {
        const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
        const matchesSearch = review.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.product.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRating && matchesSearch;
    });

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Product Reviews</h1>
                    <p className="text-sm text-gray-500">Manage customer feedback and ratings</p>
                </div>
            </div>

            {/* Overall Rating Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="premium-card p-6">
                    <div className="text-center">
                        <h2 className="text-5xl font-extrabold text-gray-900">{avgRating}</h2>
                        <div className="flex items-center justify-center gap-1 my-2">
                            {renderStars(Math.round(avgRating))}
                        </div>
                        <p className="text-sm text-gray-500">{reviews.length} reviews</p>
                    </div>
                </div>

                <div className="premium-card p-6 lg:col-span-2">
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
                                <span className="text-xs font-bold text-gray-600 w-8">{stars} ★</span>
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
            <div className="premium-card p-4">
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
                {filteredReviews.map(review => (
                    <div key={review.id} className="premium-card p-5">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {review.customer.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{review.customer}</h3>
                                        <p className="text-xs text-gray-500">{review.date}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                                        <img src={review.productImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">{review.product}</span>
                                </div>

                                <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

                                {review.replied && review.reply && (
                                    <div className="bg-green-50 border-l-4 border-[#0c831f] p-3 rounded mb-3">
                                        <p className="text-xs font-bold text-gray-900 mb-1">Your Response:</p>
                                        <p className="text-sm text-gray-700">{review.reply}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-[#0c831f] transition-colors">
                                        <ThumbsUp size={14} />
                                        {review.helpful} helpful
                                    </button>
                                    {!review.replied && (
                                        <button className="flex items-center gap-1 text-[#0c831f] hover:text-[#0a6b19] font-bold transition-colors">
                                            <MessageSquare size={14} />
                                            Reply
                                        </button>
                                    )}
                                    <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                                        <Flag size={14} />
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReviews.length === 0 && (
                <div className="premium-card p-20 text-center">
                    <Star size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400">No reviews found</p>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
