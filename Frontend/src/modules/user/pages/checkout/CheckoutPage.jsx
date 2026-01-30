import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const { cartTotal, clearCart } = useCart();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const navigate = useNavigate();

    const deliveryFee = 15;
    const handlingFee = 5;
    const finalTotal = cartTotal + deliveryFee + handlingFee;

    const handlePlaceOrder = () => {
        setOrderPlaced(true);
        setTimeout(() => {
            clearCart();
            navigate('/');
        }, 3000);
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-500">Redirecting you to home...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link to="/cart" className="text-gray-600 hover:text-gray-900"><ArrowLeft /></Link>
                    <h1 className="font-bold text-lg text-gray-800">Checkout</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* Address (Dummy) */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <MapPin size={18} className="text-[var(--saathi-green)]" />
                            Delivery Address
                        </h3>
                        <button className="text-[var(--saathi-green)] text-sm font-bold uppercase">Change</button>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-900 block mb-1">Home</span>
                        123, Green Street, Block B,<br />
                        Near Central Park, New Delhi - 110001
                    </div>
                </div>

                {/* Payment Method (Dummy) */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Payment Method</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border border-[var(--saathi-green)] bg-green-50 rounded-lg">
                            <div className="w-4 h-4 rounded-full border-[5px] border-[var(--saathi-green)] bg-white"></div>
                            <span className="font-medium text-gray-800">Cash on Delivery</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg opacity-60">
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                            <span className="font-medium text-gray-800">UPI (Google Pay / PhonePe)</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Summary</h3>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Grand Total</span>
                        <span>₹{finalTotal}</span>
                    </div>
                </div>

            </div>

            {/* Place Order Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-[var(--saathi-green)] text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
                    >
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
