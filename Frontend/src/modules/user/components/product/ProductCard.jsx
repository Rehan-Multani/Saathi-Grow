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
    <div className="bg-white dark:bg-[#111111] rounded-2xl p-2 sm:p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-200/60 dark:border-white/10 hover:border-[#0c831f]/30 active:border-[#0c831f]/30 dark:hover:border-white/40 hover:shadow-lg hover:shadow-green-500/10 active:shadow-md active:shadow-green-500/10 hover:scale-[1.01] active:scale-[0.98] transition-all duration-500 flex flex-col gap-1.5 h-auto md:h-full group relative overflow-hidden mb-1">
      {/* Premium Shine Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent z-20 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] group-active:translate-x-[100%] transform" style={{ transitionDuration: '0.8s' }} />
      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-[#0a0a0a] z-10 transition-all duration-500 group-hover:bg-white dark:group-hover:bg-zinc-800/40">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image || categoryPlaceholder}
            alt={product.name}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${!product.image ? 'object-cover' : 'object-contain p-2'}`}
            onError={(e) => {
              e.target.src = categoryPlaceholder;
              e.target.classList.remove('p-2');
              e.target.classList.add('opacity-80');
              e.target.style.objectFit = 'cover';
            }}
            loading="lazy"
          />
        </Link>
      </div>

      <div className="flex flex-col flex-grow">
        {/* Title */}
        <Link to={`/product/${product.id}`} className="z-10">
          <div className="font-bold text-gray-800 dark:text-zinc-100 text-[13px] sm:text-[15px] leading-tight mb-0.5 line-clamp-2 min-h-[32px] group-hover:text-[#0c831f] transition-colors">
            {product.name}
          </div>
        </Link>

        {/* Weight */}
        <div className="text-gray-400 dark:text-zinc-500 text-[10px] mb-2 font-semibold uppercase tracking-tight">{product.weight}</div>

        {/* Bottom Row: Price & Action */}
        <div className="flex items-center justify-between mt-auto z-10">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 dark:text-zinc-600 line-through text-[11px] font-medium">₹{product.originalPrice}</span>
            )}
            <span className="text-[16px] sm:text-[18px] font-black text-gray-900 dark:text-white tracking-tight">₹{product.price}</span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center bg-[#0c831f] text-white !rounded-full shadow-lg h-[28px] sm:h-[36px] min-w-[70px] sm:min-w-[85px] border border-[#0c831f]">
              <button
                onClick={(e) => handleUpdateQuantity(e, -1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-l-full will-change-transform"
              >
                <Minus size={12} sm:size={14} strokeWidth={2.5} />
              </button>
              <span className="text-[11px] sm:text-[14px] font-black w-5 sm:w-7 text-center select-none leading-none">
                {quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, 1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-r-full will-change-transform"
              >
                <Plus size={12} sm:size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-4 py-1 bg-[#0c831f] text-white border border-transparent hover:bg-[#0a6b19] active:scale-95 transition-all text-[11px] font-black !rounded-full uppercase tracking-wider shadow-sm h-[28px] sm:h-[34px] flex items-center justify-center"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div >
  );
};

export default ProductCard;
