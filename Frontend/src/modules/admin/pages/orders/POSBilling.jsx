import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Mail,
  Phone,
  CreditCard,
  Banknote,
  CheckCircle,
  Package,
  ArrowLeft,
  Zap,
  Maximize2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { createPOSOrder, searchProductsPOS, getPOSAuthToken } from '../../api/posApi';
import { getAdminSettings } from '../../api/settingApi';

const POSBilling = ({ storeId, storeType = 'branch', onExit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod] = useState('cash'); // Only 'cash' allowed
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = getPOSAuthToken();
      if (!token) return;

      const data = await getAdminSettings(token);
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const data = await searchProductsPOS(query);
      setProducts(data.products || []);
    } catch (error) {
      // toast.error(t('orders.pos.alerts.load_products_failed'));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      setCart(cart.map(item =>
        item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        product: product._id,
        name: product.name,
        price: product.price || product.basePrice,
        image: product.image,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = settings?.defaultTaxRate || 0;
  const taxAmount = (subTotal * taxRate) / 100;
  const totalAmount = subTotal + taxAmount;

  const { t } = useTranslation();

  const handleCompleteOrder = async () => {
    if (cart.length === 0) return toast.warning(t('orders.pos.alerts.cart_empty'));
    if (customerDetails.phone && customerDetails.phone.length !== 10) {
      return toast.warning('Customer phone number must be exactly 10 digits');
    }

    setIsProcessing(true);
    try {
      const payload = {
        items: cart,
        customerDetails,
        paymentMethod,
        storeId,
        storeType
      };

      const res = await createPOSOrder(payload);

      Swal.fire({
        title: t('orders.pos.alerts.success_title'),
        text: t('orders.pos.alerts.success_msg'),
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });

      setCart([]);
      setCustomerDetails({ name: '', email: '', phone: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || t('orders.pos.alerts.order_failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Zap className="text-violet-600 fill-violet-600" size={24} />
            {t('orders.pos.title')} <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded ml-2">v2.0</span>
          </h1>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('orders.pos.search_placeholder')}
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
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('orders.pos.store_id')}</div>
            <div className="text-sm font-black text-gray-700">{storeId || 'BRANCH-01'}</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Product Grid */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading && cart.length === 0 ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-48"></div>
              ))
            ) : (
              products.map(product => (
                <div
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-transparent hover:border-violet-200 group relative"
                >
                  <img
                    src={product.image || 'https://placehold.co/200'}
                    alt={product.name}
                    className="w-full h-32 object-contain mb-4 rounded-xl"
                  />
                  <div className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-2">
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-violet-600">₹{product.price || product.basePrice}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${product.stock > 10 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t('orders.pos.stock')}: {product.stock}
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
        <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10">
          <div className="p-6 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <ShoppingCart className="text-violet-600" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">{t('orders.pos.billing.title')}</h2>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                {t('orders.pos.billing.item_count')}: {cart.length}
              </span>
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                  <ShoppingCart size={48} />
                  <p className="font-bold text-sm uppercase tracking-widest">{t('orders.pos.billing.empty_cart')}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product} className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
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
                      <button onClick={() => removeFromCart(item.product)} className="text-red-400 hover:text-red-600 mt-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Form */}
            <div className="bg-violet-50/30 p-3 rounded-2xl mb-4 border border-violet-100/60 shadow-sm shadow-violet-50/40">
              <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-90">
                <User size={12} className="fill-violet-100" /> {t('orders.pos.customer.walk_in')}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={13} />
                  <input
                    type="text"
                    placeholder={t('orders.pos.customer.name_placeholder')}
                    className="w-full bg-white border border-violet-100/80 hover:border-violet-200 focus:border-violet-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-violet-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
                    value={customerDetails.name}
                    onChange={(e) => {
                      const cleanValue = e.target.value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, ''); // keep only English/Hindi alphabets and spaces
                      setCustomerDetails({ ...customerDetails, name: cleanValue });
                    }}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={13} />
                  <input
                    type="tel"
                    placeholder={t('orders.pos.customer.mobile_placeholder')}
                    className="w-full bg-white border border-violet-100/80 hover:border-violet-200 focus:border-violet-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-violet-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
                    value={customerDetails.phone}
                    onChange={(e) => {
                      const cleanValue = e.target.value.replace(/\D/g, ''); // keep only numbers
                      if (cleanValue.length <= 10) {
                        setCustomerDetails({ ...customerDetails, phone: cleanValue });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t('orders.pos.totals.subtotal')}</span>
                <span className="text-gray-800 font-bold">₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t('orders.pos.totals.tax')} ({taxRate}%)</span>
                <span className="text-gray-800 font-bold">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 mt-1 border-t-2 border-dashed border-gray-200">
                <span className="text-lg font-black text-gray-900 leading-none uppercase">{t('orders.pos.totals.total')}</span>
                <span className="text-2xl font-black text-violet-700">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              onClick={handleCompleteOrder}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-violet-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle size={20} />
                  {t('orders.pos.buttons.complete')}
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
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
    </div>
  );
};

export default POSBilling;
