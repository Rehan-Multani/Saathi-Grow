import { Download, Package, User, MapPin, CreditCard, Clock, X, Truck, Zap, CheckCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAvailablePartners, assignOrder, autoAssignOrder } from '../../api/adminDeliveryApi';
import { getOrderDetails } from '../../api/orderApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';

const OrderDetailsModal = ({ show, onHide, order, onOrderUpdate }) => {
    const { t } = useTranslation();
    const [availablePartners, setAvailablePartners] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [detailedOrderState, setDetailedOrderState] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    // Multi-context auth detection
    const adminAuth = useAdminAuth && useAdminAuth();
    const managerAuth = useStoreManagerAuth && useStoreManagerAuth();
    const staffAuth = useStaffAuth && useStaffAuth();
    const currentUser = adminAuth?.adminUser || managerAuth?.managerUser || staffAuth?.staffUser;
    const userRole = currentUser?.role;

    // Prefer detailedOrder if available, otherwise fallback to prop order
    const displayOrder = detailedOrderState || order;

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            fetchAvailablePartners();
            if (order?._id) {
                fetchFullOrderDetails();
            }
        } else {
            document.body.style.overflow = 'unset';
            setDetailedOrderState(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show, order?._id]);

    const fetchFullOrderDetails = async () => {
        try {
            setLoadingDetails(true);
            const data = await getOrderDetails(order._id);
            setDetailedOrderState(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error(t('dashboard.failed_to_load_order_details', { defaultValue: 'Could not fetch full order details' }));
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchAvailablePartners = async () => {
        try {
            const partners = await getAvailablePartners();
            setAvailablePartners(partners);
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const handleAutoAssign = async () => {
        setAssigning(true);
        try {
            const res = await autoAssignOrder(order._id);
            toast.success(res.message);
            if (onOrderUpdate) onOrderUpdate();
            onHide();
        } catch (error) {
            toast.error(error.response?.data?.message || t('dashboard.auto_assign_failed', { defaultValue: 'Auto-assignment failed' }));
        } finally {
            setAssigning(false);
        }
    };

    const handleManualAssign = async () => {
        if (!selectedPartner) return toast.warning(t('dashboard.order_details_modal.select_rider'));

        setAssigning(true);
        try {
            const res = await assignOrder(order._id, selectedPartner);
            toast.success(t('dashboard.status_updated_success'));
            if (onOrderUpdate) onOrderUpdate();
            onHide();
        } catch (error) {
            toast.error(error.response?.data?.message || t('dashboard.manual_assign_failed', { defaultValue: 'Manual assignment failed' }));
        } finally {
            setAssigning(false);
        }
    };

    if (!show || !order) return null;

    // Support both Backend and Mock structures
    const displayId = displayOrder.orderId || displayOrder._id;
    const displayCustomer = displayOrder.user?.name || displayOrder.posCustomer?.name || displayOrder.customer || 'Guest';
    const displayTotal = displayOrder.totalAmount !== undefined ? `₹${displayOrder.totalAmount}` : displayOrder.total;
    const displayDate = displayOrder.createdAt ? new Date(displayOrder.createdAt).toLocaleString() : displayOrder.date;
    const displayStatusString = displayOrder.status ? t(`dashboard.order_status.${displayOrder.status}`, { defaultValue: displayOrder.status.replace(/_/g, ' ') }) : t('dashboard.order_status.pending');
    const displayPayment = displayOrder.paymentMethod || displayOrder.payment || 'N/A';

    // Items handling
    const items = displayOrder.items && Array.isArray(displayOrder.items) && displayOrder.items.length > 0 && typeof displayOrder.items[0] === 'object'
        ? displayOrder.items
        : Array(typeof displayOrder.items === 'number' ? displayOrder.items : 1).fill(null).map((_, i) => ({
            product: { name: `Product Item ${i + 1}`, price: 0 },
            name: `Product Item ${i + 1}`,
            price: 0,
            quantity: 1,
            total: 0,
            image: `https://placehold.co/50`
        }));

    // Helper for status badge colors (Handles lowercase from backend)
    const getStatusColor = (status = '') => {
        const s = status.toLowerCase();
        switch (s) {
            case 'delivered':
            case 'returned':
                return 'bg-green-100 text-green-700';
            case 'pending': 
                return 'bg-amber-100 text-amber-700';
            case 'cancelled': 
                return 'bg-red-100 text-red-700';
            case 'confirmed':
            case 'preparing':
                return 'bg-blue-100 text-blue-700';
            case 'out_for_delivery':
                return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleDownloadInvoice = () => {
        const invoiceContent = `
            <html>
            <head>
                <title>Invoice #${displayId}</title>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .invoice-title { font-size: 32px; font-weight: bold; text-align: right; }
                    .section-title { font-size: 14px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 10px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    table { w-full; border-collapse: collapse; margin-bottom: 30px; width: 100%; }
                    th { text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #eee; font-size: 14px; }
                    td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
                    .text-right { text-align: right; }
                    .totals { width: 300px; margin-left: auto; }
                    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
                    .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
                    .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px; }
                    .product-cell { display: flex; align-items: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="company-name">SathiGro</div>
                        <div>123 Business Street, Tech City</div>
                        <div>support@sathigro.com</div>
                    </div>
                    <div>
                        <div class="invoice-title">INVOICE</div>
                        <div>#${displayId}</div>
                        <div>${t('dashboard.date')}: ${displayDate}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="section-title">${t('dashboard.order_details_modal.bill_to')}:</div>
                        <strong>${displayCustomer}</strong><br>
                        ${displayOrder.shippingAddress?.street || displayOrder.shippingAddress?.address || t('dashboard.order_details_modal.no_address')}<br>
                        ${displayOrder.shippingAddress?.city || ''} ${(displayOrder.shippingAddress?.state || '')} ${(displayOrder.shippingAddress?.zipCode || '')}
                    </div>
                    <div>
                        <div class="section-title">${t('dashboard.order_details_modal.payment_info')}:</div>
                        ${t('dashboard.status')}: ${t(`dashboard.order_status.${displayOrder.paymentStatus || 'pending'}`, { defaultValue: displayOrder.paymentStatus || 'pending' })}<br>
                        ${t('dashboard.payment_method')}: ${t(`dashboard.payment_methods.${displayOrder.paymentMethod}`, { defaultValue: displayOrder.paymentMethod })}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>${t('dashboard.order_details_modal.item_description')}</th>
                            <th class="text-right">${t('dashboard.order_details_modal.price_label')}</th>
                            <th class="text-right">${t('dashboard.order_details_modal.qty_label')}</th>
                            <th class="text-right">${t('dashboard.order_details_modal.total_label')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>
                                    <div class="product-cell">
                                        <img src="${item.product?.image || item.image || 'https://placehold.co/50'}" alt="${item.product?.name || item.name}" class="product-img" />
                                        <div>
                                            <strong>${item.product?.name || item.name}</strong><br>
                                            <span style="font-size: 12px; color: #666;">${t('dashboard.order_details_modal.variation_standard')}</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-right">₹${item.price || 0}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">₹${(item.price || 0) * item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>${t('dashboard.order_details_modal.subtotal')}:</span>
                        <span>₹${displayOrder.subTotal || 0}</span>
                    </div>
                    <div class="total-row">
                        <span>${t('dashboard.order_details_modal.tax')}:</span>
                        <span>₹${displayOrder.taxAmount || 0}</span>
                    </div>
                    <div class="total-row">
                        <span>${t('dashboard.order_details_modal.delivery_fee')}:</span>
                        <span>₹${displayOrder.deliveryFee || 0}</span>
                    </div>
                    <div class="total-row">
                        <span>${t('dashboard.order_details_modal.handling_fee')}:</span>
                        <span>₹${displayOrder.handlingFee || 0}</span>
                    </div>
                    ${displayOrder.discountAmount > 0 ? `
                    <div class="total-row" style="color: #059669; font-weight: bold;">
                        <span>${t('dashboard.order_details_modal.promo_discount')} (${displayOrder.promoCode || 'PROMO'}):</span>
                        <span>-₹${displayOrder.discountAmount}</span>
                    </div>
                    ` : ''}
                    <div class="total-row grand-total">
                        <span>${t('dashboard.order_details_modal.grand_total')}:</span>
                        <span>₹${displayTotal}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>${t('dashboard.order_details_modal.thank_you')}</p>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onHide}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-3xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 m-4">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h5 className="text-xl font-bold text-gray-800">
                        {t('dashboard.order_details_modal.title')}: <span className="text-blue-600">{displayId}</span>
                    </h5>
                    <button
                        onClick={onHide}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                                <Package size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                            </div>
                            <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Order Intelligence...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(displayOrder.status || 'Pending')}`}>
                                {displayStatusString}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 flex items-center">
                                <Clock size={14} className="mr-1.5" /> {displayDate}
                            </span>
                            {displayOrder.deliverySlot ? (
                                <span className="px-3 py-1.5 rounded-full text-sm font-black bg-violet-600 text-white flex items-center shadow-lg shadow-violet-500/20">
                                    <Truck size={14} className="mr-1.5" /> {t('dashboard.delivery_slot')}: {displayOrder.deliverySlot}
                                </span>
                            ) : displayOrder.isImmediate && (
                                <span className="px-3 py-1.5 rounded-full text-sm font-black bg-violet-600 text-white flex items-center shadow-lg shadow-violet-500/20">
                                    <Truck size={14} className="mr-1.5" /> {t('dashboard.delivery_slot')}: IMMEDIATE
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleDownloadInvoice}
                            className="flex items-center gap-2 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                            <Download size={16} /> {t('dashboard.order_details_modal.download_invoice')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h6 className="flex items-center mb-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <User size={16} className="mr-2" /> {t('dashboard.order_details_modal.customer_info')}
                            </h6>
                            <p className="font-bold text-gray-900 mb-1">{displayCustomer}</p>
                            <p className="text-gray-500 text-sm mb-1">{displayOrder.user?.email || displayOrder.posCustomer?.email || 'N/A'}</p>
                            <p className="text-gray-500 text-sm mb-0">{displayOrder.user?.phone || displayOrder.posCustomer?.phone || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h6 className="flex items-center mb-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <MapPin size={16} className="mr-2" /> {t('dashboard.order_details_modal.shipping_address')}
                            </h6>
                            <div className="text-sm text-gray-600">
                                {displayOrder.shippingAddress ? (
                                    <>
                                        <p className="mb-1 font-medium">{displayOrder.shippingAddress.street || displayOrder.shippingAddress.address || 'N/A'}</p>
                                        <p className="mb-0">{displayOrder.shippingAddress.city || ''} {displayOrder.shippingAddress.state || ''} {displayOrder.shippingAddress.zipCode || ''}</p>
                                        {displayOrder.shippingAddress.phone && <p className="mt-1 font-medium text-gray-700">{t('dashboard.customer_phone', { defaultValue: 'Phone' })}: {displayOrder.shippingAddress.phone}</p>}
                                    </>
                                ) : (
                                    <p>{t('dashboard.order_details_modal.no_address_provided')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Management Section */}
                    {displayOrder.orderSource === 'pos' ? (
                        <div className="mb-6 border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                            <h6 className="flex items-center mb-2 font-bold text-gray-800 uppercase tracking-tighter text-sm">
                                <Package size={18} className="mr-2 text-gray-400" /> {t('dashboard.order_details_modal.pos_transaction')}
                            </h6>
                            <p className="text-sm text-gray-500 italic">{t('dashboard.order_details_modal.pos_msg')}</p>
                        </div>
                    ) : (
                        <div className="mb-6 border border-blue-100 rounded-xl p-5 bg-blue-50/30">
                            <h6 className="flex items-center mb-4 font-bold text-gray-800">
                                <Truck size={18} className="mr-2 text-blue-600" /> {t('dashboard.order_details_modal.delivery_management')}
                            </h6>

                            {displayOrder.deliveryPartnerId ? (
                                <div className="flex items-center justify-between p-3 bg-white border border-green-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-full">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{t('dashboard.order_details_modal.partner_assigned')}</div>
                                            <div className="text-xs text-gray-500">ID: {displayOrder.deliveryPartnerId?._id || displayOrder.deliveryPartnerId}</div>
                                        </div>
                                    </div>
                                    {displayOrder.deliveryOTP && (
                                        <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-black">
                                            {t('dashboard.order_details_modal.otp')}: {displayOrder.deliveryOTP}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Assignment logic based on status
                                userRole === 'Admin' ? (
                                    ['confirmed', 'preparing', 'ready_for_pickup'].includes(displayOrder.status) ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    disabled={assigning}
                                                    onClick={handleAutoAssign}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    {assigning ? <span className="animate-spin text-lg">⏳</span> : <Zap size={16} fill="currentColor" />}
                                                    {t('dashboard.order_details_modal.auto_assign')}
                                                </button>

                                                <div className="flex-1 flex gap-2">
                                                    <select
                                                        className="flex-grow bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={selectedPartner}
                                                        onChange={(e) => setSelectedPartner(e.target.value)}
                                                    >
                                                        <option value="">{t('dashboard.order_details_modal.select_rider')}</option>
                                                        {availablePartners.length > 0 ? (
                                                            availablePartners.map(p => (
                                                                <option key={p._id} value={p._id}>{p.name} ({p.vehicleType})</option>
                                                            ))
                                                        ) : (
                                                            <option disabled value="">{t('dashboard.order_details_modal.no_available_riders')}</option>
                                                        )}
                                                    </select>
                                                    <button
                                                        disabled={assigning || !selectedPartner}
                                                        onClick={handleManualAssign}
                                                        className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                                    >
                                                        {t('dashboard.order_details_modal.assign_btn')}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-500 text-center italic">
                                                {t('dashboard.order_details_modal.assignment_warning')}
                                            </p>
                                        </div>
                                    ) : displayOrder.status === 'pending' ? (
                                        <div className="text-center py-2 bg-blue-50/50 rounded-lg border border-blue-100">
                                            <p className="text-sm text-blue-600 font-medium">{t('dashboard.order_details_modal.confirm_before_assign')}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-sm text-gray-500 italic">{t('dashboard.order_details_modal.assignment_not_available')} <span className="font-bold uppercase">{displayStatusString}</span></p>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                            {t('dashboard.order_details_modal.restricted_access')}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <h6 className="flex items-center mb-4 font-bold text-gray-800">
                        <Package size={18} className="mr-2 text-blue-600" /> {t('dashboard.order_details_modal.order_items')}
                    </h6>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 pl-6">{t('dashboard.order_details_modal.product_label')}</th>
                                    <th className="px-5 py-3 text-center">{t('dashboard.order_details_modal.qty_label')}</th>
                                    <th className="px-5 py-3 text-right">{t('dashboard.order_details_modal.price_label')}</th>
                                    <th className="px-5 py-3 text-right pr-6">{t('dashboard.order_details_modal.total_label')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-5 py-3 pl-6">
                                            <div className="flex items-center gap-3">
                                                <img src={item.product?.image || item.image || 'https://placehold.co/50'} alt={item.product?.name || item.name} className="w-10 h-10 rounded object-cover border border-gray-100" />
                                                <div>
                                                    <div className="font-medium text-gray-800 line-clamp-2 max-w-[200px]">{item.product?.name || item.name}</div>
                                                    <div className="text-xs text-gray-500 uppercase">{item.product?.unitValue || ''} {item.product?.unitType || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center text-gray-600">{item.quantity}</td>
                                        <td className="px-5 py-3 text-right text-gray-600">₹{item.price || 0}</td>
                                        <td className="px-5 py-3 text-right pr-6 font-bold text-gray-800">₹{(item.price || 0) * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('dashboard.order_details_modal.subtotal')}</span>
                                <span className="text-gray-900 font-medium">₹{displayOrder.subTotal || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('dashboard.order_details_modal.tax')}</span>
                                <span className="text-gray-900 font-medium">₹{displayOrder.taxAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('dashboard.order_details_modal.delivery_fee')}</span>
                                <span className="text-gray-900 font-medium">₹{displayOrder.deliveryFee || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('dashboard.order_details_modal.handling_fee')}</span>
                                <span className="text-gray-900 font-medium">₹{displayOrder.handlingFee || 0}</span>
                            </div>
                            {displayOrder.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                                    <div className="flex flex-col text-left">
                                        <span>{t('dashboard.order_details_modal.promo_discount')}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-green-500">{t('dashboard.promo_code', { defaultValue: 'Code' })}: {displayOrder.promoCode}</span>
                                    </div>
                                    <span>-₹{displayOrder.discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-1 pt-3 border-t border-gray-100">
                                <span className="text-lg font-bold text-gray-800">{t('dashboard.order_details_modal.final_total')}</span>
                                <span className="text-lg font-black text-blue-600">{displayTotal}</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs uppercase font-bold text-gray-500">{t('dashboard.order_details_modal.platform_commission')}</span>
                                    <span className="text-sm text-blue-600 font-bold">₹{displayOrder.platformCommission || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase font-bold text-gray-500">{t('dashboard.order_details_modal.vendor_net_payout')}</span>
                                    <span className="text-sm text-green-600 font-black">₹{displayOrder.vendorPayoutAmount || 0}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500 font-medium">{t('dashboard.payment_method')}</span>
                                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t(`dashboard.payment_methods.${displayOrder.paymentMethod}`, { defaultValue: displayOrder.paymentMethod })}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-gray-500 font-medium">{t('dashboard.payment_status')}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center ${displayOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : displayOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    <CreditCard size={12} className="mr-1.5" /> {t(`dashboard.order_status.${displayOrder.paymentStatus || 'pending'}`, { defaultValue: displayOrder.paymentStatus || 'pending' })}
                                </span>
                            </div>
                        </div>
                    </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        {t('dashboard.order_details_modal.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
