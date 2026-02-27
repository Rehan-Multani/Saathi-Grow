import { Download, Package, User, MapPin, CreditCard, Clock, X, Truck, Zap, CheckCircle } from 'lucide-react';
import { getAvailablePartners, assignOrder, autoAssignOrder } from '../../api/adminDeliveryApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import React, { useEffect } from 'react';

const OrderDetailsModal = ({ show, onHide, order, onOrderUpdate }) => {
    const [availablePartners, setAvailablePartners] = React.useState([]);
    const [assigning, setAssigning] = React.useState(false);
    const [selectedPartner, setSelectedPartner] = React.useState('');

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            fetchAvailablePartners();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

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
            toast.error(error.response?.data?.message || 'Auto-assignment failed');
        } finally {
            setAssigning(false);
        }
    };

    const handleManualAssign = async () => {
        if (!selectedPartner) return toast.warning('Please select a driver');

        setAssigning(true);
        try {
            const res = await assignOrder(order._id, selectedPartner);
            toast.success('Assigned successfully!');
            if (onOrderUpdate) onOrderUpdate();
            onHide();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Manual assignment failed');
        } finally {
            setAssigning(false);
        }
    };

    if (!show || !order) return null;

    // Support both Backend and Mock structures
    const displayId = order.orderId || order.id;
    const displayCustomer = order.user?.name || order.customer || 'Guest';
    const displayTotal = order.totalAmount !== undefined ? `₹${order.totalAmount}` : order.total;
    const displayDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date;
    const displayStatus = order.status ? order.status.replace(/_/g, ' ') : 'Pending';
    const displayPayment = order.paymentMethod || order.payment || 'N/A';

    // Items handling
    const items = order.items && Array.isArray(order.items) && order.items.length > 0 && typeof order.items[0] === 'object'
        ? order.items
        : Array(typeof order.items === 'number' ? order.items : 1).fill(null).map((_, i) => ({
            product: { name: `Product Item ${i + 1}`, price: 0 },
            name: `Product Item ${i + 1}`,
            price: 0,
            quantity: 1,
            total: 0,
            image: `https://placehold.co/50`
        }));

    // Helper for status badge colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const handleDownloadInvoice = () => {
        const invoiceContent = `
            <html>
            <head>
                <title>Invoice #${order.id}</title>
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
                        <div>Date: ${displayDate}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="section-title">Bill To:</div>
                        <strong>${displayCustomer}</strong><br>
                        ${order.shippingAddress?.street || order.shippingAddress?.address || 'No Address'}<br>
                        ${order.shippingAddress?.city || ''} ${(order.shippingAddress?.state || '')} ${(order.shippingAddress?.zipCode || '')}
                    </div>
                    <div>
                        <div class="section-title">Payment Info:</div>
                        Status: ${displayPayment}<br>
                        Method: ${order.paymentInfo?.method || 'N/A'}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Total</th>
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
                                            <span style="font-size: 12px; color: #666;">Variation: Standard</span>
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
                        <span>Subtotal:</span>
                        <span>₹${order.subTotal || 0}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax Amount:</span>
                        <span>₹${order.taxAmount || 0}</span>
                    </div>
                    <div class="total-row">
                        <span>Delivery Fee:</span>
                        <span>₹${order.deliveryFee || 0}</span>
                    </div>
                    <div class="total-row">
                        <span>Handling Fee:</span>
                        <span>₹${order.handlingFee || 0}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Grand Total:</span>
                        <span>${displayTotal}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
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
                        Order Details: <span className="text-blue-600">{displayId}</span>
                    </h5>
                    <button
                        onClick={onHide}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status || 'Pending')}`}>
                                {displayStatus}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 flex items-center">
                                <Clock size={14} className="mr-1.5" /> {displayDate}
                            </span>
                        </div>
                        <button
                            onClick={handleDownloadInvoice}
                            className="flex items-center gap-2 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                            <Download size={16} /> Download Invoice
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h6 className="flex items-center mb-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <User size={16} className="mr-2" /> Customer Info
                            </h6>
                            <p className="font-bold text-gray-900 mb-1">{displayCustomer}</p>
                            <p className="text-gray-500 text-sm mb-1">{order.user?.email || 'N/A'}</p>
                            <p className="text-gray-500 text-sm mb-0">{order.user?.phone || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h6 className="flex items-center mb-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <MapPin size={16} className="mr-2" /> Shipping Address
                            </h6>
                            <div className="text-sm text-gray-600">
                                {order.shippingAddress ? (
                                    <>
                                        <p className="mb-1 font-medium">{order.shippingAddress.street || order.shippingAddress.address || 'N/A'}</p>
                                        <p className="mb-0">{order.shippingAddress.city || ''} {order.shippingAddress.state || ''} {order.shippingAddress.zipCode || ''}</p>
                                        {order.shippingAddress.phone && <p className="mt-1 font-medium text-gray-700">Phone: {order.shippingAddress.phone}</p>}
                                    </>
                                ) : (
                                    <p>No address provided</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Management Section */}
                    <div className="mb-6 border border-blue-100 rounded-xl p-5 bg-blue-50/30">
                        <h6 className="flex items-center mb-4 font-bold text-gray-800">
                            <Truck size={18} className="mr-2 text-blue-600" /> Delivery Management
                        </h6>

                        {order.deliveryPartnerId ? (
                            <div className="flex items-center justify-between p-3 bg-white border border-green-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-full">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">Partner Assigned</div>
                                        <div className="text-xs text-gray-500">ID: {order.deliveryPartnerId?._id || order.deliveryPartnerId}</div>
                                    </div>
                                </div>
                                {order.deliveryOTP && (
                                    <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-black">
                                        OTP: {order.deliveryOTP}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        disabled={assigning}
                                        onClick={handleAutoAssign}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {assigning ? <span className="animate-spin">◌</span> : <Zap size={16} fill="currentColor" />}
                                        Auto Assign Nearest
                                    </button>

                                    <div className="flex-1 flex gap-2">
                                        <select
                                            className="flex-grow bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedPartner}
                                            onChange={(e) => setSelectedPartner(e.target.value)}
                                        >
                                            <option value="">Select Rider</option>
                                            {availablePartners.length > 0 ? (
                                                availablePartners.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} ({p.vehicleType})</option>
                                                ))
                                            ) : (
                                                <option disabled value="">No Available Riders</option>
                                            )}
                                        </select>
                                        <button
                                            disabled={assigning || !selectedPartner}
                                            onClick={handleManualAssign}
                                            className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 text-center italic">
                                    * Auto-assignment searches for the nearest online partner within 10km of {order.vendor ? 'Vendor store' : 'Branch location'}.
                                </p>
                            </div>
                        )}
                    </div>

                    <h6 className="flex items-center mb-4 font-bold text-gray-800">
                        <Package size={18} className="mr-2 text-blue-600" /> Order Items
                    </h6>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 pl-6">Product</th>
                                    <th className="px-5 py-3 text-center">Qty</th>
                                    <th className="px-5 py-3 text-right">Price</th>
                                    <th className="px-5 py-3 text-right pr-6">Total</th>
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
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 font-medium">₹{order.subTotal || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax</span>
                                <span className="text-gray-900 font-medium">₹{order.taxAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery Fee</span>
                                <span className="text-gray-900 font-medium">₹{order.deliveryFee || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Handling Fee</span>
                                <span className="text-gray-900 font-medium">₹{order.handlingFee || 0}</span>
                            </div>
                            <div className="flex justify-between items-center mb-1 pt-3 border-t border-gray-100">
                                <span className="text-lg font-bold text-gray-800">Final Total</span>
                                <span className="text-lg font-black text-blue-600">{displayTotal}</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs uppercase font-bold text-gray-500">Platform Commission</span>
                                    <span className="text-sm text-blue-600 font-bold">₹{order.platformCommission || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase font-bold text-gray-500">Vendor Net Payout</span>
                                    <span className="text-sm text-green-600 font-black">₹{order.vendorPayoutAmount || 0}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-gray-500">Payment Status</span>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${displayPayment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    <CreditCard size={14} className="mr-1.5" /> {displayPayment}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onHide}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
