import React, { useState } from 'react';
import { Search, Eye, Filter, Download, Store, Upload } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';

const MOCK_ORDERS = [
    { id: 'ORD-1001', customer: 'John Doe', vendor: 'TechWorld', category: 'Electronics', date: '2023-10-25', status: 'Delivered', total: '₹120.00', items: 3, payment: 'Paid' },
    { id: 'ORD-1002', customer: 'Jane Smith', vendor: 'FashionHub', category: 'Clothing', date: '2023-10-26', status: 'Pending', total: '₹85.50', items: 1, payment: 'Pending' },
    { id: 'ORD-1003', customer: 'Bob Wilson', vendor: 'GrocerMart', category: 'Groceries', date: '2023-10-26', status: 'Processing', total: '₹210.00', items: 5, payment: 'Paid' },
    { id: 'ORD-1004', customer: 'Alice Brown', vendor: 'TechWorld', category: 'Electronics', date: '2023-10-27', status: 'Cancelled', total: '₹45.00', items: 2, payment: 'Refunded' },
    { id: 'ORD-1005', customer: 'Charlie Day', vendor: 'ElectroCity', category: 'Electronics', date: '2023-10-27', status: 'Delivered', total: '₹340.00', items: 8, payment: 'Paid' },
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
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const uniqueVendors = [...new Set(MOCK_ORDERS.map(o => o.vendor))];
    const uniqueCategories = [...new Set(MOCK_ORDERS.map(o => o.category))];

    const filteredOrders = MOCK_ORDERS.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.vendor.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVendor = selectedVendor ? order.vendor === selectedVendor : true;
        const matchesCategory = selectedCategory ? order.category === selectedCategory : true;

        return matchesSearch && matchesVendor && matchesCategory;
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
                        <div className="w-full md:max-w-xs">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                <div className="pl-3 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                    placeholder="Search Order..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 md:flex w-full md:w-auto gap-3">
                        {/* Filter Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-white border ${showFilterMenu || selectedCategory || selectedVendor ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">Filter</span>
                                {(selectedCategory || selectedVendor) && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showFilterMenu && (
                                <div className="absolute top-12 right-0 md:left-auto md:right-0 z-20 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <h6 className="font-bold text-gray-800 mb-3 text-sm">Filter Options</h6>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Vendor / Brand</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                value={selectedVendor}
                                                onChange={(e) => setSelectedVendor(e.target.value)}
                                            >
                                                <option value="">All Vendors</option>
                                                {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>

                                        {(selectedCategory || selectedVendor) && (
                                            <button
                                                onClick={() => { setSelectedCategory(''); setSelectedVendor(''); setShowFilterMenu(false); }}
                                                className="text-xs text-red-600 font-medium hover:text-red-700 mt-2 w-full text-center"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-green-600 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors shadow-sm">
                            <Upload size={20} />
                            <span className="hidden sm:inline">Import</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm">
                            <Download size={20} />
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
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{order.customer}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                            <Store size={14} className="text-gray-400" />
                                            {order.vendor}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${order.payment === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.items}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">{order.total}</td>
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
