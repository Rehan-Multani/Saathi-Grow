import React, { useState } from 'react';
import { Search, Send, Clock, X, CheckCircle2, Trash2, MoreHorizontal, MessageCircle, Edit, Archive } from 'lucide-react';

const ProductFAQs = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Mock Data
    const [faqs, setFaqs] = useState([
        { id: 1, product: 'Premium Toned Milk', question: 'What is the expiry date?', status: 'Pending', time: '2h ago', customer: 'Rahul Kumar' },
        { id: 2, product: 'Organic Almonds 500g', question: 'Are these roasted or raw?', status: 'Answered', time: '5h ago', customer: 'Sneha Gupta', answer: 'These are raw organic almonds.' },
        { id: 3, product: 'Fresh Broccoli', question: 'Is this locally sourced?', status: 'Answered', time: '1d ago', customer: 'Vikram Singh', answer: 'Yes, sourced from local farms.' },
        { id: 4, product: 'Whole Wheat Bread', question: 'Does this contain preservatives?', status: 'Pending', time: '1d ago', customer: 'Anjali Desai' },
        { id: 5, product: 'Desi Ghee 1L', question: 'Is this A2 cow ghee?', status: 'Answered', time: '2d ago', customer: 'Rohit Sharma', answer: 'Yes, this is pure A2 cow ghee.' },
    ]);

    // Filtering Logic
    const filteredFaqs = faqs.filter(faq => {
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'pending' && faq.status === 'Pending') ||
            (activeTab === 'answered' && faq.status === 'Answered');
        const matchesSearch = faq.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.customer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const confirmDelete = (id) => {
        setFaqs(faqs.filter(f => f.id !== id));
        setDeletingId(null);
        setOpenMenuId(null);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setOpenMenuId(null);
    };

    const cancelDelete = () => {
        setDeletingId(null);
    };

    const handleReply = (faq) => {
        setReplyingToId(faq.id);
        setReplyText(faq.answer || '');
        setOpenMenuId(null);
    };

    const submitReply = (faqId) => {
        if (replyText.trim()) {
            setFaqs(faqs.map(f =>
                f.id === faqId
                    ? { ...f, status: 'Answered', answer: replyText }
                    : f
            ));
            setReplyingToId(null);
            setReplyText('');
        }
    };

    const cancelReply = () => {
        setReplyingToId(null);
        setReplyText('');
    };

    const handleArchive = (id) => {
        setFaqs(faqs.map(f => f.id === id ? { ...f, status: 'Archived' } : f));
        setOpenMenuId(null);
    };

    const stats = [
        { label: 'Total', val: faqs.length, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending', val: faqs.filter(f => f.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Answered', val: faqs.filter(f => f.status === 'Answered').length, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div className="space-y-4 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-base font-bold text-gray-900">Product Q&A</h1>
                    <p className="text-[10px] text-gray-500 font-medium">Manage customer inquiries</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="premium-card p-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.val}</h3>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="premium-card p-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search questions, products, customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#0c831f] focus:outline-none text-xs"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'answered'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-colors ${activeTab === tab
                                    ? 'bg-[#0c831f] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-0">
                {filteredFaqs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Search size={32} className="text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-900">No questions found</h3>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredFaqs.map((faq, index) => (
                        <div key={faq.id} className={`p-4 hover:bg-gray-50 transition-colors ${index !== filteredFaqs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                            <div className="flex gap-3">
                                {/* Left: Question Details */}
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`w-2 h-2 rounded-full ${faq.status === 'Pending' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${faq.status === 'Pending'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-green-50 text-green-700'
                                            }`}>
                                            {faq.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <Clock size={10} /> {faq.time}
                                        </span>
                                    </div>

                                    <h3 className="text-[11px] font-bold text-gray-900 leading-tight">
                                        "{faq.question}"
                                    </h3>

                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span className="text-gray-500">regarding</span>
                                        <span className="font-bold text-gray-700">{faq.product}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {faq.customer.charAt(0)}
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium">{faq.customer}</span>
                                    </div>

                                    {faq.answer && replyingToId !== faq.id && (
                                        <div className="mt-1.5 p-2 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-xs text-green-900"><strong>Your Answer:</strong> {faq.answer}</p>
                                        </div>
                                    )}

                                    {/* Inline Reply Chatbox */}
                                    {replyingToId === faq.id && (
                                        <div className="mt-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#0c831f]/30 rounded-lg p-2.5 animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle size={14} className="text-[#0c831f]" />
                                                    <span className="text-xs font-bold text-gray-900">Reply to {faq.customer}</span>
                                                </div>
                                                <button
                                                    onClick={cancelReply}
                                                    className="p-1 hover:bg-white rounded transition-colors"
                                                >
                                                    <X size={14} className="text-gray-500" />
                                                </button>
                                            </div>

                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your answer here..."
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] focus:outline-none resize-none bg-white"
                                                rows="3"
                                                autoFocus
                                            />

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={cancelReply}
                                                    className="flex-1 px-3 py-1.5 bg-white text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => submitReply(faq.id)}
                                                    disabled={!replyText.trim()}
                                                    className="flex-1 px-3 py-1.5 bg-[#0c831f] text-white text-xs font-bold rounded-lg hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <Send size={12} />
                                                    Send
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Actions */}
                                <div className="flex flex-col items-end justify-between gap-2">
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === faq.id ? null : faq.id)}
                                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === faq.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px] overflow-hidden">
                                                <button
                                                    onClick={() => handleReply(faq)}
                                                    className="w-full px-3 py-2 text-xs font-bold text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                                >
                                                    <Edit size={12} />
                                                    {faq.status === 'Answered' ? 'Edit Reply' : 'Reply'}
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(faq.id)}
                                                    className="w-full px-3 py-2 text-xs font-bold text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                                >
                                                    <Archive size={12} />
                                                    Archive
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq.id)}
                                                    className="w-full px-3 py-2 text-xs font-bold text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-100"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {replyingToId !== faq.id && deletingId !== faq.id && (
                                        <>
                                            <button
                                                onClick={() => handleReply(faq)}
                                                className="px-4 py-1.5 bg-[#0c831f] text-white rounded-lg text-xs font-bold hover:bg-[#0a6b19] transition-colors flex items-center gap-1.5"
                                            >
                                                <Send size={12} />
                                                Reply
                                            </button>

                                            <button
                                                onClick={() => handleDelete(faq.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}

                                    {/* Delete Confirmation Box */}
                                    {deletingId === faq.id && (
                                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400/40 rounded-lg p-3 w-48 animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Trash2 size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs font-bold text-gray-900">Delete this question?</p>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">This action cannot be undone.</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={cancelDelete}
                                                    className="flex-1 px-3 py-1.5 bg-white text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(faq.id)}
                                                    className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Click outside to close menu */}
            {openMenuId && (
                <div className="fixed inset-0 z-[5]" onClick={() => setOpenMenuId(null)}></div>
            )}
        </div>
    );
};

export default ProductFAQs;
