import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ShoppingCart, Trash2, Plus, Minus, User,
  Phone, Banknote, Printer, Package, ShieldCheck,
  CreditCard, UserPlus, ArrowRight, Zap, X, ChevronRight,
  History, Eye, ChevronLeft, Store, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import { createPOSOrder, searchProductsPOS } from '../../../common/api/posApi';
import { getPublicSettings } from '../../../common/api/settingApi';
import { getAllOrdersAdmin, getOrderDetails } from '../../../common/api/orderApi';

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

  // Tab & History state
  const [activeTab, setActiveTab] = useState('billing'); // 'billing' | 'history'
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({ total: 0, totalPages: 1 });
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => { if (storeId) fetchProducts(); }, [storeId]);

  const fetchSettings = async () => {
    try { setSettings(await getPublicSettings()); } catch {}
  };

  const fetchProducts = async (query = '') => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await searchProductsPOS(query.trim(), { storeId, storeType }, managerUser?.token);
      setProducts((data.products || []).map(p => ({
        ...p,
        price: p.basePrice || 0,
        stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0)
      })));
    } catch { toast.error('Inventory fetch failed'); }
    finally { setLoading(false); }
  };

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const data = await getAllOrdersAdmin({ page, limit: 10, orderSource: 'pos' });
      setHistoryOrders(data.orders || []);
      setHistoryPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch { toast.error('Failed to load POS history'); }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory(historyPage);
  }, [activeTab, historyPage, fetchHistory]);

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
    <tr><td style="font-size:12px;padding:2px 0;">Subtotal</td><td style="text-align:right;font-size:12px;">₹${(order.subtotal || order.totalAmount)?.toLocaleString('en-IN')}</td></tr>
    ${(order.discountAmount > 0) ? `<tr><td style="font-size:12px;padding:2px 0;">Discount</td><td style="text-align:right;font-size:12px;color:green;">-₹${order.discountAmount?.toLocaleString('en-IN')}</td></tr>` : ''}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right;">₹${order.totalAmount?.toLocaleString('en-IN')}</td></tr>
  </table>
  <div class="divider"></div>
  <div style="font-size:12px;margin:6px 0;">
    <div>Payment: <span class="bold">${(order.paymentMethod || 'Cash').toUpperCase()}</span></div>
    <div>Status: <span class="bold" style="color:${order.paymentStatus === 'paid' ? 'green' : 'orange'}">${(order.paymentStatus || 'Paid').toUpperCase()}</span></div>
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
    toast.info('Preparing receipt...', { autoClose: 1500 });
    try {
      const fullOrder = await getOrderDetails(order._id);
      generateAndPrintReceipt(fullOrder);
    } catch {
      generateAndPrintReceipt(order);
    }
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
    if (customerDetails.phone && customerDetails.phone.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    const result = await Swal.fire({
      title: 'Confirm Payment',
      html: `<div style="font-size:14px;color:#64748b">Total: <strong style="font-size:22px;color:#1e293b">₹${totalAmount.toFixed(2)}</strong></div>`,
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Confirm & Pay',
      cancelButtonText: 'Cancel',
      borderRadius: '1rem',
    });
    if (!result.isConfirmed) return;
    setIsProcessing(true);
    try {
      const created = await createPOSOrder({ items: cart, customerDetails, storeId, storeType }, managerUser?.token);
      const placedOrder = created?.order || created;
      setLastOrder(placedOrder);
      setCart([]);
      setCustomerDetails({ name: '', phone: '' });
      fetchProducts();

      // Success popup with print option
      const { value: action } = await Swal.fire({
        title: '<span style="color:#16a34a;font-size:20px;">✓ Payment Successful!</span>',
        html: `
          <div style="color:#64748b;font-size:13px;margin-bottom:4px;">
            Order <strong style="color:#1e293b">#${placedOrder?.orderId || placedOrder?._id?.slice(-8).toUpperCase() || ''}</strong> placed successfully.
          </div>
          <div style="font-size:22px;font-weight:900;color:#1e293b;margin:8px 0;">₹${totalAmount.toFixed(2)}</div>
          <div style="color:#94a3b8;font-size:11px;">Would you like to print the bill?</div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<span style="display:flex;align-items:center;gap:6px;">🖨️ Print Bill</span>',
        cancelButtonText: 'New Order',
        reverseButtons: false,
        customClass: { popup: 'rounded-2xl' },
      });

      if (action) {
        generateAndPrintReceipt(placedOrder);
      }
    } catch { toast.error('Order failed'); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)]">
      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 bg-white border-b border-slate-200">
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-t-xl border-b-2 transition-all ${activeTab === 'billing' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Zap size={13} /> POS Billing
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-t-xl border-b-2 transition-all ${activeTab === 'history' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <History size={13} /> POS History
        </button>
      </div>

      {/* ── History Panel ─────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Amount</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="6" className="px-5 py-4"><div className="h-8 bg-slate-50 rounded w-full" /></td>
                      </tr>
                    ))
                  ) : historyOrders.length > 0 ? (
                    historyOrders.map(order => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            #{order.orderId || order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-bold text-slate-900">{order.posCustomer?.name || order.user?.name || 'Guest'}</div>
                          <div className="text-xs text-slate-400">{order.posCustomer?.phone || order.user?.phone || ''}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-600 flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handlePrintReceipt(order)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                              title="Print Bill"
                            >
                              <Printer size={13} /> Print Bill
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-20 text-center text-slate-300">
                        <Store size={40} strokeWidth={1.5} className="mx-auto" />
                        <p className="mt-3 text-sm font-bold text-slate-400">No POS orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!historyLoading && historyPagination.total > 0 && (
              <div className="bg-slate-50/50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{historyPagination.total} total orders</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"><ChevronLeft size={15} /></button>
                  <span className="text-xs font-bold text-slate-600">{historyPage} / {historyPagination.totalPages}</span>
                  <button onClick={() => setHistoryPage(p => Math.min(historyPagination.totalPages, p + 1))} disabled={historyPage === historyPagination.totalPages} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Billing Panel ─────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
    <div className="flex flex-1 bg-slate-100 overflow-hidden border border-slate-200 shadow-xl rounded-b-2xl">

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
              onChange={e => { const val = e.target.value.trimStart(); setSearchTerm(val); fetchProducts(val); }}
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); fetchProducts(''); }} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => lastOrder ? handlePrintReceipt(lastOrder) : toast.info('No recent order to print')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
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
                onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '') })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              <input
                type="tel" placeholder="Mobile number (10 digits)"
                maxLength={10}
                className={`w-full bg-white border rounded-lg py-2 pl-8 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none transition-all ${customerDetails.phone && customerDetails.phone.length !== 10 ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-blue-400'}`}
                value={customerDetails.phone}
                onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
              {customerDetails.phone && customerDetails.phone.length !== 10 && (
                <p className="text-[10px] text-red-500 font-semibold mt-1 pl-1">{customerDetails.phone.length}/10 digits</p>
              )}
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
      )}
    </div>
  );
};

export default ManagerPOS;
