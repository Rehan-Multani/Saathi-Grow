import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Package, RotateCcw, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fetchOrderDetails, createCODOrder } from '../../api/orderApi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ReorderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const { addToCart, clearCart } = useCart();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (token && id) {
                try {
                    setIsLoading(true);
                    const data = await fetchOrderDetails(token, id);
                    setOrder(data);
                    
                    // Initialize items with their original quantities, checking stock availability
                    const initialItems = data.items.map(item => {
                        const product = item.product;
                        let availableStock = 0;
                        let threshold = product?.lowStockThreshold || 10;
                        
                        const branchId = data.branchId?._id || data.branchId;
                        const vendorId = data.vendorId?._id || data.vendorId || data.vendor?._id || data.vendor;

                        if (branchId) {
                            const branchStock = product?.branchStocks?.find(bs => (bs.branchId?._id || bs.branchId)?.toString() === branchId.toString());
                            availableStock = branchStock ? branchStock.stock : 0;
                            threshold = branchStock ? (branchStock.lowStockThreshold || 10) : threshold;
                        } else {
                            availableStock = product?.stock || 0;
                        }

                        const isOutOfStock = availableStock <= 0;

                        return {
                            productId: product?._id || item.product,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            quantity: isOutOfStock ? 0 : (item.quantity || 1),
                            isOutOfStock,
                            originalPrice: item.price
                        };
                    });
                    setItems(initialItems);
                } catch (err) {
                    toast.error("Failed to load order details for reordering.");
                    navigate(-1);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadOrder();
    }, [token, id, navigate]);

    const updateQuantity = (index, delta) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }));
    };

    const handleReorder = async () => {
        const itemsToOrder = items.filter(item => item.quantity > 0);
        if (itemsToOrder.length === 0) {
            toast.warning("Please select at least one item to reorder.");
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            await clearCart();
            
            itemsToOrder.forEach(item => {
                const productToCart = {
                    id: item.productId,
                    _id: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    isDeliverable: true,
                    availableStock: 999,
                    maxAllowed: 999
                };
                addToCart(productToCart, item.quantity);
            });

            toast.success("Items added to cart for checkout!");
            navigate('/checkout');
        } catch (error) {
            console.error("Reorder routing failed:", error);
            toast.error(error.message || "Failed to process reorder");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !order) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0c831f]"></div>
            </div>
        );
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300 pb-40 md:pb-32">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-400 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Reorder Items</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">From order #{order?.orderId || order?._id}</p>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Review items to repeat</p>
                
                <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    {items.map((item, index) => (
                        <div key={index} className={`flex items-center gap-4 p-4 ${index !== items.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 p-2 border border-gray-100 dark:border-white/5 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 leading-tight truncate">{item.name}</h3>
                                <p className="text-xs font-bold text-[#0c831f] mt-1">₹{item.price}</p>
                                {item.isOutOfStock && (
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-wider rounded-md border border-rose-100 dark:border-rose-500/20">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 p-1">
                                <button 
                                    onClick={() => updateQuantity(index, -1)}
                                    className="w-8 h-8 rounded-lg bg-white dark:bg-black/50 text-gray-600 dark:text-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all outline-none border border-gray-200/50 dark:border-white/5"
                                >
                                    <Minus size={14} strokeWidth={3} />
                                </button>
                                <span className="font-black text-sm text-gray-800 dark:text-white w-8 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(index, 1)}
                                    disabled={item.isOutOfStock}
                                    className={`w-8 h-8 rounded-lg bg-white dark:bg-black/50 text-[#0c831f] shadow-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all outline-none border border-gray-200/50 dark:border-white/5 ${item.isOutOfStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-500">Summary</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{totalItems} Items selected</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-100 dark:border-white/10">
                        <span className="text-base font-black text-gray-900 dark:text-white uppercase">Approx. Total</span>
                        <span className="text-2xl font-black text-[#0c831f]">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </main>

            {/* Bottom Bar - Improved Mobile Visibility */}
            <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 z-[150]">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={handleReorder}
                        disabled={isLoading || totalItems === 0}
                        className="w-full bg-[#0c831f] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-[#0a6b19] disabled:opacity-50"
                    >
                        {isLoading ? (
                             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <RotateCcw size={18} strokeWidth={3} />
                                Reorder
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReorderPage;
