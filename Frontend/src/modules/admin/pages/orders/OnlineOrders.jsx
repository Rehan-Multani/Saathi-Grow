import React, { useState } from 'react';
import { Search, Eye, Truck, CreditCard } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';

const ONLINE_ORDERS_MOCK = [
    { id: 'ORD-2001', customer: 'Sarah Connor', date: '2023-10-28', status: 'Processing', total: '₹150.00', items: 4, paymentValues: { method: 'Stripe', status: 'Paid' }, delivery: 'FedEx' },
    { id: 'ORD-2002', customer: 'Kyle Reese', date: '2023-10-28', status: 'Pending', total: '₹45.00', items: 1, paymentValues: { method: 'PayPal', status: 'Pending' }, delivery: 'Unassigned' },
    { id: 'ORD-2003', customer: 'Ellen Ripley', date: '2023-10-27', status: 'Delivered', total: '₹890.00', items: 12, paymentValues: { method: 'Credit Card', status: 'Paid' }, delivery: 'DHL Express' },
];

const OrderStatusBadge = ({ status }) => {
    const variants = {
        Delivered: 'bg-green-100 text-green-700',
        Pending: 'bg-amber-100 text-amber-700',
        Processing: 'bg-blue-100 text-blue-700',
        Cancelled: 'bg-red-100 text-red-700',
        Shipped: 'bg-indigo-100 text-indigo-700'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const OnlineOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredOrders = ONLINE_ORDERS_MOCK.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowDetails = (order) => {
        const modalOrder = {
            ...order,
            payment: order.paymentValues.status // Adapt structure for the modal
        };
        setSelectedOrder(modalOrder);
        setShowModal(true);
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h5 className="mb-0 font-bold text-gray-800 text-lg">Online Orders</h5>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            {filteredOrders.length}
                        </span>
                    </div>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full max-w-[250px] focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <div className="pl-3 text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Delivery</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">{order.customer}</span>
                                            <span className="text-xs text-gray-500">Online Customer</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{order.paymentValues.method}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${order.paymentValues.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.paymentValues.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Truck size={14} />
                                            <span>{order.delivery}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">{order.total}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="p-1 text-gray-800 hover:text-blue-600 transition-colors"
                                            onClick={() => handleShowDetails(order)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default OnlineOrders;
