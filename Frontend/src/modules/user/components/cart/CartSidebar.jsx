import React from 'react';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const CartSidebar = () => {
    const { isCartOpen, setIsCartOpen, cart, updateQuantity, cartTotal, cartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Calculate total bill
    const deliveryFee = 15;
    const handlingFee = 5;
    const finalTotal = cartTotal + deliveryFee + handlingFee;

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Sidebar Content */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">My Basket ({cartCount} Items)</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                                🛒
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Your basket is empty</h3>
                                <p className="text-sm text-gray-500">Add products to start shopping</p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-6 py-2 bg-[var(--saathi-green)] text-white rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <>
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-3 md:gap-4 p-2 md:p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">{item.name}</h4>
                                            <span className="text-xs text-gray-500">{item.weight}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-[var(--saathi-green)]">₹{item.price * item.quantity}</span>

                                            <div className="flex items-center gap-3 bg-[#0c831f] rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-1 hover:bg-[#0a6d1a] text-white rounded transition"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-1 hover:bg-[#0a6d1a] text-white rounded transition"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Bill Details */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mt-4">
                                <h3 className="font-bold text-gray-800 mb-2">Bill Summary</h3>
                                <div className="flex justify-between text-gray-600">
                                    <span>Item Total</span>
                                    <span className="text-black font-bold">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className="text-black font-bold">₹{deliveryFee}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Handling Fee</span>
                                    <span className="text-black font-bold">₹{handlingFee}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                                    <span>To Pay</span>
                                    <span className="text-black font-bold text-lg">₹{finalTotal}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer / Checkout Button */}
                {cart.length > 0 && (
                    <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    navigate('/checkout');
                                }
                            }}
                            className="w-full flex items-center justify-between bg-[var(--saathi-green)] text-[var(--saathi-yellow)] p-4 rounded-3xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 group"
                        >
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xs opacity-90 font-normal text-white">Total</span>
                                <span className="text-lg text-[var(--saathi-yellow)]">₹{finalTotal}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CartSidebar;
