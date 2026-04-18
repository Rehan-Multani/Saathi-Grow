import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Printer,
  Zap,
  RotateCcw,
  Monitor
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
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Out of stock');
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) return toast.warning('Maximum stock limit reached');
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
      title: 'Complete Order?',
      text: 'Are you sure you want to process this order? Stock will be updated automatically.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0c831f',
      confirmButtonText: 'Yes, Place Order',
      customClass: { popup: 'rounded-3xl' }
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, vendor?.token);
      toast.success('Order placed successfully!');
      setCart([]); setCustomerDetails({ name: '', email: '', phone: '' }); fetchProducts();
    } catch (error) {
      toast.error('Failed to place order');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 -my-4 -mx-4 md:m-0 md:h-[calc(100vh-64px)]">
      {/* Top Header Bar */}
      <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10 w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Monitor size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">POS Billing</h1>
            <p className="text-xs text-gray-500 font-medium">Create new orders directly</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 lg:mx-12">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 h-11 focus-within:bg-white focus-within:border-[#0c831f] transition-colors">
              <Search className="text-gray-400 shrink-0" size={16} />
              <input 
                type="text" 
                placeholder="Search products by name or SKU..."
                className="flex-1 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
              />
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => fetchProducts(searchTerm)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white" title="Refresh products">
                <RotateCcw size={18} />
            </button>
            <button onClick={() => window.print()} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white" title="Print">
                <Printer size={18} />
            </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Products Catalog */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {loading && products.length === 0 ? (
               Array(8).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 animate-pulse"></div>)
             ) : products.length === 0 ? (
               <div className="col-span-full py-20 text-center text-gray-400 font-medium text-sm">No products found</div>
             ) : products.map(product => (
               <div 
                 key={product._id} 
                 onClick={() => addToCart(product)} 
                 className={`bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all hover:border-[#0c831f]/30 flex flex-col ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
               >
                 <div className="relative aspect-[4/3] bg-gray-50 p-4 shrink-0 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                      alt={product.name}
                      onError={(e) => e.target.src = 'https://placehold.co/400x400/f8fafc/0c831f?text='+product.name.charAt(0)}
                    />
                    {product.stock <= 0 && <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]"><span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">OUT OF STOCK</span></div>}
                 </div>
                 <div className="p-3 border-t border-gray-50 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 font-medium bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100 self-start mb-auto">{product.category}</p>
                    
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-gray-100">
                       <span className="text-sm font-bold text-[#0c831f]">₹{product.price}</span>
                       <span className="text-[10px] font-bold text-gray-500">{product.stock} left</span>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* Cart Sidebar */}
        <aside className="w-[320px] md:w-[380px] bg-white border-l border-gray-100 flex flex-col shrink-0 right-0 top-0 bottom-0 absolute md:relative transform transition-transform z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.05)] md:shadow-none translate-x-full md:translate-x-0">
           <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <ShoppingCart size={18} className="text-gray-600" />
              <h4 className="text-sm font-bold text-gray-900">Current Order</h4>
              <span className="ml-auto bg-[#0c831f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cart.length} items</span>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
              {cart.map(item => (
                <div key={item.product} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative pr-8">
                   <button onClick={() => setCart(cart.filter(c => c.product !== item.product))} className="absolute right-3 top-3 text-gray-300 hover:text-red-500 transition-colors">
                       <Trash2 size={14} />
                   </button>
                   
                   <div className="w-12 h-12 bg-gray-50 rounded-lg shrink-0 p-1 border border-gray-100">
                      <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" onError={(e) => e.target.src='https://placehold.co/100x100/f8fafc/0c831f?text='+item.name.charAt(0)} />
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col">
                      <h5 className="text-[11px] font-bold text-gray-900 leading-tight pr-4 truncate mb-0.5">{item.name}</h5>
                      <p className="text-[10px] text-gray-500 font-medium">₹{item.price} each</p>
                      
                      <div className="flex justify-between items-center mt-auto pt-2">
                         <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md h-7 overflow-hidden">
                            <button onClick={() => updateQuantity(item.product, -1)} className="w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"><Minus size={12} /></button>
                            <span className="min-w-[24px] text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product, 1)} className="w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"><Plus size={12} /></button>
                         </div>
                         <span className="text-xs font-bold text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                   </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                       <ShoppingCart size={24} className="text-gray-300" />
                   </div>
                   <p className="text-sm font-medium">Your cart is empty</p>
                   <p className="text-[10px] mt-1">Select products to begin</p>
                </div>
              )}
           </div>

           <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
              <div className="space-y-2 mb-4">
                 <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{subTotal}</span>
                 </div>
                 <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Tax ({taxRate}%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-1">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-[#0c831f]">₹{totalAmount.toFixed(0)}</span>
                 </div>
              </div>
              <button 
                disabled={isProcessing || cart.length === 0}
                onClick={handleCompleteOrder}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex flex-col items-center justify-center transition-all shadow-sm ${cart.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0c831f] text-white hover:bg-[#0a6b19] active:scale-95'}`}
              >
                {isProcessing ? 'Processing Order...' : 'Place Order Now'}
                {cart.length > 0 && <span className="text-[10px] font-normal opacity-80 mt-0.5">₹{totalAmount.toFixed(0)} via Cash</span>}
              </button>
           </div>
        </aside>
      </main>
    </div>
  );
};

export default VendorPOS;
