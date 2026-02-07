import React from 'react';
import { useCart } from '../../context/CartContext';
import categoryPlaceholder from '../../assets/images/category-placeholder.png';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleUpdateQuantity = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, delta);
  };

  return (
    <div className="bg-white dark:bg-[#111111] rounded-2xl p-1 sm:p-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-200/60 dark:border-white/10 hover:border-[#0c831f]/30 active:border-[#0c831f]/30 dark:hover:border-white/40 hover:shadow-lg hover:shadow-green-500/10 active:shadow-md active:shadow-green-500/10 hover:scale-[1.01] active:scale-[0.98] transition-all duration-500 flex flex-col gap-1 sm:gap-1.5 h-auto md:h-full group relative overflow-hidden mb-1 ring-1 ring-[#0c831f]/5 md:ring-0">

      {/* Premium Shine Effect Overlay (Mobile Specific Sweep) */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-[shine-sweep_3s_infinite]" />
      </div>

      {/* Pulsing Border Highlight - Mobile Only */}
      <div className="absolute inset-0 rounded-2xl border-[1.5px] border-[#0c831f]/20 md:border-transparent animate-pulse md:animate-none pointer-events-none z-30" />

      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-[#0a0a0a] z-10 transition-all duration-500 group-hover:bg-white dark:group-hover:bg-zinc-800/40">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image || categoryPlaceholder}
            alt={product.name}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${!product.image ? 'object-cover' : 'object-contain p-1.5'}`}
            onError={(e) => {
              e.target.src = categoryPlaceholder;
              e.target.classList.remove('p-1.5');
              e.target.classList.add('opacity-80');
              e.target.style.objectFit = 'cover';
            }}
            loading="lazy"
          />
        </Link>
      </div>

      <div className="flex flex-col flex-grow px-0.5">
        {/* Title */}
        <Link to={`/product/${product.id}`} className="z-10">
          <div className="font-extrabold text-gray-800 dark:text-zinc-100 text-[9px] sm:text-[15px] leading-tight mb-0.5 line-clamp-2 min-h-[24px] sm:min-h-[32px] group-hover:text-[#0c831f] transition-colors tracking-tight">
            {product.name}
          </div>
        </Link>

        {/* Weight */}
        <div className="text-gray-400 dark:text-zinc-500 text-[7.5px] sm:text-[10px] mb-1.5 font-bold uppercase tracking-widest">{product.weight}</div>

        {/* Bottom Row: Price & Action */}
        <div className="flex items-center justify-between mt-auto z-10">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 dark:text-zinc-600 line-through text-[9px] font-medium leading-none">₹{product.originalPrice}</span>
            )}
            <span className="text-[12px] sm:text-[18px] font-black text-gray-900 dark:text-white tracking-tighter leading-tight">₹{product.price}</span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center bg-[#0c831f] text-white !rounded-full shadow-lg h-[22px] sm:h-[36px] min-w-[50px] sm:min-w-[85px] border border-[#0c831f]">
              <button
                onClick={(e) => handleUpdateQuantity(e, -1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-l-full will-change-transform"
              >
                <Minus size={10} sm:size={14} strokeWidth={3} />
              </button>
              <span className="text-[10px] sm:text-[14px] font-black w-4 sm:w-7 text-center select-none leading-none">
                {quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, 1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-r-full will-change-transform"
              >
                <Plus size={10} sm:size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-3 sm:px-4 py-1 bg-[#0c831f] text-white border border-transparent hover:bg-[#0a6b19] active:scale-95 transition-all text-[8px] sm:text-[11px] font-black !rounded-full uppercase tracking-wider shadow-sm h-[22px] sm:h-[34px] flex items-center justify-center"
            >
              ADD
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes shine-sweep {
          0% { left: -100%; }
          30% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div >
  );
};

export default ProductCard;
