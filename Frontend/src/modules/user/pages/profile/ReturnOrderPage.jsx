import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, ShieldCheck, CheckCircle, RefreshCw,
    Package, AlertTriangle, ChevronRight, Loader2, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as orderApi from '../../api/orderApi';
import { toast } from 'react-toastify';

const RETURN_REASONS = [
    { id: 'damaged', label: 'Item is damaged or broken', icon: '📦' },
    { id: 'expired', label: 'Expired / stale product', icon: '🕐' },
    { id: 'quality', label: 'Quality not as expected', icon: '⭐' },
    { id: 'wrong', label: 'Wrong item delivered', icon: '❌' },
    { id: 'missing', label: 'Item(s) missing from order', icon: '🔍' },
    { id: 'not_needed', label: 'No longer needed', icon: '🔄' },
];

const ReturnOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(true);
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            if (!token || !id) return;
            try {
                setIsLoadingOrder(true);
                const data = await orderApi.fetchOrderDetails(token, id);
                setOrder(data);

                // Guard: only delivered orders can be returned
                if (data.status !== 'delivered') {
                    toast.error('Returns are only allowed for delivered orders.');
                    navigate(`/orders/${id}`);
                    return;
                }
                // Guard: already has a return request
                if (data.returnRequest?.isRequested) {
                    toast.info('A return request already exists for this order.');
                    navigate(`/orders/${id}`);
                    return;
                }
            } catch (err) {
                toast.error('Failed to load order details.');
                navigate('/orders');
            } finally {
                setIsLoadingOrder(false);
            }
        };
        loadOrder();
    }, [token, id, navigate]);

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.warning('Please select a return reason.');
            return;
        }

        try {
            setSubmitting(true);
            await orderApi.submitReturnRequest(token, id, {
                reason: RETURN_REASONS.find(r => r.id === selectedReason)?.label || selectedReason,
                description: description.trim() || null,
            });
            setSubmitted(true);
        } catch (err) {
            toast.error(err.message || 'Failed to submit return request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading State ──
    if (isLoadingOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] dark:bg-[#141414]">
                <Loader2 size={32} className="animate-spin text-[#0c831f]" />
            </div>
        );
    }

    // ── Success State ──
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-[#141414] dark:to-[#1a1a2e] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-lg shadow-blue-500/20 animate-bounce">
                    <CheckCircle size={36} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                    Return Request Submitted!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-[300px] leading-relaxed">
                    Your return request for Order #{order?.orderId || id} has been received.
                </p>
                <p className="text-xs text-blue-600 font-bold mb-8 max-w-[260px]">
                    Our team will review your request within 24–48 hours.
                </p>

                {/* Timeline */}
                <div className="w-full max-w-sm bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 mb-8 text-left shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">What happens next</p>
                    {[
                        { icon: '🔍', step: 'Request under review', sub: 'Admin will verify your claim', active: true },
                        { icon: '✅', step: 'Return approved', sub: 'Pickup will be scheduled' },
                        { icon: '🚚', step: 'Rider picks up item', sub: 'Delivery partner collects from you' },
                        { icon: '🏪', step: 'Item returned to store', sub: 'Partner delivers to branch' },
                        { icon: '💰', step: 'Refund processed', sub: 'Credited to your SaathiGro Wallet' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${item.active ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-gray-50 dark:bg-white/5'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className={`text-[11px] font-black tracking-tight ${item.active ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>{item.step}</p>
                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/orders')}
                    className="w-full max-w-sm py-3.5 bg-[#0c831f] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f7f0] via-white to-blue-50 dark:from-[#141414] dark:via-[#141414] dark:to-[#141414] pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
                <div className="max-w-2xl mx-auto flex items-center gap-4 p-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <RefreshCw size={15} className="text-blue-600" />
                        <h1 className="text-[14px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Return Items</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Order Summary Card */}
                {order && (
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4 shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Order Details</p>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-black text-gray-900 dark:text-white">#{order.orderId}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                    {order.items?.length || 0} items · ₹{order.totalAmount?.toFixed(2)}
                                </p>
                            </div>
                            <span className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100 dark:border-green-500/20">
                                Delivered
                            </span>
                        </div>

                        {/* Items Preview */}
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 py-1.5">
                                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                        <p className="text-[9px] text-gray-400 font-medium">Qty: {item.quantity} · ₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reason Selection */}
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Select reason for return *</p>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm divide-y divide-gray-50 dark:divide-white/5">
                        {RETURN_REASONS.map((reason) => (
                            <button
                                key={reason.id}
                                onClick={() => setSelectedReason(reason.id)}
                                className={`w-full py-4 px-5 text-left transition-all flex items-center justify-between group ${selectedReason === reason.id
                                    ? 'bg-blue-50/80 dark:bg-blue-500/10'
                                    : 'hover:bg-gray-50/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{reason.icon}</span>
                                    <span className={`text-[11px] font-bold ${selectedReason === reason.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {reason.label}
                                    </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selectedReason === reason.id
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-200 dark:border-white/20'
                                    }`}>
                                    {selectedReason === reason.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                        Additional details <span className="text-gray-300 dark:text-gray-600 font-medium normal-case">(optional)</span>
                    </p>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what happened with the item in detail..."
                        maxLength={500}
                        className="w-full h-28 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-[11px] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm resize-none font-medium"
                    />
                    <p className="text-[9px] text-gray-300 dark:text-gray-600 text-right mt-1 font-medium">{description.length}/500</p>
                </div>

                {/* Policy Note */}
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 flex gap-3">
                    <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black text-blue-800 dark:text-blue-300 mb-1">sathiGro Return Policy</p>
                        <p className="text-[9px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                            Returns are accepted within 24 hours of delivery for damaged, expired, or wrong items.
                            Refunds are credited to your sathiGro Wallet within 3–5 working days after verification.
                        </p>
                    </div>
                </div>

                {/* Return timeline notice */}
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl p-4">
                    <Clock size={16} className="text-amber-600 flex-shrink-0" />
                    <p className="text-[9.5px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                        Return requests are reviewed within 24–48 hours. Pickup will be scheduled upon approval.
                    </p>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-gray-100 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div className="max-w-2xl mx-auto">
                    <button
                        disabled={!selectedReason || submitting}
                        onClick={handleSubmit}
                        className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg ${selectedReason && !submitting
                            ? 'bg-blue-600 text-white shadow-blue-500/20'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={14} />
                                Submit Return Request
                            </>
                        )}
                    </button>
                    {!selectedReason && (
                        <p className="text-center text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                            Please select a reason to continue
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReturnOrderPage;
