import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ShoppingCart, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart, removeFromCart, cart } = useCart();

    const product = products.find(p => p.id === parseInt(id));

    if (!product) return <div className="p-8 text-center text-gray-500">Product not found</div>;

    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                        <Link to="/" className="hover:text-[var(--saathi-green)]">Home</Link>
                        <ChevronRight size={14} />
                        <Link to={`/category/${product.category}`} className="hover:text-[var(--saathi-green)] capitalize">{product.category.replace(/-/g, ' ')}</Link>
                        <ChevronRight size={14} />
                        <span className="font-semibold text-gray-800 line-clamp-1">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

                        {/* Image */}
                        <div className="p-8 bg-white flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                            <div className="relative aspect-square w-full max-w-sm">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 md:p-10 flex flex-col justify-center">
                            <div className="mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">{product.weight}</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <p className="text-sm text-gray-500 mb-6">Imported and fresh. Quality checked.</p>

                            {/* Product Description */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Description</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </span>
                            </div>

                            <div className="flex gap-4 mb-8">
                                {quantity === 0 ? (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="flex-1 bg-[var(--saathi-green)] text-white font-bold py-4 px-8 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                                    >
                                        <ShoppingCart size={20} />
                                        Add to Cart
                                    </button>
                                ) : (
                                    <div className="flex-1 flex items-center gap-4 bg-[var(--saathi-green)] text-white rounded-xl p-2 w-fit max-w-[200px] shadow-lg shadow-green-200">
                                        <button onClick={() => removeFromCart(product.id)} className="p-3 hover:bg-green-800 rounded-lg transition"><Minus /></button>
                                        <span className="flex-1 text-center font-bold text-xl">{quantity}</span>
                                        <button onClick={() => addToCart(product)} className="p-3 hover:bg-green-800 rounded-lg transition"><Plus /></button>
                                    </div>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-[var(--saathi-green)]/10 flex items-center justify-center text-[var(--saathi-green)]">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">10 Mins Delivery</p>
                                        <p className="text-xs text-gray-500">Super fast delivery</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-[var(--saathi-green)]/10 flex items-center justify-center text-[var(--saathi-green)]">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Best Quality</p>
                                        <p className="text-xs text-gray-500">Direct from farm</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
