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
  Monitor,
  User,
  Phone,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useVendor } from '../contexts/VendorContext';
import { createPOSOrder, searchProductsPOS } from '../../../common/api/posApi';
import { getPublicSettings } from '../../../common/api/settingApi';
import { getOrderDetails } from '../../../common/api/orderApi';

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

  const generateAndPrintReceipt = (order) => {
    const items = order.items || order.orderItems || [];
    const itemsHtml = items.length > 0 ? items.map(item => {
      const name = item.product?.name || item.name || 'Item';
      const qty = item.quantity || 1;
      const unitPrice = item.price || item.basePrice || item.product?.basePrice || 0;
      const total = unitPrice * qty;
      return `
        <tr>
          <td style="padding:5px 0;font-size:12px;border-bottom:1px dotted #ddd;vertical-align:top;">${name}</td>
          <td style="padding:5px 4px;font-size:12px;text-align:center;border-bottom:1px dotted #ddd;vertical-align:top;">${qty}</td>
          <td style="padding:5px 0;font-size:12px;text-align:right;border-bottom:1px dotted #ddd;white-space:nowrap;vertical-align:top;">₹${total.toLocaleString('en-IN')}</td>
        </tr>`;
    }).join('') : '<tr><td colspan="3" style="text-align:center;font-size:11px;padding:8px;">No items found</td></tr>';

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt - #${order.orderId || order._id?.slice(-8).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 16px; font-size: 13px; color: #000; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .divider-solid { border-top: 2px solid #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; text-align: left; border-bottom: 1px dashed #000; padding: 4px 0; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3) { text-align: right; }
    .total-row td { font-weight: bold; font-size: 14px; padding-top: 8px; }
    .store-name { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
    .tag { font-size: 10px; color: #444; margin-top: 2px; }
    @media print { @page { margin: 0; size: 80mm auto; } body { width: 100%; } }
  </style>
</head>
<body>
  <div class="center" style="margin-bottom:12px;">
    <div class="store-name">Saathigro</div>
    <div class="tag">Your Everyday Grocery Partner</div>
    <div class="tag">Indore, Madhya Pradesh</div>
    <div class="tag">support@Saathigro.com</div>
  </div>
  <div class="divider-solid"></div>
  <div style="margin:8px 0;">
    <div class="bold" style="font-size:13px;">POS ORDER #${order.orderId || order._id?.slice(-8).toUpperCase()}</div>
    <div class="tag">Date: ${new Date(order.createdAt).toLocaleString('en-IN')}</div>
    <div class="tag">Customer: ${order.posCustomer?.name || order.user?.name || 'Guest'}</div>
    ${order.posCustomer?.phone || order.user?.phone ? `<div class="tag">Phone: ${order.posCustomer?.phone || order.user?.phone}</div>` : ''}
  </div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th>ITEM</th>
        <th style="text-align:center;">QTY</th>
        <th style="text-align:right;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="divider"></div>
  <table>
    <tr><td style="font-size:12px;padding:2px 0;">Subtotal</td><td style="text-align:right;font-size:12px;">₹${order.paymentMethod === 'cash' ? Math.round(order.subTotal || order.totalAmount) : (order.subTotal || order.totalAmount).toFixed(2)}</td></tr>
    ${(order.taxAmount > 0) ? `<tr><td style="font-size:12px;padding:2px 0;">Tax</td><td style="text-align:right;font-size:12px;">+₹${order.paymentMethod === 'cash' ? Math.round(order.taxAmount) : order.taxAmount.toFixed(2)}</td></tr>` : ''}
    ${(order.discountAmount > 0) ? `<tr><td style="font-size:12px;padding:2px 0;">Discount</td><td style="text-align:right;font-size:12px;color:green;">-₹${order.paymentMethod === 'cash' ? Math.round(order.discountAmount) : order.discountAmount.toFixed(2)}</td></tr>` : ''}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right;">₹${order.paymentMethod === 'cash' ? Math.round(order.totalAmount) : order.totalAmount.toFixed(2)}</td></tr>
  </table>
  <div class="divider"></div>
  <div style="font-size:12px;margin:6px 0;">
    <table style="width: 100%;">
      <tr><td style="padding: 2px 0;">Payment Method:</td><td style="text-align: right;" class="bold">${(order.paymentMethod || 'Cash').toUpperCase()}</td></tr>
      <tr><td style="padding: 2px 0;">Payment Status:</td><td style="text-align: right; color: ${order.paymentStatus === 'paid' ? 'green' : 'orange'};" class="bold">${(order.paymentStatus || 'Paid').toUpperCase()}</td></tr>
      <tr><td style="padding: 2px 0;">Amount Paid:</td><td style="text-align: right;" class="bold">₹${order.paymentMethod === 'cash' ? Math.round(order.totalAmount) : order.totalAmount.toFixed(2)}</td></tr>
    </table>
  </div>
  <div class="divider-solid"></div>
  <div class="center" style="margin-top:12px;">
    <div style="font-size:11px;">Thank you for shopping with Saathigro!</div>
    <div style="font-size:10px;color:#555;margin-top:4px;">Visit us again • www.Saathigro.com</div>
    <div style="font-size:10px;color:#888;margin-top:10px;">*** This is a computer generated receipt ***</div>
  </div>
</body>
</html>`;
    const win = window.open('', '_blank', 'width=420,height=750');
    win.document.write(receiptHtml);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handlePrintReceipt = async (order) => {
    try {
      const fullOrder = await getOrderDetails(order._id);
      generateAndPrintReceipt(fullOrder);
    } catch {
      generateAndPrintReceipt(order);
    }
  };

  const handleCompleteOrder = async () => {
    if (cart.length === 0) return;
    if (customerDetails.phone && customerDetails.phone.length !== 10) {
      return toast.warning('Customer phone number must be exactly 10 digits');
    }
    const result = await Swal.fire({
      title: 'Complete Order?',
      text: 'Are you sure you want to process this order? Stock will be updated automatically.',
      showCancelButton: true,
      confirmButtonColor: '#0c831f',
      confirmButtonText: 'Yes, Place Order',
      customClass: { popup: 'rounded-3xl' }
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      const created = await createPOSOrder({ items: cart, customerDetails, paymentMethod, storeId, storeType }, vendor?.token);
      const placedOrder = created?.order || created;

      setCart([]);
      setCustomerDetails({ name: '', email: '', phone: '' });
      fetchProducts();

      // Success popup with print option
      const { value: action } = await Swal.fire({
        title: '<span style="color:#16a34a;font-size:20px;">✓ Order Placed!</span>',
        html: `
          <div style="color:#64748b;font-size:13px;margin-bottom:4px;">
            Order <strong style="color:#1e293b">#${placedOrder?.orderId || placedOrder?._id?.slice(-8).toUpperCase() || ''}</strong> placed successfully.
          </div>
          <div style="font-size:22px;font-weight:900;color:#1e293b;margin:8px 0;">₹${paymentMethod === 'cash' ? Math.round(totalAmount) : totalAmount.toFixed(2)}</div>
          <div style="color:#94a3b8;font-size:11px;">Would you like to print the bill?</div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#0c831f',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<span style="display:flex;align-items:center;gap:6px;">🖨️ Print Bill</span>',
        cancelButtonText: 'New Order',
        customClass: { popup: 'rounded-3xl' },
      });

      if (action && placedOrder) {
        handlePrintReceipt(placedOrder);
      }
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
                className="search-input-plain flex-1 min-w-0 text-sm font-medium text-gray-900 placeholder:text-gray-500"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); fetchProducts(e.target.value); }}
              />
            </div>
        </div>

        <div className="flex items-center gap-2">
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

             <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10 shrink-0">
              {/* Customer Form */}
              <div className="bg-gray-50/50 p-2.5 rounded-xl mb-2 border border-gray-100 shadow-sm">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 opacity-90">
                  <User size={10} className="text-gray-400" /> Walk-in Customer Details
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#0c831f] rounded-lg py-1.5 pl-7 pr-2 text-[11px] focus:ring-1 focus:ring-[#0c831f] transition-all font-semibold text-gray-700 placeholder-gray-400"
                      value={customerDetails.name}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, '');
                        setCustomerDetails({ ...customerDetails, name: cleanValue });
                      }}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                    <input
                      type="tel"
                      placeholder="Mobile (10 digits)"
                      className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#0c831f] rounded-lg py-1.5 pl-7 pr-2 text-[11px] focus:ring-1 focus:ring-[#0c831f] transition-all font-semibold text-gray-700 placeholder-gray-400"
                      value={customerDetails.phone}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, '');
                        if (cleanValue.length <= 10) {
                          setCustomerDetails({ ...customerDetails, phone: cleanValue });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50/50 p-2.5 rounded-xl mb-2 border border-gray-100 shadow-sm">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 opacity-90">
                  <Zap size={10} className="text-gray-400" /> Payment Method
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${paymentMethod === 'cash' ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                  >
                    Cash
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('online')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${paymentMethod === 'online' ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                  >
                    Online / UPI
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-2.5">
                 <div className="flex justify-between text-[11px] font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{subTotal}</span>
                 </div>
                 <div className="flex justify-between text-[11px] font-medium text-gray-500">
                    <span>Tax ({taxRate}%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-end pt-2 border-t border-gray-100 mt-1">
                    <span className="text-xs font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-[#0c831f]">₹{paymentMethod === 'cash' ? Math.round(totalAmount) : totalAmount.toFixed(2)}</span>
                 </div>
              </div>
              <button 
                disabled={isProcessing || cart.length === 0}
                onClick={handleCompleteOrder}
                className={`w-full py-2.5 rounded-xl text-[13px] font-bold flex flex-col items-center justify-center transition-all shadow-sm ${cart.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0c831f] text-white hover:bg-[#0a6b19] active:scale-95'}`}
              >
                {isProcessing ? 'Processing Order...' : 'Place Order Now'}
                {cart.length > 0 && <span className="text-[9px] font-normal opacity-80 mt-0.5">₹{paymentMethod === 'cash' ? Math.round(totalAmount) : totalAmount.toFixed(2)} via {paymentMethod === 'cash' ? 'Cash' : 'Online'}</span>}
              </button>
           </div>
        </aside>
      </main>
    </div>
  );
};

export default VendorPOS;
