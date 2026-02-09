import React, { useState } from 'react';
import { RotateCcw, Package, CheckCircle, XCircle, Clock, Search, Eye, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '../utils/formatDate';

const ReturnRequests = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Mock return request data
    const returnRequests = [
        { id: 1, orderId: 'ORD-001', customer: 'Rahul Sharma', product: 'Fresh Tomatoes (1kg)', reason: 'Damaged product', amount: 85, date: '2024-02-09', status: 'pending', images: 2, description: 'Product was damaged during delivery' },
        { id: 2, orderId: 'ORD-002', customer: 'Priya Singh', product: 'Organic Carrots (500g)', reason: 'Wrong item', amount: 65, date: '2024-02-08', status: 'approved', images: 1, description: 'Received different product than ordered', refundDate: '2024-02-09' },
        { id: 3, orderId: 'ORD-003', customer: 'Amit Kumar', product: 'Fresh Onions (1kg)', reason: 'Quality issue', amount: 45, date: '2024-02-07', status: 'rejected', images: 3, description: 'Poor quality onions', rejectReason: 'No quality issues found' },
        { id: 4, orderId: 'ORD-004', customer: 'Neha Patel', product: 'Green Capsicum (250g)', reason: 'Not fresh', amount: 55, date: '2024-02-06', status: 'completed', images: 1, description: 'Product not fresh as expected', refundDate: '2024-02-07' },
        { id: 5, orderId: 'ORD-005', customer: 'Sanjay Verma', product: 'Fresh Potatoes (2kg)', reason: 'Damaged', amount: 95, date: '2024-02-09', status: 'pending', images: 2, description: 'Package was torn, potatoes spilled' },
    ];

    const filteredRequests = returnRequests.filter(request => {
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        const matchesSearch = request.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.product.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusColors = {
        'pending': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'approved': 'bg-blue-50 text-blue-700 border-blue-100',
        'rejected': 'bg-red-50 text-red-700 border-red-100',
        'completed': 'bg-green-50 text-green-700 border-green-100',
    };

    const pendingReturns = returnRequests.filter(r => r.status === 'pending').length;
    const approvedReturns = returnRequests.filter(r => r.status === 'approved').length;
    const rejectedReturns = returnRequests.filter(r => r.status === 'rejected').length;
    const completedReturns = returnRequests.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Return Requests</h1>
                    <p className="text-sm text-gray-500">Manage product returns and refunds</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Pending</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{pendingReturns}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Approved</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{approvedReturns}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Rejected</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{rejectedReturns}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Completed</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{completedReturns}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {['all', 'pending', 'approved', 'rejected', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap border transition-colors ${filterStatus === status
                                        ? 'bg-[#0c831f] text-white border-[#0c831f]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Return Requests Table - Desktop */}
            <div className="hidden md:block premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Reason</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRequests.map(request => (
                                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{request.orderId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{request.customer}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{request.product}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <ImageIcon size={12} />
                                            {request.images} image(s)
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{request.reason}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(request.amount)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{request.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[request.status]}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                                                <Eye size={14} />
                                                View
                                            </button>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button className="px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                        Approve
                                                    </button>
                                                    <button className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Request Cards - Mobile */}
            <div className="md:hidden space-y-4">
                {filteredRequests.map(request => (
                    <div key={request.id} className="premium-card p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase">{request.orderId}</span>
                                <h3 className="text-sm font-bold text-gray-900 mt-1">{request.product}</h3>
                                <p className="text-xs text-gray-500 mt-1">{request.customer}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[request.status]}`}>
                                {request.status}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-xs text-gray-500">Reason</p>
                            <p className="text-sm font-medium text-gray-900">{request.reason}</p>
                            <p className="text-xs text-gray-600 mt-1">{request.description}</p>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-xs text-gray-500">Refund Amount</p>
                                <p className="text-base font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Requested</p>
                                <p className="text-xs font-medium text-gray-900">{request.date}</p>
                            </div>
                        </div>
                        {request.status === 'pending' && (
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                    Approve
                                </button>
                                <button className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReturnRequests;
