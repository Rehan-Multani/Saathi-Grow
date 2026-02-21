import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    CheckCircle,
    ShoppingBag,
    Clock,
    ShieldCheck,
    ArrowRight,
    Truck,
    AlertCircle,
    Star,
    PartyPopper,
    Sparkles,
    Lock
} from 'lucide-react';

// CelebrationBurst moved to OrderSuccessPage.jsx

import { useLocation as useGlobalLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import * as orderApi from '../../api/orderApi';
import { toast } from 'react-toastify';

const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const CheckoutPage = () => {
    const { cartTotal = 0, clearCart, cartCount = 0, cart = [] } = useCart();
    const { location: globalLocation, openLocationModal } = useGlobalLocation();
    const { user, token } = useAuth();
    const [isPlacing, setIsPlacing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [onlineMethod, setOnlineMethod] = useState('phonepe'); // phonepe, gpay
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const deliveryFee = cartTotal >= 500 ? 0 : 25;
    const handlingFee = 5;
    const finalTotal = cartTotal + deliveryFee + handlingFee;

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!globalLocation.address) {
            toast.error("Please select a valid delivery address first.");
            return;
        }

        setIsPlacing(true);

        const orderData = {
            items: cart.map(item => ({
                product: item.id || item._id, // Clean mapping fallback
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image
            })),
            shippingAddress: {
                name: user?.name,
                phone: user?.phone,
                street: globalLocation.address,
                city: '', // Advanced parsing could happen here depending on bounds
                state: '',
                zipCode: '',
                location: globalLocation.coordinates ? { type: 'Point', coordinates: [globalLocation.coordinates.lng, globalLocation.coordinates.lat] } : undefined
            },
            totalAmount: finalTotal
        };

        try {
            if (paymentMethod === 'cod') {
                await orderApi.createCODOrder(token, orderData);
                clearCart();
                navigate('/order-success');
            } else {
                // Online Payment Workflow leveraging Razorpay
                const isSdkReady = await loadRazorpaySDK();
                if (!isSdkReady) {
                    toast.error("Network issue: Unable to load secure payment gateway");
                    setIsPlacing(false);
                    return;
                }

                // Call Backend for Order Initiation Payload
                const rpPayload = await orderApi.createRazorpayOrder(token, finalTotal);

                const options = {
                    key: 'rzp_test_8sYbzHWidwe5Zw', // Test API Key (safe to expose publicly on frontend since it's just public mapping)
                    amount: rpPayload.amount,
                    currency: rpPayload.currency,
                    name: "SaathiGrow Rapid",
                    description: "Your Lightning Fast Grocery Checkout",
                    order_id: rpPayload.razorpayOrderId,
                    handler: async function (response) {
                        try {
                            await orderApi.verifyRazorpayPayment(token, {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                orderData
                            });
                            clearCart();
                            navigate('/order-success');
                        } catch (verifyErr) {
                            toast.error("Payment was blocked or untrusted signature failed");
                        }
                    },
                    prefill: {
                        name: user?.name || "Shopper",
                        email: user?.email || "payment@saathigrow.com",
                        contact: user?.phone || "9999999999"
                    },
                    theme: {
                        color: "#0c831f"
                    },
                    modal: {
                        ondismiss: function () {
                            setIsPlacing(false);
                        }
                    }
                };

                const razorpayWindow = new window.Razorpay(options);
                razorpayWindow.on('payment.failed', function (res) {
                    toast.error(res.error.description);
                    setIsPlacing(false);
                });

                razorpayWindow.open();
                return; // Wait for active JS UI payload to finish
            }
        } catch (error) {
            console.error("Failure checking out:", error);
            toast.error(error.message);
        }

        setIsPlacing(false);
    };



    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:bg-none md:dark:bg-black transition-colors duration-300 pb-32 pt-8 relative">
            {/* Payment Processing Overlay */}
            {isPlacing && paymentMethod === 'online' && (
                <div className="fixed inset-0 z-[100] bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:bg-none md:dark:bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="w-full max-w-xs flex flex-col items-center">
                        <div className="mb-10 relative">
                            <div className="w-16 h-16 border-4 border-gray-100 dark:border-white/5 border-t-[#0c831f] rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheck size={24} className="text-[#0c831f]" />
                            </div>
                        </div>
                        <img
                            src={onlineMethod === 'phonepe' ? "https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" : "https://www.gstatic.com/lamda/images/google_pay_logo_stack_64dp.png"}
                            alt="Payment Method"
                            className="h-8 mb-6 object-contain"
                        />
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2">Redirecting to {onlineMethod === 'phonepe' ? 'PhonePe' : 'Google Pay'}</h2>
                        <p className="text-xs text-gray-500 font-medium text-center">Please do not refresh or close this window while we process your secure payment.</p>

                        <div className="mt-12 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-full">
                            <Lock size={12} className="text-[#0c831f]" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure 256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-2xl mx-auto px-4">

                {/* Clean Header Style like Notifications Page */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="p-1.5 bg-gray-50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft size={16} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight capitalize leading-none">Checkout</h1>
                        <p className="!text-[8px] font-bold text-gray-400 mt-0.5 tracking-wider">{cartCount} items • ₹{finalTotal}</p>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <MapPin size={14} className="text-[#0c831f]" />
                        <h3 className="!text-[10px] font-black text-gray-400 tracking-widest">Delivery address</h3>
                    </div>
                    <div className="w-full px-1">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[7px] font-black bg-gray-50 dark:bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Selected Address</span>
                            <button
                                onClick={openLocationModal}
                                className="text-[#0c831f] text-[9px] font-black uppercase tracking-widest"
                            >
                                Change
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-800 dark:text-gray-200 font-bold leading-relaxed">
                            {globalLocation.address || "Select Address"}
                        </p>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Clock size={14} className="text-[#0c831f]" />
                        <h3 className="!text-[10px] font-black text-gray-400 tracking-widest">Payment method</h3>
                    </div>
                    <div className="space-y-3">
                        {/* COD Option */}
                        <div
                            onClick={() => setPaymentMethod('cod')}
                            className={`flex items-center justify-between p-4 rounded-[20px] cursor-pointer transition-all border ${paymentMethod === 'cod' ? 'bg-green-50/50 dark:bg-green-500/5 border-[#0c831f]' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-[4px] bg-white ${paymentMethod === 'cod' ? 'border-[#0c831f]' : 'border-gray-300'}`}></div>
                                <span className={`text-[11px] font-black capitalize tracking-tight ${paymentMethod === 'cod' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Cash on delivery</span>
                            </div>
                            {paymentMethod === 'cod' && <ShieldCheck size={14} className="text-[#0c831f]" />}
                        </div>

                        {/* Online Payment Main Option */}
                        <div
                            onClick={() => setPaymentMethod('online')}
                            className={`flex flex-col p-4 rounded-[20px] cursor-pointer transition-all border ${paymentMethod === 'online' ? 'bg-green-50/50 dark:bg-green-500/5 border-[#0c831f]' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-[4px] bg-white ${paymentMethod === 'online' ? 'border-[#0c831f]' : 'border-gray-300'}`}></div>
                                    <span className={`text-[11px] font-black capitalize tracking-tight ${paymentMethod === 'online' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Online payment</span>
                                </div>
                                {paymentMethod === 'online' && <ShieldCheck size={14} className="text-[#0c831f]" />}
                            </div>

                            {/* Sub-options for Online Payment */}
                            {paymentMethod === 'online' && (
                                <div className="space-y-2 pl-7 animate-in slide-in-from-top-2 duration-300">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setOnlineMethod('phonepe'); }}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${onlineMethod === 'phonepe' ? 'bg-white dark:bg-white/10 border-green-200' : 'bg-transparent border-transparent hover:bg-white/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full border-2 ${onlineMethod === 'phonepe' ? 'border-[#0c831f] bg-[#0c831f]' : 'border-gray-300'}`}></div>
                                            <img
                                                src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png"
                                                alt="PhonePe"
                                                className="h-4 w-auto object-contain brightness-110"
                                            />
                                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">PhonePe</span>
                                        </div>
                                    </div>
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setOnlineMethod('gpay'); }}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${onlineMethod === 'gpay' ? 'bg-white dark:bg-white/10 border-green-200' : 'bg-transparent border-transparent hover:bg-white/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full border-2 ${onlineMethod === 'gpay' ? 'border-[#0c831f] bg-[#0c831f]' : 'border-gray-300'}`}></div>
                                            <img
                                                src="https://www.gstatic.com/lamda/images/google_pay_logo_stack_64dp.png"
                                                alt="Google Pay"
                                                className="h-4 w-auto object-contain"
                                            />
                                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">Google Pay</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bill Details */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <ShoppingBag size={14} className="text-[#0c831f]" />
                        <h3 className="!text-[10px] font-black text-gray-400 tracking-widest">Bill details</h3>
                    </div>
                    <div className="space-y-3 px-1">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-gray-500 font-medium capitalize">Items total</span>
                            <span className="text-[11px] font-black text-gray-900 dark:text-white">₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-gray-500 font-medium capitalize">Delivery fee</span>
                            <span className={`text-[11px] font-black ${deliveryFee === 0 ? 'text-[#0c831f]' : 'text-gray-900 dark:text-white'}`}>
                                {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-4">
                            <span className="text-[11px] text-gray-500 font-medium capitalize">Handling fee</span>
                            <span className="text-[11px] font-black text-gray-900 dark:text-white">₹{handlingFee}</span>
                        </div>
                        <div className="pt-5 border-t border-dashed border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <span className="text-[14px] font-black text-gray-900 dark:text-white">To pay</span>
                            <span className="text-[20px] font-black text-gray-900 dark:text-white tracking-tighter">₹{finalTotal}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 p-4 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-5 px-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Total Pay</span>
                        <span className="text-[18px] font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{finalTotal}</span>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isPlacing || cart.length === 0}
                        style={{ borderRadius: '16px' }}
                        className="flex-1 bg-[#0c831f] text-white h-12 font-black text-[12px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isPlacing ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Place Order</span>
                                <ArrowRight size={16} strokeWidth={3} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
