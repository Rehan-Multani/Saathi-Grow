import React from 'react';
import { useCart } from '../../context/CartContext';
import categoryPlaceholder from '../../assets/images/category-placeholder.png';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ProductCard = ({ product, isCompact = false, customTheme, imgPadding }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

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
    <div
      className="bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-none md:bg-white md:dark:bg-[#111111] rounded-2xl p-3 sm:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-200/60 dark:border-white/10 hover:shadow-lg active:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-500 flex flex-col gap-2 sm:gap-3 h-auto md:h-full group relative overflow-hidden mb-1 md:ring-0"
      style={{
        borderColor: customTheme ? `${customTheme.themeColor}30` : undefined,
        '--theme-color': customTheme ? customTheme.themeColor : '#0c831f'
      }}
    >

      {/* Premium Shine Effect Overlay (Mobile Specific Sweep) */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden dark:hidden">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-[shine-sweep_3s_infinite]" />
      </div>

      {/* Pulsing Border Highlight - Mobile Only */}
      <div
        className="absolute inset-0 rounded-2xl border-[1.5px] md:border-transparent animate-pulse md:animate-none pointer-events-none z-30"
        style={{ borderColor: customTheme ? `${customTheme.themeColor}20` : '#0c831f20' }}
      />
      {savings > 0 && (
        <div className="absolute top-0 left-0 bg-[#0c831f] text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-br-lg z-30 shadow-sm flex items-center gap-0.5">
          <span>Save ₹{savings}</span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-[#0a0a0a] z-10 transition-all duration-500 group-hover:bg-white dark:group-hover:bg-zinc-800/40">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image || categoryPlaceholder}
            alt={product.name}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${!product.image ? 'object-cover' : `object-contain ${imgPadding || 'p-1.5'}`}`}
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

      <div className="flex flex-col flex-grow px-1.5 sm:px-2">
        {/* Title */}
        <Link to={`/product/${product.id}`} className="z-10">
          <div
            className="font-extrabold text-gray-800 dark:text-zinc-100 text-[9px] sm:text-[15px] leading-tight mb-0.5 line-clamp-2 min-h-[24px] sm:min-h-[32px] transition-colors tracking-tight"
            style={{ color: 'inherit' }}
            onMouseEnter={(e) => e.target.style.color = customTheme ? customTheme.themeColor : '#0c831f'}
            onMouseLeave={(e) => e.target.style.color = ''}
          >
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
            <div
              className={`flex items-center text-white !rounded-full shadow-lg ${isCompact ? 'h-[21px] sm:h-[30px] min-w-[50px] sm:min-w-[70px]' : 'h-[25px] sm:h-[36px] min-w-[60px] sm:min-w-[85px]'} border quantity-selector`}
              style={{
                backgroundColor: isDarkMode ? '#0c831f' : (customTheme ? customTheme.themeColor : '#0c831f'),
                borderColor: isDarkMode ? '#0c831f' : (customTheme ? customTheme.themeColor : '#0c831f')
              }}
            >
              <button
                onClick={(e) => handleUpdateQuantity(e, -1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-l-full will-change-transform"
              >
                <Minus className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} sm:w-4 sm:h-4`} strokeWidth={3} />
              </button>
              <span className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} sm:text-[14px] font-black w-4 sm:w-7 text-center select-none leading-none`}>
                {quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, 1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:bg-black/20 rounded-r-full will-change-transform"
              >
                <Plus className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} sm:w-4 sm:h-4`} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`${isCompact ? 'px-2 sm:px-3 h-[18px] sm:h-[30px] text-[7px]' : 'px-3 sm:px-4 h-[22px] sm:h-[34px] text-[8px]'} py-1 text-white border border-transparent active:scale-95 transition-all sm:text-[11px] font-black !rounded-full uppercase tracking-wider shadow-sm flex items-center justify-center`}
              style={{ backgroundColor: isDarkMode ? '#0c831f' : (customTheme ? customTheme.themeColor : '#0c831f') }}
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
