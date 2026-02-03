import React from 'react';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cart, updateQuantity, cartTotal } = useCart();
  const deliveryFee = 15;
  const handlingFee = 5;
  const finalTotal = cartTotal + deliveryFee + handlingFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">tYour Cart is Empty</h2>
        <p className="text-gray-500 mb-6 text-center">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="bg-[var(--saathi-green)] text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Cart <span className="text-gray-400 dark:text-gray-500 text-lg font-normal">({cart.length} items)</span></h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {cart.map((item) => (
              <div key={item.id} className="p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{item.name}</h3>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.weight}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-[var(--saathi-green)]/10 text-[var(--saathi-green)] rounded-lg p-1 w-fit">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-[var(--saathi-green)] hover:text-white rounded transition"><Minus size={14} /></button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-[var(--saathi-green)] hover:text-white rounded transition"><Plus size={14} /></button>
                    </div>
                    {/* Optional delete button if needed, but quantity 0 handles it */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-24">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Bill Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Item Total</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Handling Fee</span>
              <span>₹{handlingFee}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
              <span>To Pay</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 shadow-lg z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Total</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">₹{finalTotal}</span>
          </div>
          <Link to="/checkout" className="flex-1 bg-[var(--saathi-green)] text-white py-3 rounded-xl font-bold text-center hover:bg-green-700 transition flex items-center justify-center gap-2">
            Proceed to Pay
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
