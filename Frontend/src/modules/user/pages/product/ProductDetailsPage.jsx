import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, ShoppingCart, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart, removeFromCart, updateQuantity, cart } = useCart();

    const product = products.find(p => p.id === parseInt(id));

    if (!product) return <div className="p-8 text-center text-gray-500">Product not found</div>;

    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="min-h-screen bg-[#efefef] pb-20">
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
                <div className="bg-white rounded-none border-0 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 overflow-hidden min-h-[600px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 h-full">

                        {/* Left: Image Section */}
                        <div className="p-4 md:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-100">
                            <div className="flex-grow flex items-center justify-center w-full relative">
                                <img src={product.image} alt={product.name} className="max-h-[400px] object-contain transition-transform hover:scale-105 duration-300" />
                            </div>

                            {/* Thumbnails (Mock) */}
                            <div className="flex gap-4 mt-8 overflow-x-auto pb-2 w-full justify-center">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-16 h-16 border rounded-lg p-1 cursor-pointer hover:border-[var(--saathi-green)] ${i === 1 ? 'border-[var(--saathi-green)]' : 'border-gray-200'}`}>
                                        <img src={product.image} alt="thumbnail" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Details Section */}
                        <div className="p-6 md:p-10 flex flex-col text-left">
                            {/* Breadcrumbs */}
                            <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                <Link to="/" className="hover:text-gray-800">Home</Link> /
                                <Link to={`/category/${product.category}`} className="hover:text-gray-800 capitalize"> {product.category.replace(/-/g, ' ')}</Link> /
                                <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                            {/* Weight / Timer if needed */}
                            <div className="mb-4">
                                <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded">{product.weight}</span>
                            </div>

                            {/* Price Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400">(Inclusive of all taxes)</p>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="mb-12">
                                {quantity === 0 ? (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="product_button bg-white text-[#0c831f] border-[1.5px] border-[#0c831f] hover:!bg-[#0a6b19] hover:!text-white hover:!border-[#0a6b19] font-bold py-2.5 px-8 transition shadow-sm text-sm uppercase tracking-wide"
                                    >
                                        Add to cart
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 bg-[#0c831f] text-white rounded-xl px-3 py-1.5 w-fit shadow-sm">
                                        <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-[#0b721b] rounded-lg transition"><Minus size={16} /></button>
                                        <span className="text-sm font-bold min-w-[20px] text-center">{quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-[#0b721b] rounded-lg transition"><Plus size={16} /></button>
                                    </div>
                                )}
                            </div>

                            {/* Why Shop section */}
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm mb-4">Why shop from SaathiGro?</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-yellow-50 flex items-center justify-center">
                                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-fast-delivery-icon-download-in-svg-png-gif-file-formats--truck-vehicle-logistics-services-pack-business-icons-1536254.png" alt="delivery" className="w-6 h-6 object-contain opacity-80" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">10 Minute Delivery</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Get items delivered to your doorstep from dark stores near you, whenever you need them.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-yellow-50 flex items-center justify-center">
                                            <img src="https://cdn-icons-png.flaticon.com/512/2529/2529396.png" alt="offer" className="w-6 h-6 object-contain opacity-80" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Best Prices & Offers</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Best price destination with offers directly from the manufacturers.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-yellow-50 flex items-center justify-center">
                                            <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" alt="assortment" className="w-6 h-6 object-contain opacity-80" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Wide Assortment</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Choose from 5000+ products across food, personal care, household & other categories.</p>
                                        </div>
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
