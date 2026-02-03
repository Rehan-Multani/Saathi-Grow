import React, { useEffect } from 'react';
import { Download, Package, User, MapPin, CreditCard, Clock, X } from 'lucide-react';

const OrderDetailsModal = ({ show, onHide, order }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    if (!show || !order) return null;

    // Mock data for extended details since the main list is simple
    const mockItems = Array(order.items || 1).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Product Item ${i + 1}`,
        price: '₹' + (parseFloat(order.total.replace('₹', '')) / (order.items || 1)).toFixed(2),
        quantity: 1,
        total: '₹' + (parseFloat(order.total.replace('₹', '')) / (order.items || 1)).toFixed(2),
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
                        <div>#${order.id}</div>
                        <div>Date: ${order.date}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="section-title">Bill To:</div>
                        <strong>${order.customer}</strong><br>
                        123, Green Park Avenue,<br>
                        Mumbai, Maharashtra - 400001
                    </div>
                    <div>
                        <div class="section-title">Payment Info:</div>
                        Status: ${order.payment}<br>
                        Method: Credit Card ending **** 4242
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
                        ${mockItems.map(item => `
                            <tr>
                                <td>
                                    <div class="product-cell">
                                        <img src="${item.image}" alt="${item.name}" class="product-img" />
                                        <div>
                                            <strong>${item.name}</strong><br>
                                            <span style="font-size: 12px; color: #666;">Variation: Red, XL</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-right">${item.price}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">${item.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${order.total}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (18%):</span>
                        <span>₹24.00</span>
                    </div>
                    <div class="total-row">
                        <span>Delivery Fee:</span>
                        <span>₹50.00</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total:</span>
                        <span>${order.total}</span>
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
                        Order Details: <span className="text-blue-600">{order.id}</span>
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
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 flex items-center">
                                <Clock size={14} className="mr-1.5" /> {order.date}
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
                            <p className="font-bold text-gray-900 mb-1">{order.customer}</p>
                            <p className="text-gray-500 text-sm mb-1">customer@example.com</p>
                            <p className="text-gray-500 text-sm mb-0">+91 98765 43210</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h6 className="flex items-center mb-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <MapPin size={16} className="mr-2" /> Shipping Address
                            </h6>
                            <div className="text-sm text-gray-600">
                                <p className="mb-1">123, Green Park Avenue,</p>
                                <p className="mb-1">Near City Mall, Sector 4,</p>
                                <p className="mb-0">Mumbai, Maharashtra - 400001</p>
                            </div>
                        </div>
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
                                {mockItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-5 py-3 pl-6">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover border border-gray-100" />
                                                <div>
                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-xs text-gray-500">Variation: Red, XL</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center text-gray-600">{item.quantity}</td>
                                        <td className="px-5 py-3 text-right text-gray-600">{item.price}</td>
                                        <td className="px-5 py-3 text-right pr-6 font-bold text-gray-800">{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 font-medium">{order.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax (18%)</span>
                                <span className="text-gray-900 font-medium">₹24.00</span>
                            </div>
                            <div className="flex justify-between text-sm pb-3 border-b border-gray-100">
                                <span className="text-gray-500">Delivery Fee</span>
                                <span className="text-gray-900 font-medium">₹50.00</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-bold text-gray-800">Total</span>
                                <span className="text-lg font-bold text-blue-600">{order.total}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-gray-500">Payment Status</span>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${order.payment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    <CreditCard size={14} className="mr-1.5" /> {order.payment}
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
