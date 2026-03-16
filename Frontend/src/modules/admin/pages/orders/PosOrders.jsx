import React, { useState, useEffect } from 'react';
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
    Banknote,
    CheckCircle,
    ArrowLeft,
    Zap,
    Printer,
    Link as LinkIcon
} from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
    createPOSOrder,
    searchProductsPOS,
    getPOSAuthToken
} from '../../api/posApi';
import { getAdminSettings } from '../../api/settingApi';

const PosOrders = ({ storeId, storeType = 'branch', onExit }) => {
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

    const { t } = useTranslation();

    const fetchProducts = async (query = '') => {
        setLoading(true);
        try {
            const data = await searchProductsPOS(query, { storeId, storeType });
            // Normalize products to have a 'price' and 'stock' property for the UI
            const normalized = (data.products || []).map(p => ({
                ...p,
                price: p.basePrice || 0,
                // Use availableStock from backend if it exists (from store-aware logic), else use total stock or specific branch stock
                stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0)
            }));
            setProducts(normalized);
        } catch (error) {
            console.error('POS fetch error:', error);
            toast.error(t('orders.pos.alerts.load_products_failed'));
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return toast.error(t('orders.pos.alerts.out_of_stock'));

        const existing = cart.find(item => item.product === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) return toast.warning(t('orders.pos.alerts.exceeds_stock'));
            setCart(cart.map(item =>
                item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, {
                product: product._id,
                name: product.name,
                price: product.price || product.basePrice || 0,
                image: product.image,
                quantity: 1,
                stock: product.stock
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
                if (newQty > item.stock) {
                    toast.warning(t('orders.pos.alerts.exceeds_stock_toast'));
                    return item;
                }
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
        if (cart.length === 0) return toast.warning(t('orders.pos.alerts.cart_empty'));

        const { value: confirmResult } = await Swal.fire({
            title: t('orders.pos.alerts.complete_order_confirm'),
            text: t('orders.pos.alerts.complete_order_text', { amount: totalAmount.toFixed(2), method: paymentMethod.toUpperCase() }),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#f43f5e',
            confirmButtonText: t('orders.pos.alerts.complete_order_btn')
        });

        if (!confirmResult) return;

        setIsProcessing(true);
        try {
            const payload = {
                items: cart,
                customerDetails,
                storeId: storeId || (storeType === 'branch' ? settings?.branchId : null),
                storeType
            };

            await createPOSOrder(payload);

            await Swal.fire({
                title: t('orders.pos.alerts.success_title'),
                text: t('orders.pos.alerts.success_msg'),
                icon: 'success',
                timer: 3000,
                showConfirmButton: true
            });

            // Reset cart
            setCart([]);
            setCustomerDetails({ name: '', email: '', phone: '' });
            fetchProducts(); // Refresh stock in UI
        } catch (error) {
            toast.error(error.response?.data?.message || t('orders.pos.alerts.order_failed'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-50 overflow-hidden font-sans border-t border-gray-100">
            <header className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-violet-600 rounded-lg text-white">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-gray-800 leading-none">{t('orders.pos.terminal.title')}</h1>
                        <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{t('orders.pos.store_id')}: {storeId || 'Self'}</p>
                    </div>
                </div>

                <div className="flex-1 max-w-sm mx-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                    <input
                        type="text"
                        placeholder={t('orders.pos.search_placeholder')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 focus:ring-1 focus:ring-violet-500 transition-all font-bold text-[10px]"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            fetchProducts(e.target.value);
                        }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-colors uppercase">
                        <Printer size={12} /> {t('orders.pos.terminal.print')}
                    </button>
                    <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 font-black text-xs">
                        {cart.length}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                        {loading && products.length === 0 ? (
                            Array(12).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-48 border border-gray-100"></div>
                            ))
                        ) : (
                            products.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className={`bg-white rounded-xl p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 active:scale-95 group relative ${product.stock <= 0 ? 'opacity-50 grayscale' : 'hover:border-violet-200 border-transparent'}`}
                                >
                                    <div className="relative h-24 mb-2 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                                        <img
                                            src={product.image || 'https://placehold.co/150'}
                                            alt={product.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <span className="absolute top-1 right-1 bg-amber-500 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase">{t('orders.pos.terminal.low_stock')}</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-black text-gray-800 line-clamp-1 leading-tight mb-1">
                                        {product.name}
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-violet-600">₹{product.price}</span>
                                        </div>
                                        <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {product.stock}
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all bg-violet-600 text-white p-2 rounded-xl shadow-lg shadow-violet-200">
                                        <Plus size={18} strokeWidth={3} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20 relative">
                    <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="text-violet-600" size={18} />
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">{t('orders.pos.terminal.cart_preview')}</h2>
                            </div>
                            <button onClick={() => setCart([])} className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-1 rounded group hover:bg-red-100">
                                {t('orders.pos.terminal.reset')}
                            </button>
                        </div>

                        <div className="flex-1 space-y-2 mb-4">
                            {cart.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-gray-300">
                                    <ShoppingCart size={32} strokeWidth={1} />
                                    <p className="text-[10px] font-bold mt-2 uppercase">{t('orders.pos.terminal.empty')}</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product} className="flex items-center gap-2 p-2 rounded-xl border border-gray-50 bg-gray-50/30">
                                        <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-white p-1 border" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-bold text-gray-800 truncate uppercase">{item.name}</div>
                                            <div className="text-[10px] font-black text-violet-600">₹{item.price}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => updateQuantity(item.product, -1)} className="p-0.5 hover:bg-white rounded border border-gray-200">
                                                    <Minus size={10} />
                                                </button>
                                                <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product, 1)} className="p-0.5 hover:bg-white rounded border border-gray-200">
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-[11px] font-black">₹{item.price * item.quantity}</div>
                                            <button onClick={() => removeFromCart(item.product)} className="text-gray-300 hover:text-red-500 mt-1">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-2xl mb-4 space-y-2 border border-blue-50">
                            <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <User size={10} fill="currentColor" /> {t('dashboard.details_label', { defaultValue: 'Details' })}
                            </h3>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={10} />
                                <input
                                    type="email"
                                    placeholder={t('orders.pos.customer.email_placeholder')}
                                    className="w-full bg-white border border-gray-100 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-100"
                                    value={customerDetails.email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={10} />
                                <input
                                    type="tel"
                                    placeholder={t('dashboard.customer_details_modal.phone_label', { defaultValue: 'Phone' })}
                                    className="w-full bg-white border border-gray-100 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-100"
                                    value={customerDetails.phone}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 mb-4 border-t pt-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-400 font-bold uppercase">{t('orders.pos.totals.subtotal')}</span>
                                <span className="text-gray-900 font-black">₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-400 font-bold uppercase">{t('orders.pos.totals.tax')} ({taxRate}%)</span>
                                <span className="text-gray-900 font-black">₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-xs font-black text-gray-800 uppercase">{t('orders.pos.terminal.payable')}</span>
                                <span className="text-xl font-black text-violet-600">₹{totalAmount.toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 mb-4">
                            <div
                                className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-[10px] font-black transition-all bg-violet-600 text-white border-violet-600`}
                            >
                                <Banknote size={14} /> {t('orders.pos.totals.cash_only')}
                            </div>
                        </div>

                        <button
                            disabled={isProcessing || cart.length === 0}
                            onClick={handleCompleteOrder}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-100 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? t('dashboard.processing_btn') : t('orders.pos.buttons.complete_sale')}
                        </button>
                    </div>
                </div>
            </div>


            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
                @media print {
                    header, .pos-billing-sidebar, .pos-billing-products { display: none; }
                }
            `}} />
        </div>
    );
};

export default PosOrders;
