import React, { useState } from 'react';
import { Search, Eye, Filter, Download } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';

const MOCK_ORDERS = [
    { id: 'ORD-1001', customer: 'John Doe', date: '2023-10-25', status: 'Delivered', total: '₹120.00', items: 3, payment: 'Paid' },
    { id: 'ORD-1002', customer: 'Jane Smith', date: '2023-10-26', status: 'Pending', total: '₹85.50', items: 1, payment: 'Pending' },
    { id: 'ORD-1003', customer: 'Bob Wilson', date: '2023-10-26', status: 'Processing', total: '₹210.00', items: 5, payment: 'Paid' },
    { id: 'ORD-1004', customer: 'Alice Brown', date: '2023-10-27', status: 'Cancelled', total: '₹45.00', items: 2, payment: 'Refunded' },
    { id: 'ORD-1005', customer: 'Charlie Day', date: '2023-10-27', status: 'Delivered', total: '₹340.00', items: 8, payment: 'Paid' },
];

const OrderStatusBadge = ({ status }) => {
    const variants = {
        Delivered: 'bg-green-100 text-green-700',
        Pending: 'bg-amber-100 text-amber-700',
        Processing: 'bg-blue-100 text-blue-700',
        Cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const AllOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredOrders = MOCK_ORDERS.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    return (
        <div className="p-6">
            {/* Action Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:max-w-xs">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                            <div className="pl-3 text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                placeholder="Search by Order ID or Customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <Filter size={18} />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                            <Download size={18} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
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
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{order.customer}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${order.payment === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.items}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">{order.total}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            onClick={() => handleShowDetails(order)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
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

export default AllOrders;
