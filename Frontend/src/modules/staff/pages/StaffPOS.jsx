import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Mail,
  Phone,
  Banknote,
  CheckCircle,
  Zap,
  Printer,
  Package,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCcw,
  Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useStaffAuth } from '../context/StaffAuthContext';
import { createPOSOrder, searchProductsPOS } from '../../../common/api/posApi';
import { getPublicSettings } from '../../../common/api/settingApi';

const POSProductImage = ({ src, name, className }) => {
    const [failed, setFailed] = useState(!src);

    if (failed) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-violet-50 text-violet-600 rounded-xl p-3 border border-violet-100/30 ${className}`}>
                <Package size={24} className="stroke-[1.5] text-violet-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider mt-1 truncate max-w-full text-violet-600">
                    {name?.charAt(0) || 'P'}
                </span>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={name} 
            className={`object-contain ${className}`}
            onError={() => setFailed(true)}
        />
    );
};

const StaffPOS = () => {
    const { staffUser } = useStaffAuth();
    const storeId = staffUser?.branchId;
    const storeType = 'branch';

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => { fetchSettings(); }, []);
    useEffect(() => { if (storeId) { fetchProducts(); } }, [storeId]);

    const fetchSettings = async () => {
        try {
            const data = await getPublicSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const fetchProducts = async (query = '') => {
        if (!storeId) return;
        setLoading(true);
        try {
            const data = await searchProductsPOS(query, { storeId, storeType, hardFilter: 'true' }, staffUser?.token);
            const normalized = (data.products || []).map(p => ({
                ...p,
                price: p.basePrice || 0,
                stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0)
            }));
            setProducts(normalized);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return toast.error('Out of stock');
        const existing = cart.find(item => item.product === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) return toast.warning('Stock limit reached');
            setCart(cart.map(item => item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, {
                product: product._id,
                name: product.name,
                price: product.price || 0,
                image: product.image,
                quantity: 1,
                stock: product.stock
            }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.product === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                if (newQty > item.stock) {
                    toast.warning('Cannot exceed available stock!');
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = settings?.defaultTaxRate || 0;
    const taxAmount = (subTotal * taxRate) / 100;
    const totalAmount = subTotal + taxAmount;

    const handleCompleteOrder = async () => {
        if (cart.length === 0) return toast.warning('Empty cart');
        if (customerDetails.phone && customerDetails.phone.length !== 10) {
            return toast.warning('Customer phone number must be exactly 10 digits');
        }

        const result = await Swal.fire({
            title: 'Confirm Bill?',
            text: `Confirming payment for ₹${totalAmount.toFixed(2)}`,
            showCancelButton: true,
            confirmButtonText: 'Collect Payment',
            cancelButtonText: 'Back',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#94a3b8',
            customClass: { popup: 'rounded-[1.5rem]' }
        });

        if (result.isConfirmed) {
            setIsProcessing(true);
            try {
                await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, staffUser?.token);
                await Swal.fire({ 
                    title: 'Payment Received', 
                    text: 'Billing completed successfully.', 
                    icon: 'success',
                    confirmButtonColor: '#6366f1',
                    customClass: { popup: 'rounded-[1.5rem]' }
                });
                setCart([]);
                setCustomerDetails({ name: '', email: '', phone: '' });
                fetchProducts();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to finish order');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Zap className="text-violet-600 fill-violet-600" size={24} />
                        POS Billing <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded ml-2">v2.0</span>
                    </h1>
                </div>

                <div className="flex-1 max-w-xl mx-8 relative hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Scan or find item..."
                        className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            fetchProducts(e.target.value);
                        }}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{staffUser?.branchName || 'Local Unit'}</div>
                        <div className="text-sm font-black text-gray-700">POS-01</div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Product Grid */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {loading && products.length === 0 ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-48"></div>
                            ))
                        ) : (
                            products.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-transparent hover:border-violet-200 group relative ${product.stock <= 0 ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                                >
                                    <div className="w-full h-32 flex items-center justify-center mb-4 rounded-xl overflow-hidden bg-gray-50/50 relative">
                                        <POSProductImage src={product.image} name={product.name} className="w-full h-full" />
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded shadow uppercase tracking-widest animate-pulse italic">Critical Stock</div>
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-2 text-left min-h-[40px]">
                                        {product.name}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-violet-600">₹{product.price}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${product.stock > 10 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-violet-600 text-white p-1.5 rounded-full">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Billing Panel */}
                <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10 shrink-0">
                    <div className="p-6 flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 text-left">
                            <ShoppingCart className="text-violet-600" size={20} />
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Billing Cart</h2>
                            <span className="ml-auto bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                                Count: {cart.length}
                            </span>
                        </div>

                        {/* Cart List */}
                        <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                                    <ShoppingCart size={48} />
                                    <p className="font-bold text-sm uppercase tracking-widest">Empty Cart</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product} className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-left">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                                            <POSProductImage src={item.image} name={item.name} className="w-full h-full" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-sm font-bold text-gray-800 truncate leading-none mb-1">{item.name}</div>
                                            <div className="text-xs text-gray-500 font-bold mb-2">₹{item.price}</div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateQuantity(item.product, -1)} className="p-1.5 hover:bg-gray-200 rounded-lg bg-gray-200 text-gray-700 transition-colors">
                                                    <Minus size={12} strokeWidth={3} />
                                                </button>
                                                <span className="text-sm font-black text-violet-600 w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product, 1)} className="p-1.5 hover:bg-gray-200 rounded-lg bg-gray-200 text-gray-700 transition-colors">
                                                    <Plus size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-gray-800">₹{item.price * item.quantity}</div>
                                            <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="text-red-400 hover:text-red-600 mt-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Customer Form */}
                        <div className="bg-violet-50/30 p-3 rounded-2xl mb-4 border border-violet-100/60 shadow-sm shadow-violet-50/40 text-left">
                            <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-90">
                                <User size={12} className="fill-violet-100" /> Customer Details
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={13} />
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full bg-white border border-violet-100/80 hover:border-violet-200 focus:border-violet-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-violet-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
                                        value={customerDetails.name}
                                        onChange={(e) => {
                                            const cleanValue = e.target.value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, '');
                                            setCustomerDetails({ ...customerDetails, name: cleanValue });
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={13} />
                                    <input
                                        type="tel"
                                        placeholder="Mobile (10 digits)"
                                        className="w-full bg-white border border-violet-100/80 hover:border-violet-200 focus:border-violet-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-violet-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
                                        value={customerDetails.phone}
                                        onChange={(e) => {
                                            const cleanValue = e.target.value.replace(/\D/g, '');
                                            if (cleanValue.length <= 10) {
                                                setCustomerDetails({ ...customerDetails, phone: cleanValue });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 mb-3 pt-3 border-t border-gray-100 text-left">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                <span className="text-gray-800 font-bold">₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Tax ({taxRate}%)</span>
                                <span className="text-gray-800 font-bold">₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 mt-1 border-t-2 border-dashed border-gray-200">
                                <span className="text-lg font-black text-gray-900 leading-none uppercase">Total</span>
                                <span className="text-2xl font-black text-violet-700">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            disabled={isProcessing || cart.length === 0}
                            onClick={handleCompleteOrder}
                            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-violet-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                            {isProcessing ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Complete Order
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
                    `}} />
        </div>
    );
};

export default StaffPOS;
