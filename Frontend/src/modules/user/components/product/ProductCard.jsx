import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleUpdateQuantity = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, delta);
  };

  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl p-2 sm:p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0,04)] dark:shadow-none border border-gray-100 dark:border-white/5 hover:border-[#0c831f] dark:hover:border-[#0c831f]/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col gap-1.5 h-auto md:h-full group">
      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-[#0a0a0a]">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/70 dark:bg-black/30 backdrop-blur-md shadow-sm active:scale-90 transition-all z-10"
        >
          <Heart
            size={14}
            className={`${isWishlisted ? 'text-red-500 fill-red-500 animate-in zoom-in duration-300' : 'text-gray-400 dark:text-gray-500'}`}
            strokeWidth={isWishlisted ? 0 : 3}
          />
        </button>
      </div>

      <div className="flex flex-col flex-grow">
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <div className="font-bold text-gray-900 dark:text-gray-100 text-[10.5px] sm:text-[14px] leading-tight mb-1 line-clamp-2 h-[30px]">
            {product.name}
          </div>
        </Link>

        {/* Weight */}
        <div className="text-gray-500 dark:text-gray-400 text-[9px] mb-2 font-medium">{product.weight}</div>

        {/* Bottom Row: Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 dark:text-gray-500 line-through text-[11px]">₹{product.originalPrice}</span>
            )}
            <span className="text-xs sm:text-[15px] font-black text-gray-900 dark:text-[#f8fafc]">₹{product.price}</span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center bg-[#0c831f] dark:bg-[#0c831f] text-white rounded-lg shadow-sm h-[32px] min-w-[75px] overflow-hidden transition-all duration-300">
              <button
                onClick={(e) => handleUpdateQuantity(e, -1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-[#0a6b19] dark:hover:bg-[#0c831f]/80 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="text-[13px] font-bold w-6 text-center select-none">
                {quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, 1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-[#0a6b19] dark:hover:bg-[#0c831f]/80 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-4 py-1.5 bg-[#0c831f] dark:bg-black text-white dark:!text-[#0c831f] border border-[#0c831f]/20 hover:border-[#0c831f] active:scale-95 transition-all text-[11px] font-black rounded-lg uppercase tracking-wider shadow-sm"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
