import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Minus, Plus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import categoryPlaceholder from '../../assets/images/category-placeholder.png';

const CartPage = () => {
  const { cart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deliveryFee = 15;
  const handlingFee = 5;
  const finalTotal = cartTotal + deliveryFee + handlingFee;
  const handleProceed = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] pb-20 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6 text-center">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="bg-[var(--saathi-green)] text-white px-8 py-3.5 rounded-full font-black hover:bg-green-700 transition shadow-lg shadow-green-500/10 uppercase text-xs tracking-widest">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] pb-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8 md:max-w-6xl md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Cart <span className="text-gray-400 dark:text-gray-500 text-lg font-normal">({cart.length} items)</span></h1>

          <div className="bg-transparent md:bg-white dark:bg-transparent dark:md:bg-gray-800 rounded-none md:rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-100 dark:border-gray-700 overflow-visible md:overflow-hidden mb-6 md:mb-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image || categoryPlaceholder}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.src = categoryPlaceholder;
                        e.target.style.objectFit = 'cover';
                      }}
                    />
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
        </div>

        <div className="md:col-span-1">
          {/* Bill Details */}
          <div className="bg-transparent md:bg-white dark:bg-transparent dark:md:bg-gray-800 rounded-none md:rounded-2xl shadow-none md:shadow-sm border-none md:border border-gray-100 dark:border-gray-700 p-6 mb-24 md:mb-0">
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

      </div>

      {/* Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-[1001]">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleProceed}
            className="w-full bg-[var(--saathi-green)] text-white py-4 rounded-full font-black text-center hover:bg-green-700 transition active:scale-[0.98] shadow-lg shadow-green-500/20 flex items-center justify-between px-8"
          >
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-xs font-medium opacity-90">{finalTotal} items</span>
              <span className="text-lg font-bold">₹{finalTotal}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wide">Proceed</span>
              <ArrowRight size={20} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
