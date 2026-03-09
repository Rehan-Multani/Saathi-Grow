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
  QrCode,
  CheckCircle,
  Store,
  Printer,
  Package
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useVendor } from '../contexts/VendorContext';
import { createPOSOrder, searchProductsPOS } from '../../admin/api/posApi';
import { getPublicSettings } from '../../admin/api/settingApi';

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
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

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
      toast.error('Product fetch failed');
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
      title: 'Complete Vendor Billing?',
      text: `Confirming ₹${totalAmount.toFixed(0)} via ${paymentMethod.toUpperCase()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0c831f', // Vendor Green
      confirmButtonText: 'Yes, Finalize'
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      if (paymentMethod === 'online' && !showQRModal) {
        setPaymentLink('https://saathigro.com/pay');
        setShowQRModal(true); setIsProcessing(false); return;
      }
      await createPOSOrder({ items: cart, customerDetails, paymentMethod, storeId, storeType }, vendor?.token);
      Swal.fire('Success', 'Inventory updated and bill sent.', 'success');
      setCart([]); setCustomerDetails({ name: '', email: '', phone: '' }); fetchProducts();
    } catch (error) {
      toast.error('Billing failed');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50">
      {/* Vendor Header: #0c831f Theme */}
      <div className="bg-[#0c831f] px-6 py-4 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
            <Store size={22} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight leading-none">Vendor POS Terminal</h2>
            <p className="text-[10px] font-bold text-white/70 mt-1 uppercase tracking-widest">{vendor?.storeName || 'Active Store'}</p>
          </div>
        </div>

        <div className="flex-1 max-w-sm mx-10 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
          <input
            type="text" placeholder="Scan or Search products..."
            className="w-full bg-black/10 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm font-bold placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 focus:bg-black/20 transition-all"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-white/10 backdrop-blur-sm">
            <ShoppingCart size={18} />
            <span className="text-sm font-black">{cart.length}</span>
          </div>
          <button className="px-5 py-2.5 bg-white text-[#0c831f] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-md active:scale-95">
            Print Bill
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Store Catalog Grid */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 Gap-3">
            {loading && products.length === 0 ? Array(10).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse shadow-sm"></div>
            )) : products.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-2xl p-3 shadow-sm hover:shadow-2xl transition-all border border-transparent hover:border-[#0c831f]/20 cursor-pointer group relative ${product.stock <= 0 ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="aspect-square mb-2 bg-gray-50 rounded-xl flex items-center justify-center p-3 relative group-hover:bg-white transition-colors">
                  <img src={product.image} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <h3 className="text-[9px] font-black text-gray-800 mb-1.5 truncate uppercase">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#0c831f]">₹{product.price}</span>
                  <span className="text-[7px] font-black text-gray-400 bg-gray-50 px-1 py-0.5 rounded uppercase">{product.stock} {product.unitType?.substring(0, 2) || 'Pc'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Sidebar */}
        <div className="w-[420px] bg-white border-l border-gray-100 flex flex-col relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
          <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-[#0c831f]" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Order Cart</h3>
              </div>
              <button onClick={() => setCart([])} className="text-xs font-black text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors uppercase">Reset</button>
            </div>

            {/* Cart List */}
            <div className="flex-1 space-y-4 mb-8">
              {cart.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-gray-200">
                  <Package size={48} strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-widest mt-4">Empty Cart</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product} className="flex gap-4 p-4 rounded-3xl border border-gray-50 bg-gray-50/30 group hover:bg-white hover:shadow-xl transition-all shadow-sm">
                  <img src={item.image} className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 truncate leading-none mb-2 uppercase">{item.name}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.product, -1)} className="p-1.5 hover:bg-white rounded-lg transition-all"><Minus size={12} /></button>
                        <span className="text-xs font-black w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product, 1)} className="p-1.5 hover:bg-white rounded-lg transition-all"><Plus size={12} /></button>
                      </div>
                      <span className="text-xs font-black text-[#0c831f]">₹{item.price}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</span>
                    <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50/50 p-6 rounded-[2.5rem] space-y-4 mb-8 border border-gray-100 shadow-inner">
              <h4 className="text-[10px] font-black text-[#0c831f] uppercase tracking-[0.3em] flex items-center gap-2">
                <User size={14} fill="currentColor" /> Customer Profile
              </h4>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c831f] transition-colors" size={14} />
                <input
                  type="email" placeholder="Customer Email"
                  className="w-full bg-white border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c831f]/10"
                  value={customerDetails.email} onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c831f] transition-colors" size={14} />
                <input
                  type="tel" placeholder="Mobile Number"
                  className="w-full bg-white border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c831f]/10"
                  value={customerDetails.phone} onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Billing Calculation */}
            <div className="space-y-3 mb-8 px-2 border-t border-dashed border-gray-200 pt-6">
              <div className="flex justify-between text-xs font-black text-gray-400"><span>SUBTOTAL</span><span>₹{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs font-black text-gray-400"><span>TAX / GST ({taxRate}%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="mt-6 flex justify-between items-center bg-[#0c831f] p-6 rounded-[2.5rem] shadow-2xl shadow-[#0c831f]/20 text-white">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Net Payable</span>
                <span className="text-4xl font-black tracking-tighter">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Payment Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setPaymentMethod('cash')} className={`py-4 rounded-3xl flex items-center justify-center gap-3 text-xs font-black transition-all ${paymentMethod === 'cash' ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                <Banknote size={18} /> CASH SALE
              </button>
              <button onClick={() => setPaymentMethod('online')} className={`py-4 rounded-3xl flex items-center justify-center gap-3 text-xs font-black transition-all ${paymentMethod === 'online' ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                <QrCode size={18} /> QR PAY
              </button>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className={`w-full py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-white ${cart.length === 0 ? 'bg-gray-200 cursor-not-allowed shadow-none' : 'bg-[#0c831f] hover:bg-[#0a6b19] shadow-[#0c831f]/20'}`}
            >
              {isProcessing ? 'Processing Transaction...' : 'Complete Transaction'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Modal with Vendor Theme */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-white rounded-t-[3rem] p-8">
          <Modal.Title className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Payment Link Generated</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-12 text-center bg-white rounded-b-[3rem]">
          <div className="bg-gray-50 p-10 rounded-[3.5rem] inline-block mb-10 shadow-inner border border-gray-100">
            <QRCodeSVG value={paymentLink} size={240} fgColor="#0c831f" />
          </div>
          <h3 className="text-5xl font-black text-gray-900 mb-2 tracking-tighter">₹{totalAmount.toFixed(0)}</h3>
          <p className="text-xs text-[#0c831f] font-black uppercase tracking-[0.4em] mb-12 opacity-80">Unified Payment Interface</p>
          <button
            onClick={() => { setShowQRModal(false); handleCompleteOrder(); }}
            className="w-full bg-[#0c831f] text-white py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#0c831f]/30 hover:bg-[#0a6b19] transition-all"
          >
            Success: Payment Verified
          </button>
        </Modal.Body>
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}} />
    </div>
  );
};

export default VendorPOS;
