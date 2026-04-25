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
    Lock,
    Wallet,
    Loader2,
    Calendar,
    Ticket
} from 'lucide-react';

import { useLocation as useGlobalLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import * as orderApi from '../../api/orderApi';
import * as walletApi from '../../api/walletApi';
import { fetchDeliverySlots } from '../../api/orderApi';
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
    const { location: globalLocation, openLocationModal, savedAddresses, updateLocation } = useGlobalLocation();
    const { user, token } = useAuth();
    const { activeStore, isStoreOutOfRange, isStoreInactive, openStoreSelector } = useStore();
    const [isPlacing, setIsPlacing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [walletBalance, setWalletBalance] = useState(0);
    const [onlineMethod, setOnlineMethod] = useState('phonepe');
    const [billDetails, setBillDetails] = useState(null);
    const [isCalculating, setIsCalculating] = useState(true);
    const [deliverySlots, setDeliverySlots] = useState([]);
    const [selectedSlotId, setSelectedSlotId] = useState(null);   // ObjectId of chosen slot
    const [selectedSlotLabel, setSelectedSlotLabel] = useState(null); // Display label
    const [isImmediate, setIsImmediate] = useState(true);          // Default = Immediate
    const [loadingSlots, setLoadingSlots] = useState(true);
    
    // Promo Code States
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [availablePromos, setAvailablePromos] = useState([]);
    const [loadingPromos, setLoadingPromos] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchWallet = async () => {
            if (token) {
                try {
                    const data = await walletApi.fetchWalletData(token);
                    setWalletBalance(data.balance);
                } catch (err) {
                    console.error('Wallet fetch failed', err);
                }
            }
        };
        fetchWallet();

        const loadSlots = async () => {
            try {
                const data = await fetchDeliverySlots();
                setDeliverySlots(data);
                // Don't auto-select a slot — default is Immediate
            } catch (err) {
                console.error('Slots fetch failed', err);
            } finally {
                setLoadingSlots(false);
            }
        };
        loadSlots();
    }, [token]);

    // PREFILL ADDRESS LOGIC
    useEffect(() => {
        if (globalLocation.address === 'Select Location' && savedAddresses?.length > 0) {
            const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
            if (defaultAddr) {
                updateLocation({
                    address: defaultAddr.address,
                    city: defaultAddr.city,
                    coordinates: defaultAddr.coordinates
                });
            }
        }
    }, [savedAddresses, globalLocation.address, updateLocation]);

    useEffect(() => {
        const fetchBill = async () => {
            if (cart.length === 0) return;
            setIsCalculating(true);
            try {
                const items = cart.map(item => ({
                    product: item.id || item._id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image
                }));
                const computed = await orderApi.calculateBill(token, items, {
                    storeId: activeStore?.id,
                    storeType: activeStore?.type
                }, appliedPromo?._id);
                setBillDetails(computed);
            } catch (error) {
                console.error(error);
                toast.error("Pricing sync error");
            } finally {
                setIsCalculating(false);
            }
        };
        fetchBill();
    }, [cart, token, appliedPromo]);

    useEffect(() => {
        const fetchApplicablePromos = async () => {
            if (!token || cartTotal <= 0) return;
            setLoadingPromos(true);
            try {
                const result = await orderApi.getApplicablePromos(token, cartTotal);
                setAvailablePromos(result.data || []);
            } catch (err) {
                console.error("Failed to fetch promos", err);
            } finally {
                setLoadingPromos(false);
            }
        };
        fetchApplicablePromos();
    }, [cartTotal, token]);

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setIsValidatingPromo(true);
        try {
            const result = await orderApi.validatePromoCode(token, promoInput, cartTotal);
            setAppliedPromo(result.promoCode);
            toast.success(`Coupon Applied! Discount: ₹${result.discountAmount}`);
        } catch (error) {
            toast.error(error.message || "Invalid Promo Code");
            setAppliedPromo(null);
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoInput('');
        toast.info("Promo code removed");
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!globalLocation.address) {
            toast.error("Please select a valid delivery address first.");
            return;
        }

        if (!activeStore || isStoreOutOfRange || isStoreInactive) {
            openStoreSelector?.();
            toast.error(isStoreInactive ? 'This store is currently inactive.' : 'Store is no longer available. Please select another store.');
            return;
        }

        // Account Security Guard
        if (user && user.isActive === false) {
            toast.error("Your account is deactivated. You cannot place orders.");
            return;
        }

        // Delivery timing is always valid — either Immediate or a chosen slot

        const totalToPay = billDetails?.totalAmount || cartTotal;

        if (paymentMethod === 'wallet' && walletBalance < totalToPay) {
            toast.error("Insufficient wallet balance. Please top up or use another method.");
            return;
        }

        setIsPlacing(true);

        const orderData = {
            items: cart.map(item => ({
                product: item.id || item._id,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image
            })),
            shippingAddress: {
                name: user?.name,
                phone: user?.phone,
                street: globalLocation.address,
                city: globalLocation.city || '',
                state: '',
                zipCode: '',
                location: globalLocation.coordinates ? { type: 'Point', coordinates: globalLocation.coordinates } : undefined
            },
            totalAmount: totalToPay,
            deliverySlot: isImmediate ? 'Immediate' : selectedSlotLabel,   // legacy label for display
            deliverySlotId: isImmediate ? null : selectedSlotId,            // NEW: ObjectId ref
            isImmediate,                                                     // NEW: flag
            storeId: activeStore?.id,
            storeType: activeStore?.type,
            promoId: appliedPromo?._id
        };

        try {
            if (paymentMethod === 'cod') {
                await orderApi.createCODOrder(token, orderData);
                clearCart();
                navigate('/order-success');
            } else if (paymentMethod === 'wallet') {
                await orderApi.createWalletOrder(token, orderData);
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
                const itemsToCheckout = cart.map(item => ({
                    product: item.id || item._id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image
                }));
                const rpPayload = await orderApi.createRazorpayOrder(
                    token, 
                    itemsToCheckout, 
                    appliedPromo?._id,
                    activeStore?.id,
                    activeStore?.type
                );

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: rpPayload.amount,
                    currency: rpPayload.currency,
                    name: "Saathigro Rapid",
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
                        email: user?.email || "payment@Saathigro.com",
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
                return;
            }
        } catch (error) {
            console.error("Failure checking out:", error);
            toast.error(error.message);
        }

        setIsPlacing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:bg-none md:dark:bg-black transition-colors duration-300 pb-32 pt-8 relative">
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
                {/* Out of Range Banner */}
                {isStoreOutOfRange && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top duration-300">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <div>
                            <h4 className="text-sm font-black text-red-600 dark:text-red-400">Store out of delivery range</h4>
                            <p className="text-[10px] font-bold text-red-500/80 leading-tight mt-1">
                                {activeStore?.name} cannot deliver to your current address.
                                Please change your delivery address or switch to a closer store.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-3 text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 underline underline-offset-2"
                            >
                                Switch Store
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 bg-gray-50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft size={16} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight capitalize leading-none">Checkout</h1>
                        <p className="!text-[8px] font-bold text-gray-400 mt-0.5 tracking-wider">{cartCount} items ₹{billDetails?.totalAmount || cartTotal}</p>
                    </div>
                </div>

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

                {/* Delivery Timing Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Calendar size={14} className="text-[#0c831f]" />
                        <h3 className="!text-[10px] font-black text-gray-400 tracking-widest uppercase">When to Deliver?</h3>
                    </div>

                    {loadingSlots ? (
                        <div className="flex gap-3 px-1 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 w-28 bg-gray-100 dark:bg-white/5 rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 px-1">
                            {/* Immediate option — always shown first */}
                            <div
                                onClick={() => { setIsImmediate(true); setSelectedSlotId(null); setSelectedSlotLabel(null); }}
                                className={`px-4 py-2.5 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center min-w-[110px] ${isImmediate
                                    ? 'border-[#0c831f] bg-green-50 dark:bg-green-500/10'
                                    : 'border-gray-100 dark:border-white/5 bg-transparent hover:border-gray-200'
                                    }`}
                            >
                                <span className={`text-[11px] font-black ${isImmediate ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-200'}`}>⚡ Immediate</span>
                                <span className="text-[8px] font-bold text-gray-400 mt-0.5 tracking-tight">ASAP Delivery</span>
                            </div>

                            {/* Slot options */}
                            {deliverySlots.map((slot) => (
                                <div
                                    key={slot._id}
                                    onClick={() => { setIsImmediate(false); setSelectedSlotId(slot._id); setSelectedSlotLabel(slot.label); }}
                                    className={`px-4 py-2.5 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center min-w-[110px] ${!isImmediate && selectedSlotId === slot._id
                                        ? 'border-[#0c831f] bg-green-50 dark:bg-green-500/10'
                                        : 'border-gray-100 dark:border-white/5 bg-transparent hover:border-gray-200'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black ${!isImmediate && selectedSlotId === slot._id ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-200'
                                        }`}>
                                        {slot.label}
                                    </span>
                                    <span className="text-[8px] font-bold text-gray-400 mt-0.5 tracking-tight">
                                        {slot.startTime} – {slot.endTime}
                                    </span>
                                </div>
                            ))}

                            {deliverySlots.length === 0 && (
                                <p className="text-[10px] text-gray-400 font-medium px-1 pt-1">
                                    No scheduled slots active. Immediate delivery only.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Chosen timing summary */}
                    <p className="text-[9px] font-bold text-gray-400 mt-3 px-1 uppercase tracking-wider">
                        {isImmediate
                            ? '⚡ Your order will be dispatched as soon as it is ready'
                            : `🕐 Scheduled for delivery during: ${selectedSlotLabel}`
                        }
                    </p>
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Clock size={14} className="text-[#0c831f]" />
                        <h3 className="!text-[10px] font-black text-gray-400 tracking-widest">Payment method</h3>
                    </div>
                    <div className="space-y-3">
                        {/* Wallet Option */}
                        <div
                            onClick={() => setPaymentMethod('wallet')}
                            className={`flex items-center justify-between p-4 rounded-[20px] cursor-pointer transition-all border ${paymentMethod === 'wallet' ? 'bg-green-50/50 dark:bg-green-500/5 border-[#0c831f]' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-[4px] bg-white ${paymentMethod === 'wallet' ? 'border-[#0c831f]' : 'border-gray-300'}`}></div>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] font-black capitalize tracking-tight ${paymentMethod === 'wallet' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>sathiGro Wallet</span>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Available: ₹{walletBalance.toFixed(2)}</span>
                                </div>
                            </div>
                            <Wallet size={16} className={`${paymentMethod === 'wallet' ? 'text-[#0c831f]' : 'text-gray-300'}`} />
                        </div>

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

                            {/* Sub-options for Online Payment removed as per user request */}
                        </div>
                    </div>
                </div>

                {/* Promo Code Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Ticket size={14} className="text-[#0c831f]" />
                        <h3 className="!text-[10px] font-black text-gray-400 tracking-widest uppercase">Promo Code</h3>
                    </div>
                    
                    {!appliedPromo ? (
                        <>
                            <div className="flex gap-2 px-1">
                                <div className="relative flex-1">
                                    <input 
                                        type="text"
                                        placeholder="Enter Coupon Code"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-[11px] font-bold focus:outline-none focus:border-[#0c831f] transition-all"
                                    />
                                    {isValidatingPromo && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-[#0c831f]" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={isValidatingPromo || !promoInput}
                                    className="bg-[#0c831f] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                                >
                                    Apply
                                </button>
                            </div>

                            {/* Available Promos List */}
                            {loadingPromos ? (
                                <div className="mt-4 px-1 animate-pulse">
                                    <div className="h-2 w-20 bg-gray-100 dark:bg-white/5 rounded-full mb-3"></div>
                                    <div className="flex flex-col gap-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="bg-gray-50 dark:bg-white/5 h-14 rounded-2xl border border-gray-100 dark:border-white/10"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : availablePromos.length > 0 && (
                                <div className="mt-4 px-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Available Offers</p>
                                    <div className="flex flex-col gap-2">
                                        {availablePromos.map((promo) => (
                                            <div 
                                                key={promo._id}
                                                onClick={() => {
                                                    setPromoInput(promo.code);
                                                    // Auto apply if clicked? Let's just set the input for now or auto-apply
                                                    // Better to auto-apply for UX
                                                    const autoApply = async () => {
                                                        setIsValidatingPromo(true);
                                                        try {
                                                            const result = await orderApi.validatePromoCode(token, promo.code, cartTotal);
                                                            setAppliedPromo(result.promoCode);
                                                            setPromoInput(promo.code);
                                                            toast.success(`Coupon Applied!`);
                                                        } catch (error) {
                                                            toast.error(error.message);
                                                        } finally {
                                                            setIsValidatingPromo(false);
                                                        }
                                                    };
                                                    autoApply();
                                                }}
                                                className="group cursor-pointer bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-[#0c831f] transition-all active:scale-[0.98]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-[#0c831f] group-hover:bg-[#0c831f] group-hover:text-white transition-colors">
                                                        <Ticket size={14} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{promo.code}</h4>
                                                        <p className="text-[9px] text-gray-400 font-bold">{promo.description || `Save ${promo.discountType === 'Percentage' ? promo.discountValue + '%' : '₹' + promo.discountValue}`}</p>
                                                    </div>
                                                </div>
                                                <div className="text-[#0c831f] text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Apply Code
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-1">
                            <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#0c831f] rounded-full flex items-center justify-center text-white">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">'{appliedPromo.code}' Applied!</h4>
                                        <p className="text-[9px] font-bold text-[#0c831f] uppercase tracking-wider">Extra savings unlocked</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleRemovePromo}
                                    className="text-red-500 text-[9px] font-black uppercase tracking-widest"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bill Details */}
                <div className="mb-8 relative min-h-[160px]">
                    {isCalculating && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                            <div className="w-5 h-5 border-2 border-green-200 border-t-[#0c831f] rounded-full animate-spin"></div>
                            <span className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">Calculating Securely</span>
                        </div>
                    )}
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
                            <span className={`text-[11px] font-black ${billDetails?.deliveryFee === 0 ? 'text-[#0c831f]' : 'text-gray-900 dark:text-white'}`}>
                                {billDetails?.deliveryFee === 0 ? 'Free' : `₹${billDetails?.deliveryFee || '-'}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-gray-500 font-medium capitalize">Handling fee</span>
                            <span className="text-[11px] font-black text-gray-900 dark:text-white">₹{billDetails?.handlingFee || '-'}</span>
                        </div>

                        {billDetails?.taxAmount > 0 && (
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-[11px] text-gray-500 font-medium capitalize">Taxes (GST)</span>
                                <span className="text-[11px] font-black text-gray-900 dark:text-white">₹{billDetails?.taxAmount}</span>
                            </div>
                        )}

                        {billDetails?.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-[#0c831f] animate-in slide-in-from-left duration-300">
                                <span className="text-[11px] font-bold capitalize">Promo Discount</span>
                                <span className="text-[11px] font-black">−₹{billDetails?.discountAmount}</span>
                            </div>
                        )}

                        <div className="pt-5 border-t border-dashed border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <span className="text-[14px] font-black text-gray-900 dark:text-white">To pay</span>
                            <span className="text-[20px] font-black text-gray-900 dark:text-white tracking-tighter">₹{billDetails?.totalAmount || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 p-4 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-5 px-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Total Pay</span>
                        <span className="text-[18px] font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{billDetails?.totalAmount || '-'}</span>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isPlacing || cart.length === 0 || isStoreOutOfRange || user?.isActive === false}
                        style={{ borderRadius: '16px' }}
                        className={`flex-1 ${isStoreOutOfRange || user?.isActive === false ? 'bg-gray-400' : 'bg-[#0c831f]'} text-white h-12 font-black text-[12px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2`}
                    >
                        {isPlacing ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>{isStoreOutOfRange ? 'Out of Range' : (user?.isActive === false ? 'Account Blocked' : 'Place Order')}</span>
                                {!isStoreOutOfRange && user?.isActive !== false && <ArrowRight size={16} strokeWidth={3} />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
