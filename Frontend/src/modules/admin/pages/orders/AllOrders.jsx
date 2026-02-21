import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Download, Store, Upload, Clock } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { getAllOrdersAdmin } from '../../api/orderApi';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

const OrderStatusBadge = ({ status }) => {
    const variants = {
        delivered: 'bg-green-100 text-green-700',
        pending: 'bg-amber-100 text-amber-700',
        preparing: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-cyan-100 text-cyan-700',
        out_for_delivery: 'bg-indigo-100 text-indigo-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'} whitespace-nowrap uppercase`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrdersAdmin();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            Swal.fire('Error', 'Could not load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const uniqueVendors = [...new Set(orders.map(o => o.branchId?.name || o.vendor))].filter(Boolean);
    const uniqueCategories = [];

    const filteredOrders = orders.filter(order => {
        const orderId = order.orderId || order._id || '';
        const customerName = order.user?.name || order.customer || 'Guest';
        const vendorName = order.branchId?.name || order.vendor || 'Global';

        const matchesSearch = orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVendor = selectedVendor ? (order.branchId?.name === selectedVendor || order.vendor === selectedVendor) : true;

        return matchesSearch && matchesVendor;
    });

    const handleShowDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    return (
        <div className="p-6">
            {/* Action Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-3 w-full md:flex-1 relative">
                        <div className="w-full md:max-w-xs text-start">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                <div className="pl-3 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                    placeholder="Search Order ID, Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 md:flex w-full md:w-auto gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-white border ${showFilterMenu || selectedVendor ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">Branch Filter</span>
                                {selectedVendor && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                                )}
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-12 right-0 md:left-auto md:right-0 z-20 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <h6 className="font-bold text-gray-800 mb-3 text-sm">Filter By Branch</h6>
                                    <div className="space-y-3 text-start">
                                        <select
                                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                            value={selectedVendor}
                                            onChange={(e) => setSelectedVendor(e.target.value)}
                                        >
                                            <option value="">All Branches</option>
                                            {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                        {selectedVendor && (
                                            <button
                                                onClick={() => { setSelectedVendor(''); setShowFilterMenu(false); }}
                                                className="text-xs text-red-600 font-medium hover:text-red-700 mt-2 w-full text-center"
                                            >
                                                Clear Filter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={fetchOrders} className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm">
                            <Clock size={18} />
                            <span className="hidden sm:inline">Refresh</span>
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
                                <th className="px-6 py-4">Branch</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">TotalAmount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2 text-muted">Loading orders...</span>
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">{order.orderId || order._id.slice(-8)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        <div>{order.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-muted">{order.user?.email || ''}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                            <Store size={14} className="text-gray-400" />
                                            {order.branchId?.name || 'Global'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">₹{order.totalAmount}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            onClick={() => handleShowDetails(order)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No orders found.
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
