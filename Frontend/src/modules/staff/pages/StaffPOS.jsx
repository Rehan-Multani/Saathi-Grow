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
  Package
} from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useStaffAuth } from '../context/StaffAuthContext';
import { createPOSOrder, searchProductsPOS } from '../../admin/api/posApi';
import { getPublicSettings } from '../../admin/api/settingApi';

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
      console.error('Failed to fetch settings:', error);
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
    if (product.stock <= 0) return toast.error('Product out of stock');
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) return toast.warning('Max stock reached');
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
    if (cart.length === 0) return toast.warning('Cart is empty');
    const { value: confirmResult } = await Swal.fire({
      title: 'Complete Sale?',
      confirmButtonColor: '#10b981', // Staff theme green
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Confirm'
    });
    if (!confirmResult) return;

    setIsProcessing(true);
    try {
      await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, staffUser?.token);
      await Swal.fire({ title: 'Success!', text: 'Order processed successfully.', icon: 'success' });
      setCart([]);
      setCustomerDetails({ name: '', email: '', phone: '' });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header: Staff Green Theme */}
      <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap size={18} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight leading-none">Staff POS Terminal</h2>
            <p className="text-[9px] font-bold opacity-80 mt-1 uppercase tracking-widest">Branch: {staffUser?.branchName || 'Offline'}</p>
          </div>
        </div>
        <div className="hidden md:flex flex-1 max-w-sm mx-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" size={14} />
          <input
            type="text"
            placeholder="Scan or Search..."
            className="w-full bg-emerald-700/50 border border-emerald-500/30 rounded-lg py-2 pl-10 pr-4 text-xs font-bold placeholder:text-emerald-300 outline-none focus:ring-1 focus:ring-emerald-300 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 border-2 border-emerald-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">{cart.length}</span>}
          </button>
          <div className="h-8 w-px bg-white/20"></div>
          <button className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg font-black text-[10px] uppercase shadow-md hover:bg-gray-50 transition-all">
            Print Last
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50/50">
        {/* Product Grid */}
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-2">
            {loading && products.length === 0 ? Array(10).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-xl animate-pulse shadow-sm"></div>
            )) : products.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-emerald-200 cursor-pointer group relative ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="aspect-square mb-2 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-1.5 relative">
                  <img src={product.image || 'https://placehold.co/100'} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  {product.stock <= 5 && product.stock > 0 && <span className="absolute top-1 right-1 bg-amber-500 text-white text-[6px] font-black px-1 py-0.5 rounded shadow-sm uppercase">Low</span>}
                </div>
                <h3 className="text-[9px] font-black text-gray-800 line-clamp-1 truncate leading-none mb-1.5">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-600">₹{product.price}</span>
                  <div className={`px-1.5 py-0.5 rounded-md text-[7px] font-black ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                    {product.stock} {product.unitType || 'Pcs'}
                  </div>
                </div>
                <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Cart & Customer */}
        <div className="w-80 bg-white border-l border-gray-100 flex flex-col shadow-2xl relative z-10">
          <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={12} className="text-emerald-500" /> Cart
              </h3>
              <button onClick={() => setCart([])} className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase">Reset</button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 space-y-2 mb-4">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Package size={32} strokeWidth={1} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Items</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product} className="flex gap-3 p-3 rounded-2xl border border-gray-50 bg-gray-50/50 group hover:bg-white hover:shadow-md transition-all">
                  <img src={item.image} className="w-12 h-12 rounded-xl object-cover border bg-white p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-800 truncate leading-none mb-1 uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-black text-emerald-600 mb-2">₹{item.price}</p>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
                      <button onClick={() => updateQuantity(item.product, -1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><Minus size={10} /></button>
                      <span className="text-[10px] font-black w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, 1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><Plus size={10} /></button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-[11px] font-black text-gray-900">₹{item.price * item.quantity}</span>
                    <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="text-gray-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div className="bg-emerald-50/30 p-4 rounded-3xl border border-emerald-100/50 mb-4 space-y-3">
              <h4 className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-2">
                <User size={12} fill="currentColor" /> Customer details
              </h4>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" size={12} />
                <input
                  type="email" placeholder="Customer Email"
                  className="w-full bg-white/80 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold shadow-sm focus:ring-1 focus:ring-emerald-200"
                  value={customerDetails.email}
                  onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" size={12} />
                <input
                  type="tel" placeholder="Phone Number"
                  className="w-full bg-white/80 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold shadow-sm focus:ring-1 focus:ring-emerald-200"
                  value={customerDetails.phone}
                  onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 mb-4 px-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>SUBTOTAL</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>TAX ({taxRate}%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-2xl shadow-xl mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Bill</span>
                <span className="text-2xl font-black tracking-tighter">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Payment Selection */}
            <div className="grid grid-cols-1 mb-4">
              <div
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-[10px] font-black transition-all bg-emerald-600 text-white border-transparent`}
              >
                <Banknote size={16} /> CASH ONLY
              </div>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white ${cart.length === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
            >
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
            `}} />
    </div>
  );
};

export default StaffPOS;
