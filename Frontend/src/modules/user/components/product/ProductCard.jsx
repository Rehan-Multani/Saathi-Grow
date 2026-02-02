import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-[20px] p-3 shadow-sm border border-transparent hover:border-[#0c831f] hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col gap-3 h-full">
      <Link to={`/product/${product.id}`} className="block relative w-full aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />
      </Link>

      <div className="flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <div className="font-bold text-gray-900 text-[13px] leading-tight mb-1 line-clamp-2">
            {product.name}
          </div>
        </Link>

        <div className="text-gray-500 text-[11px] mb-3">{product.weight}</div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-bold text-gray-900">₹{product.price}</span>

          <button
            onClick={handleAddToCart}
            className="product_button px-4 py-1 bg-white text-[#0c831f] border-[1.5px] border-[#0c831f] hover:!bg-[#0a6b19] active:!bg-[#0a6b19] hover:!text-white active:!text-white hover:!border-[#0a6b19] active:!border-[#0a6b19] text-[11px] font-bold !rounded-lg transition-colors uppercase tracking-wide"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
