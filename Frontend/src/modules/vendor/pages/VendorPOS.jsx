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
  Store,
  Printer,
  Package,
  IndianRupee,
  Terminal,
  Activity,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useVendor } from '../contexts/VendorContext';
import { createPOSOrder, searchProductsPOS } from '../../../common/api/posApi';
import { getPublicSettings } from '../../../common/api/settingApi';

const VendorPOS = () => {
  const { vendor } = useVendor();
  const storeId = vendor?._id;
  const storeType = 'vendor';

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
    if (storeId) fetchProducts();
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
    if (!storeId && storeType === 'vendor') return;
    setLoading(true);
    try {
      const data = await searchProductsPOS(query, { storeId, storeType }, vendor?.token);
      setProducts((data.products || []).map(p => ({
        ...p,
        price: p.basePrice || 0,
        stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0)
      })));
    } catch (error) {
      toast.error('Registry Sync Failed');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Asset Exhausted');
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) return toast.warning('Stock ceiling reached');
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
    setCart(prevCart => prevCart.map(item => {
      if (item.product === productId) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock && delta > 0) return item;
        return { ...item, quantity: Math.max(0, newQty) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = settings?.defaultTaxRate || 0;
  const taxAmount = (subTotal * taxRate) / 100;
  const totalAmount = subTotal + taxAmount;

  const handleCompleteOrder = async () => {
    if (cart.length === 0) return;
    const result = await Swal.fire({
      title: 'Finalize Checkout?',
      text: 'This will authorize the transaction and sync inventory stocks.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Authorize Transaction',
      customClass: { popup: 'premium-popup' }
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, vendor?.token);
      toast.success('Transaction Synchronized');
      setCart([]); setCustomerDetails({ name: '', email: '', phone: '' }); fetchProducts();
    } catch (error) {
      toast.error('Transmission Failure');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="pos-terminal-container">
      {/* Top Header Bar */}
      <header className="terminal-header">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="terminal-logo bg-slate-900"><Terminal size={18} className="text-white" /></div>
             <div>
                <h1 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5">Terminal POS v4</h1>
                <h2 className="text-lg font-black text-slate-900 tracking-tighter leading-none">New Sale Transmission</h2>
             </div>
          </div>
          <div className="status-indicator">
             <div className="dot animate-pulse"></div>
             <span>System Integrated</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-12">
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-all" size={20} />
              <input 
                type="text" 
                placeholder="Scan SKU or Search Registry..."
                className="search-input"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
              />
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => fetchProducts()} className="utility-btn"><RotateCcw size={18} /></button>
           <button className="utility-btn"><Printer size={18} /></button>
        </div>
      </header>

      <main className="terminal-main flex-1 flex overflow-hidden">
        {/* Registry Catalog */}
        <section className="catalog-panel flex-1 overflow-y-auto custom-scrollbar p-8">
           <div className="catalog-grid">
             {loading && products.length === 0 ? (
               Array(12).fill(0).map((_, i) => <div key={i} className="skeleton-card"></div>)
             ) : products.length === 0 ? (
               <div className="col-span-full py-32 opacity-20 text-center uppercase tracking-widest font-black">Registry Empty</div>
             ) : products.map(product => (
               <div 
                 key={product._id} 
                 onClick={() => addToCart(product)} 
                 className={`asset-card ${product.stock <= 0 ? 'exhausted' : ''}`}
               >
                 <div className="asset-media relative aspect-square">
                    <div className="category-tag">{product.category || 'General SKU'}</div>
                    <img 
                      src={product.image} 
                      className="asset-img" 
                      alt={product.name}
                      onError={(e) => e.target.src = 'https://placehold.co/400x400/f8fafc/3b82f6?text='+product.name.charAt(0)}
                    />
                    {product.stock <= 0 && <div className="exhaust-overlay"><span>EXHAUSTED</span></div>}
                 </div>
                 <div className="asset-details">
                    <h3 className="asset-name">{product.name}</h3>
                    <div className="flex justify-between items-end mt-2">
                       <div className="price-node">
                          <span className="currency">₹</span>
                          <span className="value">{product.price}</span>
                       </div>
                       <div className="stock-node">
                          <div className={`stock-indicator ${product.stock > 5 ? 'high' : 'low'}`}></div>
                          <span>{product.stock} {product.unitType?.substring(0,2).toUpperCase() || 'UNITS'}</span>
                       </div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* Console Sidebar */}
        <aside className="console-sidebar w-[420px] bg-white border-l border-slate-100 flex flex-col">
           <div className="console-header p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <ShoppingCart size={20} className="text-blue-500" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Active Batch</h4>
              </div>
              <span className="batch-count">{cart.length} SKU Nodes</span>
           </div>

           <div className="batch-listing flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {cart.map(item => (
                <div key={item.product} className="batch-item">
                   <div className="item-thumb">
                      <img src={item.image} alt="" onError={(e) => e.target.src='https://placehold.co/100x100/f8fafc/3b82f6?text='+item.name.charAt(0)} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between mb-1">
                         <h5 className="item-name">{item.name}</h5>
                         <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
                      </div>
                      <p className="item-meta">₹{item.price} / UNIT</p>
                      <div className="flex justify-between items-center mt-3">
                         <div className="qty-control">
                            <button onClick={() => updateQuantity(item.product, -1)}><Minus size={10} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product, 1)}><Plus size={10} /></button>
                         </div>
                         <span className="item-total">₹{item.price * item.quantity}</span>
                      </div>
                   </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center grayscale scale-75">
                   <Zap size={64} strokeWidth={1} />
                   <p className="mt-8 font-black uppercase tracking-[0.2em]">Batch Pending Initialization</p>
                </div>
              )}
           </div>

           <div className="billing-footer p-8 bg-slate-900">
              <div className="billing-rows space-y-3 mb-8">
                 <div className="billing-row">
                    <span>Registry Value</span>
                    <span>₹{subTotal}</span>
                 </div>
                 <div className="billing-row">
                    <span>Regulatory Tax</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                 </div>
                 <div className="total-block pt-6 border-t border-white/5 flex justify-between items-end">
                    <div>
                       <p className="label">Total Authorized Value</p>
                       <p className="amount">₹{totalAmount.toFixed(0)}</p>
                    </div>
                    <CreditCard size={28} className="text-blue-500/50" />
                 </div>
              </div>
              <button 
                disabled={isProcessing || cart.length === 0}
                onClick={handleCompleteOrder}
                className="authorize-btn"
              >
                {isProcessing ? 'SYNCHRONIZING...' : 'AUTHORIZE TRANSACTION'}
              </button>
           </div>
        </aside>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .pos-terminal-container { height: 100vh; display: flex; flex-direction: column; background: #fdfdff; font-family: 'Inter', sans-serif; overflow: hidden; }
        
        .terminal-header { height: 90px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); z-index: 50; }
        .terminal-logo { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .status-indicator { display: flex; align-items: center; gap: 8px; padding: 4px 12px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 10rem; color: #16a34a; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-left: 24px; }
        .status-indicator .dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; box-shadow: 0 0 8px #16a34a; }
        
        .search-input { width: 100%; height: 50px; background: #f1f5f9; border: none; border-radius: 1.25rem; padding: 0 24px 0 60px; font-size: 14px; font-weight: 700; color: #1e293b; outline: none; transition: all 0.2s; border: 1px solid transparent; }
        .search-input:focus { background: #fff; border-color: #3b82f6; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1); }
        .utility-btn { width: 50px; height: 50px; border-radius: 1.25rem; background: #fff; border: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: all 0.2s; }
        .utility-btn:hover { background: #f8fafc; color: #3b82f6; border-color: #3b82f6; }
        
        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
        .asset-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 2rem; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
        .asset-card:hover { transform: translateY(-8px); box-shadow: 0 30px 40px -20px rgba(0,0,0,0.1); border-color: #3b82f6; }
        .asset-media { padding: 24px; display: flex; items-center; justify-center; background: #fff; }
        .asset-img { width: 100%; height: 100%; object-contain; transition: transform 0.4s ease; }
        .asset-card:hover .asset-img { transform: scale(1.1); }
        .category-tag { position: absolute; top: 12px; left: 12px; font-size: 8px; font-weight: 900; background: #f8fafc; color: #64748b; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; border: 1px solid #f1f5f9; z-index: 5; }
        .asset-details { padding: 20px; border-top: 1px solid #f8fafc; }
        .asset-name { font-size: 13px; font-weight: 900; color: #0f172a; text-transform: uppercase; tracking: -0.01em; line-height: 1.2; }
        .price-node { font-family: 'Inter', sans-serif; }
        .price-node .currency { font-size: 12px; font-weight: 900; color: #3b82f6; margin-right: 2px; }
        .price-node .value { font-size: 18px; font-weight: 900; color: #0f172a; }
        .stock-node { display: flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 900; color: #94a3b8; }
        .stock-indicator { width: 6px; height: 6px; border-radius: 50%; }
        .stock-indicator.high { background: #16a34a; }
        .stock-indicator.low { background: #f59e0b; }
        .exhausted { opacity: 0.6; grayscale(1); }
        .exhaust-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; }
        .exhaust-overlay span { background: #0f172a; color: #fff; font-size: 10px; font-weight: 900; padding: 6px 14px; border-radius: 8px; }

        .console-header { background: #fff; }
        .batch-count { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; background: #f8fafc; padding: 6px 14px; border-radius: 10rem; }
        .batch-item { display: flex; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid transparent; border-radius: 1.5rem; transition: all 0.2s; }
        .batch-item:hover { background: #fff; border-color: #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .item-thumb { width: 56px; height: 56px; background: #fff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 6px; flex-shrink: 0; }
        .item-thumb img { width: 100%; height: 100%; object-contain; }
        .item-name { font-size: 12px; font-weight: 900; color: #1e293b; text-transform: uppercase; }
        .item-meta { font-size: 10px; font-weight: 700; color: #94a3b8; }
        .qty-control { display: flex; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; height: 32px; overflow: hidden; }
        .qty-control button { width: 32px; height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; }
        .qty-control button:hover { background: #f8fafc; color: #3b82f6; }
        .qty-control span { min-width: 32px; text-align: center; font-size: 12px; font-weight: 900; color: #1e293b; }
        .item-total { font-size: 14px; font-weight: 900; color: #0f172a; }

        .billing-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; tracking: 0.1em; }
        .total-block .label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; tracking: 0.2em; margin-bottom: 4px; }
        .total-block .amount { font-size: 32px; font-weight: 900; color: #fff; line-height: 1; }
        .authorize-btn { width: 100%; height: 60px; background: #fff; color: #0f172a; border-radius: 1.25rem; font-size: 12px; font-weight: 900; text-transform: uppercase; tracking: 0.2em; margin-top: 24px; transition: all 0.3s; }
        .authorize-btn:hover:not(:disabled) { background: #3b82f6; color: #fff; transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }
        .authorize-btn:disabled { opacity: 0.2; cursor: not-allowed; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10rem; }
        .skeleton-card { aspect-ratio: 1; background: #fff; border-radius: 2rem; border: 1px solid #f1f5f9; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .premium-popup { border-radius: 3rem !important; padding: 40px !important; }
      `}} />
    </div>
  );
};

export default VendorPOS;
