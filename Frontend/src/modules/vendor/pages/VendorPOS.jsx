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
  Package,
  IndianRupee
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

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product === productId) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock && delta > 0) {
          toast.warning('Max stock reached');
          return item;
        }
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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#f8fafc] -m-4 overflow-hidden">
      {/* Top Header Bar - Updated to Specific Green Shade #85FF7A */}
      <div className="bg-[#85FF7A] border-b border-[#6de064] px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Store size={16} />
            <span className="text-[10px]">&gt;</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">POS TERMINAL</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">NEW SALE</span>
          </div>
          <div className="h-4 w-px bg-[#d1e1d4] mx-2"></div>
          <div className="flex items-center gap-2 bg-white text-[#15b031] px-3 py-1 rounded-full border border-[#dcfce7] shadow-sm">
            <div className="w-1.5 h-1.5 bg-[#15b031] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8 font-jakarta">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items by name or category..."
              className="w-full bg-white border border-[#d1e1d4] rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#0c831f]/20 focus:border-[#0c831f] transition-all outline-none shadow-sm"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
            />
          </div>
          <button
            className="p-2 text-gray-500 hover:text-[#0c831f] hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-[#d1e1d4]"
            onClick={() => fetchProducts()}
            title="Refresh Catalog"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Product Catalog - Left Side */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading && products.length === 0 ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-100 aspect-square animate-pulse"></div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                <Package size={64} />
                <p className="mt-4 font-black uppercase tracking-tighter">No items found</p>
              </div>
            ) : products.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white border-2 border-transparent hover:border-[#0c831f] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full ${product.stock <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="relative aspect-square bg-white p-2 flex items-center justify-center overflow-hidden">
                  {/* Category Badge */}
                  <div className="absolute top-0 left-0 bg-gray-100 text-gray-500 px-2 py-0.5 text-[9px] font-black uppercase rounded-br-lg z-10 transition-colors group-hover:bg-[#0c831f] group-hover:text-white">
                    {product.category || 'General'}
                  </div>
                  <img
                    src={product.image}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400/f8fafc/0c831f?text=' + encodeURIComponent(product.name.substring(0, 1));
                    }}
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-2 flex flex-col gap-1 flex-1 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-[#0c831f] transition-colors">
                    {product.name}
                  </p>

                  <div className="mt-0.5">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-base font-black text-gray-900">₹{product.price}</span>
                      <span className="text-[8px] text-gray-400 font-bold">/ {product.unitType?.substring(0, 3) || 'PC'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${product.stock > 10 ? 'bg-[#15b031]' : 'bg-rose-500'}`}></div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${product.stock > 10 ? 'text-[#15b031]' : 'text-rose-500'}`}>
                          {product.stock} {product.unitType?.substring(0, 2) || 'PC'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[#0c831f] text-[7px] font-black uppercase tracking-tighter">
                        <CheckCircle size={8} strokeWidth={3} />
                        SCALABLE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar - Right Side */}
        <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col shrink-0">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-[#0c831f]" />
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Cart</h4>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cart.length} Items</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em]">Cart is empty</p>
                <p className="mt-2 text-[10px] leading-relaxed">Add items to start a sale</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product} className="bg-gray-50 rounded-xl p-3 flex gap-3 group relative hover:bg-white border border-transparent hover:border-gray-100 transition-all hover:shadow-sm">
                  <div className="w-14 h-14 bg-white rounded-lg border border-gray-100 flex-shrink-0 p-1 overflow-hidden">
                    <img
                      src={item.image}
                      className="w-full h-full object-contain"
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100/f8fafc/0c831f?text=' + encodeURIComponent(item.name.substring(0, 1));
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-tight line-clamp-1 mb-1">{item.name}</h5>
                      <button
                        onClick={() => setCart(cart.filter(c => c.product !== item.product))}
                        className="text-gray-300 hover:text-rose-500 transition-colors ml-2"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mb-2">1 PCS x ₹{item.price}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                        <button onClick={() => updateQuantity(item.product, -1)} className="px-2 hover:bg-gray-100 text-gray-500 transition-colors"><Minus size={10} /></button>
                        <span className="px-3 text-[11px] font-black text-gray-700 bg-white min-w-[30px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product, 1)} className="px-2 hover:bg-gray-100 text-gray-500 transition-colors"><Plus size={10} /></button>
                      </div>
                      <span className="text-xs font-black text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Billing Summary - Fixed Bottom */}
          <div className="bg-[#15b031] text-white p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[11px] font-bold text-white/80 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-white/80 uppercase tracking-widest">
                <span>Tax</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-white/20 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Total Amount</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>
                <div className="text-white/50">
                  <IndianRupee size={24} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className={`w-full py-4 rounded-lg font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${cart.length === 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-white text-gray-900 hover:bg-[#15b031] hover:text-white active:scale-[0.98]'}`}
            >
              {isProcessing ? 'Processing...' : (
                <>Pay Now <Trash2 size={16} className="rotate-180 transform" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        `}} />
    </div>
  );
};

export default VendorPOS;
