import React from 'react';
import { X, Minus, Plus, ChevronRight, Clock, ShoppingBag, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const CartSidebar = () => {
    const { isCartOpen, setIsCartOpen, cart, updateQuantity, cartTotal, cartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Calculate total bill
    const deliveryFee = 0; // Free as per image
    const handlingFee = 2; // Matches image
    const itemTotalOriginal = cart.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.quantity, 0);
    const itemTotalDiscounted = cartTotal;
    const savings = itemTotalOriginal - itemTotalDiscounted;
    const finalTotal = itemTotalDiscounted + deliveryFee + handlingFee;

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Sidebar Content */}
            <div className="relative w-full sm:max-w-[400px] bg-[#f3f4f6] dark:bg-[#0a0a0a] h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="px-5 py-4 bg-white dark:bg-[#141414] flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">My Basket</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-900 dark:text-gray-100" />
                    </button>
                </div>

                {/* Savings Banner */}
                {savings > 0 && (
                    <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 flex items-center justify-between border-b border-blue-100 dark:border-blue-500/20">
                        <span className="text-blue-700 dark:text-blue-400 font-medium text-xs">Your total savings</span>
                        <span className="text-blue-700 dark:text-blue-400 font-bold text-xs">₹{savings}</span>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#141414] rounded-xl p-8 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center">
                                <ShoppingBag size={32} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Your cart is empty</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add items to start shopping</p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-6 py-2.5 bg-[#0c831f] text-white rounded-full font-medium text-xs hover:bg-[#0a6b19] transition shadow-sm"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Delivery Card */}
                            <div className="bg-white dark:bg-[#141414] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 bg-green-50 dark:bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock size={16} className="text-[#0c831f] dark:text-[#10b981]" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 !text-[15px] leading-tight">Delivery in 8 minutes</h3>
                                        <p className="!text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Shipment of {cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 divide-y divide-dashed divide-gray-100 dark:divide-white/5">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-start pt-3 first:pt-0">
                                            {/* Product Image */}
                                            <div className="w-10 h-10 border border-gray-100 dark:border-white/5 rounded-lg bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h4 className="!text-[14px] font-normal text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 pr-2">{item.name}</h4>
                                                </div>
                                                <p className="!text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">{item.weight}</p>

                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900 dark:text-[#f8fafc] !text-[14px]">₹{item.price * item.quantity}</span>

                                                    {/* Qty Control */}
                                                    <div className="flex items-center gap-2 bg-[#0c831f] dark:bg-[#0c831f] rounded-lg px-1.5 py-0.5 shadow-sm h-7 min-w-[55px] justify-between">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-white hover:text-green-100 flex items-center justify-center w-4 h-full"><Minus size={12} strokeWidth={2.5} /></button>
                                                        <span className="text-white text-xs font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="text-white hover:text-green-100 flex items-center justify-center w-4 h-full"><Plus size={12} strokeWidth={2.5} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bill Details */}
                            <div className="bg-white dark:bg-[#141414] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3">Bill details</h3>
                                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Items total</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 dark:text-gray-600 line-through">₹{itemTotalOriginal}</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">₹{itemTotalDiscounted}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <span className="underline decoration-dotted decoration-gray-300 dark:decoration-gray-700">Delivery charge</span>
                                            <Info size={10} className="text-gray-400" />
                                        </div>
                                        <span className="text-[#0c831f] dark:text-[#10b981] font-medium">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <span className="underline decoration-dotted decoration-gray-300 dark:decoration-gray-700">Handling charge</span>
                                            <Info size={10} className="text-gray-400" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">₹{handlingFee}</span>
                                    </div>
                                    <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-gray-100 text-base">Grand total</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100 text-base">₹{finalTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-4 bg-white dark:bg-[#141414] shadow-lg border-t border-gray-100 dark:border-white/5 sticky bottom-0 z-20">
                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    navigate('/checkout');
                                }
                            }}
                            className="w-full bg-[#0c831f] text-white px-4 rounded-full flex items-center justify-between hover:bg-[#0a6b19] transition-all shadow-lg shadow-green-500/20 h-12 active:scale-[0.98]"
                        >
                            <div className="flex flex-col items-start leading-none">
                                <span className="font-bold text-[14px]">₹{finalTotal}</span>
                                <span className="text-[10px] opacity-80 uppercase font-black tracking-wide">Total Bill</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-[14px]">{user ? 'Proceed to Pay' : 'Login to Proceed'}</span>
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;
