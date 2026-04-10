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
  ShieldCheck
} from 'lucide-react';
import { Modal } from 'react-bootstrap';
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
      title: 'Authorize Payment?',
      confirmButtonColor: '#2563eb', // Manager Blue
      confirmButtonText: 'Authorize'
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, managerUser?.token);
      Swal.fire('Success', 'Transaction logged successfully', 'success');
      setCart([]); setCustomerDetails({ name: '', email: '', phone: '' }); fetchProducts();
    } catch (error) {
      toast.error('Transaction Failed');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-slate-50 border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/5">
      {/* Intel Header: Manager Blue/Slate Theme */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Management POS</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Terminal | Branch ID: {storeId || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text" placeholder="Resource Index Search..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-11 pr-4 text-xs font-bold text-slate-200 placeholder:text-slate-600 focus:bg-slate-800 transition-all outline-none"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-10 px-4 bg-slate-800 rounded-xl flex items-center gap-3 border border-slate-700">
            <ShoppingCart size={16} className="text-blue-500" />
            <span className="text-xs font-black text-white">{cart.length}</span>
          </div>
          <button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
            Print Report
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Catalog View */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 Gap-3">
            {loading && products.length === 0 ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-56 bg-white rounded-3xl animate-pulse"></div>
            )) : products.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-[1.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer group relative ${product.stock <= 0 ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="aspect-square mb-2 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 relative border border-slate-50 group-hover:bg-white transition-colors">
                  <img src={product.image} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <h3 className="text-[9px] font-bold text-slate-700 mb-1.5 truncate uppercase">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black text-blue-600">₹{product.price}</span>
                  <span className="text-[7px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{product.stock} IN</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secure Checkpoint Sidebar */}
        <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col relative z-20">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Navigation size={16} />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Transaction Buffer</h3>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase tracking-widest">Encrypted</span>
            </div>

            {/* Order Buffer */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-6 custom-scrollbar pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <ShoppingCart size={40} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 text-center">Protocol Idle<br />Waiting for Input</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-900/5">
                  <img src={item.image} className="w-14 h-14 object-contain" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tighter">{item.name}</p>
                    <p className="text-xs font-black text-blue-600 mt-1">₹{item.price}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button onClick={() => setCart(cart.map(c => c.product === item.product ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))} className="p-1 hover:bg-slate-50 rounded-md"><Minus size={10} /></button>
                        <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => setCart(cart.map(c => c.product === item.product ? { ...c, quantity: Math.min(item.stock, c.quantity + 1) } : c))} className="p-1 hover:bg-slate-50 rounded-md"><Plus size={10} /></button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-xs font-black text-slate-900">₹{item.price * item.quantity}</span>
                    <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* User Parameters */}
            <div className="bg-slate-900 p-5 rounded-[2rem] space-y-3 mb-6 shadow-2xl shadow-blue-900/20">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                <ShieldCheck size={12} className="text-blue-500" /> Identity verification
              </h4>
              <input
                type="email" placeholder="Customer Identity (Email)"
                className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-[11px] font-bold text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/50"
                value={customerDetails.email} onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
              />
              <input
                type="tel" placeholder="Communication Index (Phone)"
                className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-[11px] font-bold text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/50"
                value={customerDetails.phone} onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
              />
            </div>

            {/* Audit Summary */}
            <div className="space-y-2.5 bg-slate-50 p-5 rounded-3xl border border-slate-200 mb-6">
              <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>SUBTOTAL</span><span>₹{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>VAT / TAX ({taxRate}%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="pt-3 mt-3 border-t border-slate-200 border-dashed flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Net Payable</span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Protocol Selection */}
            <div className="grid grid-cols-1 mb-6">
              <div className={`py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black transition-all bg-blue-600 text-white shadow-xl shadow-blue-500/20`}>
                <Banknote size={16} /> CASH ONLY
              </div>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-slate-200"
            >
              Finalize Audit & Sync Stock
            </button>
          </div>
        </div>
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
    </div>
  );
};

export default ManagerPOS;
