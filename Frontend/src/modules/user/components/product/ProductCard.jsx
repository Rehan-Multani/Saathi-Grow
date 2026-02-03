import React from 'react';
import { useCart } from '../../context/CartContext';
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
    <div className="bg-white dark:!bg-black rounded-[14px] p-2.5 shadow-sm border border-gray-100 dark:border-white/10 hover:border-[#0c831f] dark:hover:border-[#0c831f] hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col gap-2 h-full group">
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="block relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:!bg-black">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </Link>

      <div className="flex flex-col flex-grow">
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <div className="font-bold text-gray-900 dark:text-gray-300 text-[12px] sm:text-[14px] leading-tight mb-1 line-clamp-2 h-[34px]">
            {product.name}
          </div>
        </Link>

        {/* Weight */}
        <div className="text-gray-500 dark:text-gray-400 text-[10px] mb-2">{product.weight}</div>

        {/* Bottom Row: Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 line-through text-[11px]">₹{product.originalPrice}</span>
            )}
            <span className="text-sm sm:text-[15px] font-black text-gray-900 dark:text-white">₹{product.price}</span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center bg-[#0c831f] dark:bg-[#7e978e] text-white rounded-md overflow-hidden transition-all duration-300 shadow-sm border border-transparent">
              <button
                onClick={(e) => handleUpdateQuantity(e, -1)}
                className="px-2 py-1 hover:bg-[#0a6b19] dark:hover:bg-[#6b827a] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="px-1 text-[11px] font-bold min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, 1)}
                className="px-2 py-1 hover:bg-[#0a6b19] dark:hover:bg-[#6b827a] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="product_button px-3 py-1 bg-white dark:!bg-[#7e978e] dark:!text-white text-[#0c831f] border-[1px] border-[#0c831f] hover:!bg-[#0a6b19] active:!bg-[#0a6b19] hover:!text-white active:!text-white hover:!border-[#0a6b19] active:!border-[#0a6b19] dark:hover:!bg-black dark:active:!bg-black dark:hover:!text-[#7e978e] dark:active:!text-[#7e978e] dark:hover:!border-[#7e978e] dark:active:!border-[#7e978e] text-[10px] font-bold !rounded-md transition-colors uppercase tracking-wide"
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
