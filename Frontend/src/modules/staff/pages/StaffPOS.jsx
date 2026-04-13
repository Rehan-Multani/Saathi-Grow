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
            const data = await searchProductsPOS(query, { storeId, storeType }, staffUser?.token);
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
                if (newQty > item.stock) return item;
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
        const result = await Swal.fire({
            title: 'Confirm Bill?',
            text: `Confirming payment for ₹${totalAmount.toFixed(0)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Collect Payment',
            cancelButtonText: 'Back',
            confirmButtonColor: '#2563eb',
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
                    confirmButtonColor: '#2563eb',
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
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            {/* POS Header */}
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white border-b border-white/5 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-full bg-blue-600/10 blur-[60px] pointer-events-none" />
                <div className="flex items-center gap-5 relative text-left">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg group">
                        <Zap size={22} className="text-blue-400 group-hover:scale-125 transition-transform" fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] leading-none italic font-black">Checkout Hub</h2>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] italic font-black">{staffUser?.branchName || 'Local Unit'} • <span className="text-blue-400">POS-01</span></p>
                    </div>
                </div>
                
                <div className="hidden md:flex flex-1 max-w-lg mx-12 relative group text-left">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Scan or find item..."
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-black lowercase placeholder:text-slate-600 outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all shadow-inner tracking-widest text-left font-black"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
                    />
                </div>

                <div className="flex items-center gap-4 relative">
                    <button className="flex items-center gap-3 px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all group italic font-black shadow-sm shrink-0">
                        <Printer size={16} className="group-hover:-translate-y-1 transition-transform" /> Print Last Bill
                    </button>
                    <button onClick={() => fetchProducts(searchTerm)} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 transition-all text-blue-400 hover:text-white shrink-0">
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden bg-slate-50/20">
                {/* Main Product Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
                        {loading && products.length === 0 ? (
                            Array(15).fill(0).map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-white rounded-[2.5rem] animate-pulse shadow-sm border border-slate-50"></div>
                            ))
                        ) : products.map((product, i) => (
                            <div
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className={`bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all border border-slate-100 hover:border-blue-200 cursor-pointer group relative overflow-hidden flex flex-col min-h-[280px] ${product.stock <= 0 ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                                style={{ animationDelay: `${i * 30}ms` }}
                            >
                                <div className="aspect-square mb-6 bg-slate-50/50 rounded-[2rem] overflow-hidden flex items-center justify-center p-6 relative border border-slate-50 group-hover:bg-blue-50/20 transition-colors shrink-0 shadow-inner">
                                    <img src={product.image || 'https://placehold.co/200'} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" />
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[8px] font-black rounded-lg shadow-xl uppercase tracking-widest animate-pulse italic">Critical Stock</div>
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between text-left">
                                    <div className="space-y-2">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-tight italic leading-tight line-clamp-2 font-black leading-none">{product.name}</h3>
                                        <div className="flex items-center gap-1.5 font-black">
                                           <Tag size={10} className="text-slate-300 shrink-0" />
                                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none">{product.category || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-6">
                                        <span className="text-xl font-black text-slate-900 italic tracking-tighter">₹{product.price}</span>
                                        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {product.stock} Unit
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Hover Indicator */}
                                <div className="absolute inset-x-0 bottom-0 py-2.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 italic">
                                    Click to billing
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Panel */}
                <div className="w-80 md:w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.02)] shrink-0 animate-in slide-in-from-right-10 duration-700">
                    <div className="p-8 lg:p-10 flex flex-col h-full overflow-y-hidden">
                        <div className="flex items-center justify-between mb-8 group shrink-0 text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center italic shadow-xl shadow-slate-200 shrink-0">
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest italic leading-none font-black">Active Cart</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none">{cart.length} unique items</p>
                                </div>
                            </div>
                            {cart.length > 0 && (
                                <button 
                                    onClick={() => setCart([])} 
                                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all group/btn shadow-sm shrink-0"
                                >
                                    <Trash2 size={16} className="group-hover/btn:animate-shake" />
                                </button>
                            )}
                        </div>

                        {/* Cart Center */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-3 -mr-3 mb-8">
                            {cart.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-slate-50 text-slate-100 rounded-[3rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                                        <Package size={40} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic font-black">Scan Items To Start</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.product} className="flex gap-5 p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 hover:border-blue-100 transition-all group relative text-left">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 p-3 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                        <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 truncate uppercase mt-0.5 italic font-black leading-none">{item.name}</p>
                                            <p className="text-[10px] font-black text-blue-600 italic mt-2 leading-none font-black">₹{item.price}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mt-4 font-black">
                                            <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                                                <button onClick={() => updateQuantity(item.product, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"><Minus size={14} /></button>
                                                <span className="text-[12px] font-black w-8 text-center text-slate-900 italic font-black">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-lg transition-all"><Plus size={14} /></button>
                                            </div>
                                            <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="w-9 h-9 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="p-1 shrink-0">
                                        <span className="text-[14px] font-black text-slate-900 italic font-black tracking-tighter shrink-0">₹{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Customer & Checkout */}
                        <div className="space-y-6 pt-6 border-t border-slate-100 shrink-0 text-left">
                            <div className="bg-slate-950 text-white p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px] pointer-events-none rounded-full" />
                                
                                <div className="space-y-4 relative">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center justify-between mb-4 italic leading-none font-black">
                                        User Info <User size={12} className="text-blue-500" />
                                    </label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-blue-500 transition-colors" size={16} />
                                        <input
                                            type="tel"
                                            placeholder="USER PHONE NUMBER"
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-6 text-[11px] font-black placeholder:text-slate-800 outline-none focus:bg-white/10 focus:border-blue-500 transition-all text-blue-400 tracking-[0.4em] text-center font-black"
                                            value={customerDetails.phone}
                                            onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-white/10 space-y-4 font-black">
                                    <div className="flex justify-between items-center text-[11px] font-black text-slate-500 uppercase tracking-widest italic leading-none font-black">
                                        <span>Bill Value</span>
                                        <span className="text-white">₹{subTotal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <div className="text-left font-black">
                                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic block mb-3 font-black leading-none">Net Total</span>
                                           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic leading-none font-black">Incl. all taxes ({taxRate}%)</p>
                                        </div>
                                        <div className="text-right">
                                           <span className="text-4xl font-black italic tracking-tighter text-white font-black leading-none leading-[0.8] mb-1 block">₹{totalAmount.toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-2 font-black">
                                   <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-[1.5rem] border border-white/10 hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all cursor-pointer group/pay-opt">
                                      <Banknote size={16} className="text-emerald-500 group-hover/pay-opt:scale-110 transition-transform" /> 
                                      <span className="text-[8px] font-black uppercase tracking-widest italic font-black">Cash Base</span>
                                   </div>
                                   <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-[1.5rem] border border-white/10 opacity-20 grayscale cursor-not-allowed">
                                      <CreditCard size={16} className="text-slate-500" /> 
                                      <span className="text-[8px] font-black uppercase tracking-widest italic font-black">Digital Arc</span>
                                   </div>
                                </div>

                                <button
                                    disabled={isProcessing || cart.length === 0}
                                    onClick={handleCompleteOrder}
                                    className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-3xl active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group/pay italic font-black ${cart.length === 0 ? 'bg-slate-900 text-slate-800 cursor-not-allowed border border-white/5' : 'bg-blue-600 text-white hover:bg-black shadow-blue-500/40'}`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                                        </div>
                                    ) : (
                                        <>Proceed to Pay <ArrowRight size={18} className="group-hover/pay:translate-x-2 transition-all" /></>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-3 text-slate-300 pb-2">
                               <ShieldCheck size={14} className="text-blue-500 animate-pulse" />
                               <span className="text-[9px] font-black uppercase tracking-[0.3em] italic font-black">Authorized Terminal Locked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
                        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                        @keyframes shake { 
                            10%, 90% { transform: translate3d(-1px, 0, 0); } 
                            20%, 80% { transform: translate3d(2px, 0, 0); } 
                            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 
                            40%, 60% { transform: translate3d(4px, 0, 0); } 
                        }
                    `}} />
        </div>
    );
};

export default StaffPOS;
