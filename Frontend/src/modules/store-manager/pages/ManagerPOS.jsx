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
  Activity,
  Printer,
  Package,
  Navigation,
  ShieldCheck,
  CreditCard,
  UserPlus,
  ArrowRight,
  Monitor
} from 'lucide-react';

import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import { createPOSOrder, searchProductsPOS } from '../../../common/api/posApi';
import { getPublicSettings } from '../../../common/api/settingApi';

const ManagerPOS = () => {
  const { managerUser } = useStoreManagerAuth();
  const storeId = managerUser?.branchId;
  const storeType = 'branch';

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const fetchSettings = async () => {
    try {
      const data = await getPublicSettings();
      setSettings(data);
    } catch (error) {
      console.error('Settings error:', error);
    }
  };

  const fetchProducts = async (query = '') => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await searchProductsPOS(query, { storeId, storeType }, managerUser?.token);
      setProducts((data.products || []).map(p => ({
        ...p,
        price: p.basePrice || 0,
        stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0)
      })));
    } catch (error) {
      toast.error('Inventory fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Out of stock');
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) return toast.warning('Max stock limit');
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

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = settings?.defaultTaxRate || 0;
  const taxAmount = (subTotal * taxRate) / 100;
  const totalAmount = subTotal + taxAmount;

    const handleCompleteOrder = async () => {
    if (cart.length === 0) return;
    const result = await Swal.fire({
      title: 'Confirm Order?',
      text: `Total Amount: ₹${totalAmount.toFixed(2)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Confirm Payment',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, managerUser?.token);
      Swal.fire({
          title: 'Order Successful',
          text: 'Order has been placed successfully.',
          icon: 'success',
          confirmButtonColor: '#2563eb'
      });
      setCart([]); setCustomerDetails({ name: '', email: '', phone: '' }); fetchProducts();
    } catch (error) {
      toast.error('Order failed to process');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-slate-50 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="bg-white px-8 py-5 flex items-center justify-between border-b border-slate-100 z-30">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg border border-slate-800">
                <Monitor size={22} />
            </div>
            <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Billing</h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Store: {managerUser?.branchId?.name || 'Local'}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
                type="text" 
                placeholder="Scan or find items (Product name / ID)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/30 transition-all outline-none shadow-inner"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
            />
        </div>

        <div className="flex items-center gap-3">
          <button className="h-12 px-6 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-sm active:scale-95">
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Catalog Grid */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#fcfdfe]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading && products.length === 0 ? Array(10).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
            )) : products.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group relative flex flex-col ${product.stock <= 0 ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95'}`}
              >
                <div className="aspect-square mb-4 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center p-4 relative group-hover:bg-blue-50/30 transition-colors">
                  <img src={product.image} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                  {product.stock > 0 && (
                      <div className="absolute top-2 right-2 p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={14} />
                      </div>
                  )}
                </div>
                <div className="flex-1">
                    <h3 className="text-[13px] font-black text-slate-800 line-clamp-2 uppercase tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-base font-black text-slate-900 tracking-tight">₹{product.price.toLocaleString()}</span>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase ${product.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {product.stock} units
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Console Sidebar */}
        <div className="w-[420px] bg-white border-l border-slate-100 flex flex-col relative z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-slate-900" />
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Order Summary</h3>
              </div>
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 uppercase tracking-widest animate-pulse">Secure Checkout</span>
            </div>

            {/* Cart Listing */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-8 custom-scrollbar pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 text-slate-200">
                    <Package size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Cart is Empty</p>
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Select products to add to cart</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product} className="flex gap-4 p-4 bg-[#fcfdfe] rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group/item">
                  <div className="w-16 h-16 shrink-0 bg-white border border-slate-100 rounded-xl p-2 relative">
                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight leading-4 mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold text-blue-500">PRICE: ₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
                        <button onClick={() => setCart(cart.map(c => c.product === item.product ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))} className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Minus size={12} /></button>
                        <span className="text-xs font-black w-4 text-center text-slate-900">{item.quantity}</span>
                        <button onClick={() => setCart(cart.map(c => c.product === item.product ? { ...c, quantity: Math.min(item.stock, c.quantity + 1) } : c))} className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Plus size={12} /></button>
                      </div>
                      <span className="text-sm font-black text-slate-900 tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {/* Customer Integration */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] space-y-4 mb-8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <UserPlus size={14} className="text-blue-600" /> Customer Details
                </h4>
                <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded uppercase">Active</div>
              </div>
              <div className="space-y-3">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                        type="text" placeholder="Customer Name"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 transition-all"
                        value={customerDetails.name} onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                        type="tel" placeholder="Mobile Number (+91)"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 transition-all"
                        value={customerDetails.phone} onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    />
                </div>
              </div>
            </div>

            {/* Reconciliation */}
            <div className="space-y-4 bg-slate-900 p-6 rounded-[2rem] border border-slate-800 mb-8 shadow-xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Banknote size={80} className="text-white" />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest"><span>Subtotal</span><span className="text-slate-300">₹{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest"><span>Tax ({taxRate}%)</span><span className="text-slate-300">₹{taxAmount.toLocaleString()}</span></div>
              <div className="pt-4 mt-2 border-t border-slate-800 flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block mb-1">Total Payable</span>
                    <span className="text-3xl font-black text-white tracking-tighter italic">₹{totalAmount.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <CreditCard className="text-blue-500" size={24} />
                </div>
              </div>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className="w-full relative h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:grayscale overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              {isProcessing ? <Loader2 size={24} className="animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-3">Pay Now <ArrowRight size={18} /></span>}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
    </div>
  );
};

export default ManagerPOS;
