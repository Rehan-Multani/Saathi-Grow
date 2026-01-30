import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(product.id);
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden group relative flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative flex-shrink-0">
        <div className="aspect-[1/1] w-full relative bg-white flex items-center justify-center p-2 md:p-4 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-1.5 md:p-3 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-[9px] md:text-[10px] text-gray-500 font-medium mb-0.5 md:mb-1 uppercase tracking-wider bg-gray-50 inline-block px-1 rounded">{product.weight}</div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-[10px] md:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1 md:mb-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto gap-1 md:gap-0">
          <div className="flex flex-row md:flex-col items-baseline md:items-start gap-1 md:gap-0">
            <span className="text-[9px] md:text-xs text-gray-400 line-through leading-none">₹{product.originalPrice}</span>
            <span className="text-xs md:text-sm font-bold text-gray-900">₹{product.price}</span>
          </div>

          <div className="w-full md:w-[88px]">
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full h-6 md:h-8 flex items-center justify-center bg-[#0c831f] text-white border border-transparent rounded md:rounded-lg text-[9px] md:text-xs font-bold uppercase hover:bg-[#0a6d1a] transition-colors cursor-pointer shadow-sm"
              >
                ADD
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#0c831f] text-white rounded md:rounded-lg p-0.5 md:p-1 shadow-md w-full h-6 md:h-8">
                <button
                  onClick={handleRemove}
                  className="w-5 md:w-6 h-full flex items-center justify-center hover:bg-[#0a6d1a] rounded transition-colors"
                >
                  <Minus size={10} className="md:w-3.5 md:h-3.5" />
                </button>
                <span className="text-[10px] md:text-xs font-bold">{quantity}</span>
                <button
                  onClick={handleAddToCart}
                  className="w-5 md:w-6 h-full flex items-center justify-center hover:bg-[#0a6d1a] rounded transition-colors"
                >
                  <Plus size={10} className="md:w-3.5 md:h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
