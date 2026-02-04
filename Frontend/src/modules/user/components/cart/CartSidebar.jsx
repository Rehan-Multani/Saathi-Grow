import React from 'react';
import { X, Minus, Plus, ChevronRight, Clock, ShoppingBag, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
    const { isCartOpen, setIsCartOpen, cart, updateQuantity, cartTotal, cartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Calculate total bill
    const deliveryFee = 0;
    const handlingFee = 2;
    const itemTotalOriginal = cart.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.quantity, 0);
    const itemTotalDiscounted = cartTotal;
    const savings = itemTotalOriginal - itemTotalDiscounted;
    const finalTotal = itemTotalDiscounted + deliveryFee + handlingFee;

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
            {/* Overlay - Hidden on Mobile for "Full Page" feel */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity hidden sm:block"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Main Container */}
            <div className="relative w-full sm:max-w-[360px] bg-[#f2f4f7] dark:bg-black h-full shadow-2xl flex flex-col transform transition-all animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 sm:rounded-l-[24px] overflow-hidden">

                {/* Header */}
                <div className="px-3.5 py-3.5 bg-white dark:bg-[#141414] flex items-center justify-between sticky top-0 z-10 border-b border-gray-50 dark:border-white/5">
                    <h2 className="text-[15px] font-black text-[#1f2937] dark:text-gray-100 tracking-tight">My Basket</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Savings Banner */}
                {savings > 0 && (
                    <div className="px-3.5 py-1.5 bg-[#eef6ff] dark:bg-blue-500/10 flex items-center justify-between border-b border-blue-100/20">
                        <span className="text-[#2563eb] dark:text-blue-400 font-bold text-[8px] uppercase tracking-wider">Your total savings</span>
                        <span className="text-[#2563eb] dark:text-blue-400 font-black text-[11px]">₹{savings}</span>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <ShoppingBag size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 dark:text-gray-100 mb-1">Your basket is empty</h3>
                            <p className="text-[11px] text-gray-500 font-medium mb-5">Add items to start shopping</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-6 py-2.5 bg-[#0c831f] text-white rounded-lg font-black text-[10px] hover:translate-y-[-2px] transition-all shadow-lg shadow-green-500/20"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Delivery Info Card */}
                            <div className="bg-white dark:bg-[#141414] rounded-lg p-2.5 shadow-sm border border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-2 text-left">
                                    <div className="w-8 h-8 bg-[#eefaf1] rounded-lg flex items-center justify-center">
                                        <Clock size={14} className="text-[#0c831f]" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-[#1f2937] dark:text-gray-100 text-[11px] leading-tight">Delivery in 8 minutes</h3>
                                        <p className="text-[7.5px] text-gray-400 font-black mt-0.5 uppercase tracking-tighter">Shipment of {cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items List Card */}
                            <div className="bg-white dark:bg-[#141414] rounded-[16px] p-2.5 shadow-sm border border-gray-50 dark:border-white/5 space-y-3.5">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-2.5 items-center">
                                        <div className="w-10 h-10 border border-gray-50 dark:border-white/5 rounded-lg bg-gray-50 dark:bg-white/5 p-1 flex-shrink-0 flex items-center justify-center">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="text-[11px] font-bold text-gray-800 dark:text-gray-100 leading-tight mb-0.5 line-clamp-2 tracking-tight">{item.name}</div>
                                            <p className="text-[8.5px] text-gray-400 font-bold mb-1 uppercase tracking-tighter opacity-70">{item.weight}</p>
                                            <p className="font-extrabold text-gray-900 dark:text-gray-100 text-[12.5px]">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center bg-[#0c831f] text-white rounded-lg h-6.5 w-[64px] shadow-sm overflow-hidden flex-shrink-0">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="flex-1 h-full flex items-center justify-center hover:bg-black/10"><Minus size={9} strokeWidth={3} /></button>
                                            <span className="text-[10px] font-black w-4 text-center select-none">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="flex-1 h-full flex items-center justify-center hover:bg-black/10"><Plus size={9} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bill Details Card */}
                            <div className="bg-white dark:bg-[#141414] rounded-lg p-3 shadow-sm border border-gray-50 dark:border-white/5">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3 text-left">Bill details</h3>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-[10.5px] font-bold uppercase tracking-tight text-gray-400">
                                        <span>Items total</span>
                                        <div className="flex items-center gap-1.5">
                                            {savings > 0 && <span className="line-through text-gray-300 opacity-50">₹{itemTotalOriginal}</span>}
                                            <span className="text-gray-900 dark:text-gray-100">₹{itemTotalDiscounted}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10.5px] font-bold uppercase tracking-tight text-gray-400">
                                        <span className="flex items-center gap-1">Delivery charge <Info size={9} /></span>
                                        <span className="text-[#0c831f]">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10.5px] font-bold uppercase tracking-tight text-gray-400">
                                        <span className="flex items-center gap-1">Handling charge <Info size={9} /></span>
                                        <span className="text-gray-900 dark:text-gray-100">₹{handlingFee}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                                        <span className="font-black text-gray-900 dark:text-gray-100 text-[13px]">Grand total</span>
                                        <span className="font-black text-gray-900 dark:text-gray-100 text-[16px]">₹{finalTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer CTA */}
                {cart.length > 0 && (
                    <div className="p-2.5 bg-white dark:bg-[#141414] border-t border-gray-50 dark:border-white/5">
                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                if (!user) navigate('/login');
                                else navigate('/checkout');
                            }}
                            className="w-full bg-[#0c831f] text-white px-3.5 rounded-xl flex items-center justify-between hover:bg-[#0a6b19] transition-all h-12 shadow-lg shadow-green-500/10 active:scale-[0.98] group"
                        >
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <span className="font-black text-[15px]">₹{finalTotal}</span>
                                <span className="text-[7.5px] font-black uppercase tracking-[0.15em] opacity-80">Total Bill</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-black text-[12px]">{user ? 'Proceed' : 'Login'}</span>
                                <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;
