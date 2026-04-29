import React, { useState, useEffect } from 'react';
import {
  Search, ShoppingCart, Trash2, Plus, Minus, User,
  Phone, Banknote, Printer, Package, ShieldCheck,
  CreditCard, UserPlus, ArrowRight, Zap, X, ChevronRight
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
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => { if (storeId) fetchProducts(); }, [storeId]);

  const fetchSettings = async () => {
    try { setSettings(await getPublicSettings()); } catch {}
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
    } catch { toast.error('Inventory fetch failed'); }
    finally { setLoading(false); }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Out of stock');
    const existing = cart.find(i => i.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) return toast.warning('Max stock reached');
      setCart(cart.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { product: product._id, name: product.name, price: product.price || 0, image: product.image, quantity: 1, stock: product.stock }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.product === id ? { ...i, quantity: Math.min(i.stock, Math.max(1, i.quantity + delta)) } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.product !== id));

  const subTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxRate = settings?.defaultTaxRate || 0;
  const taxAmount = (subTotal * taxRate) / 100;
  const totalAmount = subTotal + taxAmount;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCompleteOrder = async () => {
    if (!cart.length) return;
    const result = await Swal.fire({
      title: 'Confirm Payment',
      html: `<div style="font-size:14px;color:#64748b">Total: <strong style="font-size:22px;color:#1e293b">₹${totalAmount.toFixed(2)}</strong></div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Confirm & Pay',
      cancelButtonText: 'Cancel',
      borderRadius: '1rem',
    });
    if (!result.isConfirmed) return;
    setIsProcessing(true);
    try {
      await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, managerUser?.token);
      Swal.fire({ title: 'Payment Successful!', icon: 'success', confirmButtonColor: '#2563eb', timer: 2000, showConfirmButton: false });
      setCart([]);
      setCustomerDetails({ name: '', phone: '' });
      fetchProducts();
    } catch { toast.error('Order failed'); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl">

      {/* ── LEFT: Product Catalog ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Search bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:bg-white transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search products by name or scan barcode..."
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); fetchProducts(''); }} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95">
            <Printer size={15} /> Print Receipt
          </button>
        </div>

        {/* Stats strip */}
        <div className="bg-white px-6 py-2.5 border-b border-slate-100 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {products.length} Products
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Store: {managerUser?.branchId?.name || 'Local Branch'}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="h-52 bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Package size={40} className="text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(product => {
                const inCart = cart.find(i => i.product === product._id);
                const outOfStock = product.stock <= 0;
                return (
                  <div
                    key={product._id}
                    onClick={() => !outOfStock && addToCart(product)}
                    className={`bg-white rounded-2xl border transition-all flex flex-col overflow-hidden group relative
                      ${outOfStock
                        ? 'opacity-50 grayscale cursor-not-allowed border-slate-100'
                        : 'cursor-pointer border-slate-100 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.97]'
                      }
                      ${inCart ? 'border-blue-400 ring-2 ring-blue-100' : ''}
                    `}
                  >
                    {/* Image */}
                    <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={e => e.target.style.display = 'none'}
                      />
                      {inCart && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                          {inCart.quantity}
                        </div>
                      )}
                      {!outOfStock && !inCart && (
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                            <Plus size={16} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <p className="text-[11px] font-black text-slate-800 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-sm font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide
                          ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                          {outOfStock ? 'Out' : `${product.stock}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Order Panel ────────────────────────────────────────── */}
      <div className="w-[380px] shrink-0 bg-white border-l border-slate-100 flex flex-col">

        {/* Panel header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-none">Order Summary</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
              <Trash2 size={12} /> Clear
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
                <ShoppingCart size={28} className="text-slate-200" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cart is empty</p>
              <p className="text-[10px] text-slate-300 font-medium mt-1">Click products to add them</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 shrink-0 bg-white rounded-xl border border-slate-100 p-1.5 flex items-center justify-center">
                <img src={item.image} className="w-full h-full object-contain" alt="" onError={e => e.target.style.display = 'none'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{item.name}</p>
                <p className="text-[10px] text-blue-500 font-bold">₹{item.price.toLocaleString()} each</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.product, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-black w-5 text-center text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                      <Plus size={10} />
                    </button>
                  </div>
                  <span className="text-xs font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.product)} className="text-slate-200 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Customer + Totals + Pay */}
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">

          {/* Customer details */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <UserPlus size={11} className="text-blue-500" /> Customer (Optional)
            </p>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              <input
                type="text" placeholder="Customer name"
                className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 transition-all"
                value={customerDetails.name}
                onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              <input
                type="tel" placeholder="Mobile number"
                className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 transition-all"
                value={customerDetails.phone}
                onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Bill breakdown */}
          <div className="bg-slate-900 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-300">₹{subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Tax ({taxRate}%)</span>
              <span className="text-slate-300">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 mt-1 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Total Payable</p>
                <p className="text-2xl font-black text-white tracking-tight">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <CreditCard size={20} className="text-blue-400" />
              </div>
            </div>
          </div>

          {/* Pay button */}
          <button
            disabled={isProcessing || cart.length === 0}
            onClick={handleCompleteOrder}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap size={15} className="fill-white" />
                Pay Now
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .overflow-y-auto::-webkit-scrollbar { width: 3px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default ManagerPOS;
