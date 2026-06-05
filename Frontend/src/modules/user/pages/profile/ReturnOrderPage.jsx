import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, ShieldCheck, CheckCircle, RefreshCw,
    Package, AlertTriangle, ChevronRight, Loader2, Clock, Camera, X, Image as ImageIcon
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
    const { token, isWebView } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(true);
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);



    useEffect(() => {
        const loadOrder = async () => {
            if (!token || !id) return;
            try {
                setIsLoadingOrder(true);
                const data = await orderApi.fetchOrderDetails(token, id);
                setOrder(data);

                if (data.status !== 'delivered') {
                    toast.error('Returns are only allowed for delivered orders.');
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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.warning('You can only upload up to 5 images.');
            return;
        }

        setImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            if (!prev[index].startsWith('data:image')) {
                URL.revokeObjectURL(prev[index]);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.warning('Please select a return reason.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('reason', RETURN_REASONS.find(r => r.id === selectedReason)?.label || selectedReason);
            formData.append('description', description.trim());
            
            images.forEach((image) => {
                formData.append('images', image);
            });

            await orderApi.submitReturnRequest(token, id, formData);
            setSubmitted(true);
        } catch (err) {
            toast.error(err.message || 'Failed to submit return request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoadingOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <Loader2 size={32} className="animate-spin text-[#0c831f]" />
            </div>
        );
    }

    if (submitted || order?.returnRequest?.isRequested) {
        const req = order?.returnRequest;
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-lg shadow-blue-500/20">
                    <CheckCircle size={36} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                    {submitted ? 'Return Request Submitted!' : 'Return Status'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[300px] leading-relaxed">
                    Order #{order?.orderId || id} · {req?.status || 'Pending Review'}
                </p>

                {(['Accepted', 'Approved', 'Scheduled'].includes(req?.status)) && req?.returnOTP && (
                    <div className="w-full max-w-sm bg-blue-600 rounded-3xl p-6 mb-8 text-white shadow-2xl relative overflow-hidden group">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/70">Secure Handover Code</p>
                        <h3 className="text-5xl font-black tracking-[0.2em] mb-4 drop-shadow-md">{req.returnOTP}</h3>
                        <div className="flex items-center justify-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/10">
                            <AlertTriangle size={14} />
                            <p className="text-[10px] font-bold">Give this to the rider ONLY during pickup</p>
                        </div>
                    </div>
                )}

                <div className="w-full max-w-sm bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 mb-8 text-left shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Live Progress</p>
                    {[
                        { icon: '🔍', step: 'Request under review', sub: 'Admin is verifying your claim', active: req?.status === 'Pending' },
                        { icon: '✅', step: 'Return approved', sub: 'OTP generated for pickup', active: ['Accepted', 'Approved'].includes(req?.status) },
                        { icon: '🚚', step: 'Rider scheduled', sub: 'Pickup assigned to partner', active: req?.status === 'Scheduled' },
                        { icon: '📦', step: 'Item picked up', sub: 'Rider has collected the item', active: req?.status === 'PickedUp' },
                        { icon: '💰', step: 'Returned \u0026 Refunded', sub: 'Refund credited to your wallet', active: req?.status === 'Returned' },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-start gap-3 mb-3 last:mb-0 transition-opacity ${item.active ? 'opacity-100' : 'opacity-40'}`}>
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
        <div className="min-h-screen bg-white dark:bg-black pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
                <div className="max-w-2xl mx-auto flex items-center gap-4 p-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-300">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <RefreshCw size={15} className="text-blue-600" />
                        <h1 className="text-[14px] font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Return Request</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Order Summary Card */}
                {order && (
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">#{order.orderId}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100 dark:border-green-500/10">
                                COMPLETED
                            </span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purchased Items</p>
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-white/10 overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Qty: {item.quantity} · ₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reason Selection */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block px-1">Reason for Return *</label>
                    <div className="grid grid-cols-1 gap-2.5">
                        {RETURN_REASONS.map((reason) => (
                            <button
                                key={reason.id}
                                onClick={() => setSelectedReason(reason.id)}
                                className={`w-full py-4 px-5 rounded-2xl text-left transition-all flex items-center justify-between border-2 ${selectedReason === reason.id
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/5'
                                    : 'border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-xl">{reason.icon}</span>
                                    <span className={`text-xs font-black tracking-tight ${selectedReason === reason.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {reason.label}
                                    </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedReason === reason.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-white/20'}`}>
                                    {selectedReason === reason.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Proof Upload */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block px-1">Proof Photos (Max 5)</label>
                    <div className="flex flex-wrap gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm group border border-gray-100 dark:border-white/10 animate-in zoom-in duration-300">
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <div className="contents">
                                {/* Standard HTML5 Camera Upload (Works in Web & WebViews) */}
                                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-500/30 bg-blue-50/30 dark:bg-blue-500/5 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all active:scale-95">
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                                    <Camera size={24} className="text-blue-600" />
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-center px-2">Camera</span>
                                </label>
                                
                                {/* Standard Gallery Upload */}
                                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all active:scale-95">
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                                    <ImageIcon size={24} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-[9px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">Gallery</span>
                                </label>
                            </div>
                        )}
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold mt-3 px-1">📸 Please upload clear photos of the damaged item or expiry date</p>
                </div>

                {/* Description */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block px-1">Provide more details</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explain the issue briefly (e.g. Broken seal, stale taste...)"
                        maxLength={500}
                        className="w-full h-32 p-5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs dark:text-white placeholder:text-gray-400 font-bold resize-none transition-all shadow-inner"
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                        <p className="text-[9px] text-blue-600 font-black tracking-widest uppercase">Safe verification process</p>
                        <p className="text-[9px] text-gray-400 font-black">{description.length}/500</p>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 z-50">
                <div className="max-w-2xl mx-auto">
                    <button
                        disabled={!selectedReason || submitting}
                        onClick={handleSubmit}
                        className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-xl ${selectedReason && !submitting
                            ? 'bg-[#0c831f] text-white shadow-green-500/20'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none font-black'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Validating Request...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Submit Return Claim
                            </>
                        )}
                    </button>
                    {!selectedReason && (
                        <p className="text-center text-[9px] text-red-500 font-black mt-3 uppercase tracking-widest animate-pulse">
                            Please select a reason above
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReturnOrderPage;
