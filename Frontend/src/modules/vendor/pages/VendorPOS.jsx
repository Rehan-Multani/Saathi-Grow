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
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-gray-50 border border-gray-100 rounded-[2.5rem] overflow-y-auto custom-scrollbar shadow-2xl shadow-gray-300/20">
      {/* Premium Header */}
      <div className="bg-[#0c831f] px-8 py-5 flex items-center justify-between text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-10 -mb-20 blur-2xl"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
            <Store size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight leading-tight">POS Terminal</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{vendor?.storeName || 'Active Store'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-12 relative group z-10 hidden md:block">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-white/40 group-focus-within:text-white transition-colors" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products by name or scan barcode..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-semibold placeholder:text-white/30 outline-none focus:ring-4 focus:ring-white/10 focus:bg-white/20 transition-all shadow-inner"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
          />
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="hidden lg:flex items-center gap-4 bg-black/10 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none">Items</span>
              <span className="text-sm font-black mt-0.5">{cart.length}</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none">Total</span>
              <span className="text-sm font-black mt-0.5">₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>

          <button className="px-6 py-3 bg-white text-[#0c831f] rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-black/10 transition-all active:scale-95 flex items-center gap-2">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-visible bg-white/50 backdrop-blur-sm">
        {/* Product Catalog Grid */}
        <div className="flex-1 p-6">
          {searchTerm && (
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Search Results for "{searchTerm}"</h3>
              <button onClick={() => { setSearchTerm(''); fetchProducts(''); }} className="text-[10px] font-black text-[#0c831f] uppercase tracking-widest hover:underline">Clear Search</button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading && products.length === 0 ? (
              Array(12).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-white rounded-[2rem] animate-pulse border border-gray-100 shadow-sm"></div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-300">
                <Package size={64} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-sm font-black uppercase tracking-widest">No Products Found</p>
              </div>
            ) : products.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-[#0c831f]/10 transition-all duration-500 border border-gray-50 hover:border-[#0c831f]/20 cursor-pointer group relative overflow-hidden ${product.stock <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
              >
                {/* Plus Overlay */}
                <div className="absolute inset-0 bg-[#0c831f]/0 group-hover:bg-[#0c831f]/5 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#0c831f] text-white rounded-full flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 shadow-xl">
                    <Plus size={20} strokeWidth={3} />
                  </div>
                </div>

                <div className="aspect-square mb-4 bg-gray-50/50 rounded-2xl flex items-center justify-center p-4 relative group-hover:scale-105 transition-transform duration-700 ease-out overflow-hidden">
                  <img src={product.image} className="max-w-full max-h-full object-contain" alt={product.name} />
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 right-2 bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Low Stock</div>
                  )}
                </div>

                <div className="relative z-10">
                  <h5 className="text-[6px] font-black text-gray-800 mb-2 uppercase tracking-tight leading-tight min-h-[2.4em]">{product.name}</h5>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block leading-none mb-1">Price</span>
                      <span className="text-lg font-black text-[#0c831f]">₹{product.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-gray-400 block leading-none mb-1">In Stock</span>
                      <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg uppercase">{product.stock} {product.unitType?.substring(0, 2) || 'Pc'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Billing Sidebar */}
        <div className="w-[450px] bg-white border-l border-gray-100 flex flex-col relative z-20 shadow-[-20px_0_60px_rgba(0,0,0,0.03)]">
          <div className="p-8 flex flex-col h-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0c831f]/10 rounded-xl text-[#0c831f]">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h5 className="text-lg font-black text-gray-900 uppercase tracking-tight">Order Cart</h5>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cart.length} items selected</p>
                </div>
              </div>
              <button
                onClick={() => setCart([])}
                className="text-[10px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
              >
                Reset
              </button>
            </div>

            {/* Cart List */}
            <div className="flex-1 space-y-3 mb-8">
              {cart.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center relative p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-[3rem]"></div>
                  <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 animate-bounce transition-all duration-1000" style={{ animationDuration: '3s' }}>
                      <ShoppingCart size={40} strokeWidth={1.5} className="text-gray-200" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0c831f]/10 rounded-2xl flex items-center justify-center text-[#0c831f] border border-[#0c831f]/20">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <h6 className="relative text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Cart is Empty</h6>
                  <p className="relative text-[10px] text-gray-300 mt-2 max-w-[150px] leading-relaxed">Add some amazing products to start the checkout</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product} className="group relative flex gap-4 p-4 rounded-[2.2rem] border border-gray-100 bg-white hover:border-[#0c831f]/20 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden">
                      {/* Interaction Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0c831f]/0 via-[#0c831f]/0 to-[#0c831f]/2 transition-all duration-500 group-hover:via-[#0c831f]/1"></div>

                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative z-10 p-2 group-hover:scale-110 transition-transform duration-500">
                        <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                      </div>

                      <div className="flex-1 min-w-0 relative z-10 flex flex-col justify-center">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-[10px] font-black text-gray-800 leading-tight uppercase tracking-tight group-hover:text-[#0c831f] transition-colors">{item.name}</p>
                          <span className="text-sm font-black text-gray-900 ml-3">₹{item.price * item.quantity}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-gray-100/80 rounded-2xl p-1 gap-1 border border-gray-200/50">
                            <button
                              onClick={() => updateQuantity(item.product, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-500 rounded-xl shadow-sm transition-all text-gray-400 active:scale-90"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="text-xs font-black min-w-[24px] text-center text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-[#0c831f] hover:text-white rounded-xl shadow-sm transition-all text-[#0c831f] active:scale-90"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-gray-300 tracking-widest uppercase">₹{item.price} EA</span>
                            <div className="w-[1px] h-3 bg-gray-100"></div>
                            <button
                              onClick={() => setCart(cart.filter(c => c.product !== item.product))}
                              className="text-gray-300 hover:text-rose-500 transition-all hover:rotate-12 active:scale-90"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Profile Section */}
            <div className="bg-gray-50/50 p-7 rounded-[2.8rem] space-y-5 mb-8 border border-gray-100 relative group overflow-hidden">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#0c831f]/5 to-transparent"></div>

              <div className="flex items-center justify-between mb-2 relative z-10">
                <h6 className="text-[10px] font-black text-[#0c831f] uppercase tracking-[0.3em] flex items-center gap-2.5">
                  <div className="w-1.5 h-4 bg-[#0c831f] rounded-full"></div>
                  Customer Information
                </h6>
                <div className="px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Guest Session</span>
                </div>
              </div>

              <div className="grid gap-4 relative z-10">
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-focus-within/input:bg-[#0c831f]/10 group-focus-within/input:text-[#0c831f] transition-all">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-4 pl-14 pr-6 text-xs font-bold text-gray-800 shadow-sm focus:ring-8 focus:ring-[#0c831f]/5 focus:border-[#0c831f]/30 outline-none transition-all placeholder:text-gray-300"
                    value={customerDetails.email}
                    onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  />
                </div>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-focus-within/input:bg-[#0c831f]/10 group-focus-within/input:text-[#0c831f] transition-all">
                    <Phone size={14} />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 Mobile Number"
                    className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-4 pl-14 pr-6 text-xs font-bold text-gray-800 shadow-sm focus:ring-8 focus:ring-[#0c831f]/5 focus:border-[#0c831f]/30 outline-none transition-all placeholder:text-gray-300"
                    value={customerDetails.phone}
                    onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Final Calculation Section */}
            <div className="space-y-4 mb-8 px-2 border-t border-dashed border-gray-200 pt-8 mt-4">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                <span>SUBTOTAL</span>
                <span className="text-gray-900 font-black text-sm">₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                <span>TAX ({taxRate}%)</span>
                <span className="text-gray-900 font-black text-sm">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="mt-6 relative group cursor-pointer">
                {/* Visual Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0c831f] to-[#0a6b19] rounded-[2.2rem] blur-lg opacity-20 group-hover:opacity-30 transition-all duration-700"></div>

                <div className="relative bg-[#0c831f] bg-gradient-to-br from-[#0c831f] to-[#0a6b19] py-3 px-6 rounded-[2.2rem] text-white flex justify-between items-center shadow-xl overflow-hidden border border-white/10">
                  {/* Subtle Pattern Overlay */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl -mr-14 -mt-14"></div>

                  <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-1 h-1 bg-green-300 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70">Payable Amount</span>
                    </div>
                    <span className="text-3xl font-black tracking-tightest leading-none">₹{totalAmount.toFixed(0)}</span>
                  </div>

                  <div className="w-12 h-12 bg-white/10 rounded-[1.5rem] backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <Banknote size={24} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Payment Selector */}
            <div className="p-1 bg-gray-100/50 rounded-[2.5rem] flex gap-1 mb-8 border border-gray-100 shadow-inner">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-3 rounded-[1.8rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-all duration-500 relative overflow-hidden ${paymentMethod === 'cash' ? 'bg-gray-900 text-white shadow-2xl shadow-black/20' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  <Banknote size={15} strokeWidth={paymentMethod === 'cash' ? 2 : 1.5} />
                  <span className="tracking-[0.2em] uppercase">CASH</span>
                </div>
                {paymentMethod === 'cash' && <div className="absolute bottom-2 w-1 h-1 bg-green-400 rounded-full"></div>}
              </button>

              <button
                onClick={() => setPaymentMethod('online')}
                className={`flex-1 py-3 rounded-[1.8rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black transition-all duration-500 relative overflow-hidden ${paymentMethod === 'online' ? 'bg-gray-900 text-white shadow-2xl shadow-black/20' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  <QrCode size={22} strokeWidth={paymentMethod === 'online' ? 2 : 1.5} />
                  <span className="tracking-[0.2em] uppercase">ONLINE</span>
                </div>
                {paymentMethod === 'online' && <div className="absolute bottom-2 w-1 h-1 bg-green-400 rounded-full"></div>}
              </button>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all duration-500 relative overflow-hidden group/btn ${cart.length === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-tr from-[#0c831f] to-[#10b981] text-white shadow-[#0c831f]/25 hover:shadow-[#0c831f]/40 hover:-translate-y-0.5'
                }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Finalizing...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-4">
                  Confirm Transaction
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${cart.length === 0 ? 'bg-gray-200 border-gray-200' : 'bg-white/10 border-white/10 group-hover:bg-white group-hover:text-[#0c831f]'}`}>
                    <CheckCircle size={18} />
                  </div>
                </span>
              )}
              {/* Shine effect */}
              {cart.length > 0 && (
                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] group-hover/btn:left-[150%] transition-all duration-1000"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QR Modal with Premium Enhancement */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered className="pos-qr-modal">
        <div className="bg-white/90 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/50">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0c831f] via-[#22c55e] to-[#10b981]"></div>

          <Modal.Header closeButton className="border-0 p-10 pb-0">
            <Modal.Title className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0c831f] mb-1">Secure Checkout</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">Payment Authorization</span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-12 text-center">
            <div className="inline-block relative mb-12">
              <div className="absolute -inset-10 bg-gradient-to-tr from-[#0c831f]/20 via-[#0c831f]/10 to-transparent blur-3xl rounded-full"></div>
              <div className="bg-white p-10 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border border-gray-100 relative z-10 group cursor-pointer hover:scale-105 transition-transform duration-700">
                <QRCodeSVG value={paymentLink} size={240} fgColor="#111827" includeMargin={true} level="H" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-gray-50">
                  <div className="w-10 h-10 bg-[#0c831f] rounded-xl flex items-center justify-center text-white">
                    <QrCode size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-12">
              <div className="flex flex-col items-center">
                <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Amount Due</span>
                <div className="flex items-start">
                  <span className="text-2xl font-black text-gray-300 mt-2 mr-1">₹</span>
                  <h3 className="text-7xl font-black text-gray-900 tracking-tightest leading-none">{totalAmount.toFixed(0)}</h3>
                </div>
              </div>
              <p className="text-[9px] text-[#0c831f] font-black uppercase tracking-[0.6em] pt-4 opacity-50 flex items-center justify-center gap-3">
                <div className="w-1 h-1 bg-[#0c831f] rounded-full"></div>
                UPI DYNAMIC SECURE QR
                <div className="w-1 h-1 bg-[#0c831f] rounded-full"></div>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setShowQRModal(false); handleCompleteOrder(); }}
                className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-black transition-all flex items-center justify-center gap-4 group/modal-btn"
              >
                Verify & Confirm
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover/modal-btn:bg-[#0c831f] transition-colors">
                  <CheckCircle size={16} />
                </div>
              </button>

              <button
                onClick={() => setShowQRModal(false)}
                className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors"
              >
                Cancel Transaction
              </button>
            </div>
          </Modal.Body>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .pos-qr-modal .modal-content { background: transparent; border: none; }
                @keyframes float {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
            `}} />
    </div>
  );
};

export default VendorPOS;
