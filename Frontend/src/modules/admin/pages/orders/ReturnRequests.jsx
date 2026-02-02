import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import ReturnDetailsModal from '../../components/orders/ReturnDetailsModal';

const RETURNS_MOCK = [
    { id: 'RET-5001', orderId: 'ORD-1005', customer: 'Charlie Day', product: 'Gaming Laptop', reason: 'Defective', status: 'Pending', date: '2023-10-29' },
    { id: 'RET-5002', orderId: 'ORD-1001', customer: 'John Doe', product: 'Wireless Mouse', reason: 'Changed Mind', status: 'Approved', date: '2023-10-28' },
    { id: 'RET-5003', orderId: 'ORD-0998', customer: 'Frank Reynolds', product: 'HDMI Cable', reason: 'Wrong Item Sent', status: 'Rejected', date: '2023-10-27' },
];

const ReturnStatusBadge = ({ status }) => {
    const variants = {
        Approved: 'bg-green-100 text-green-700',
        Pending: 'bg-amber-100 text-amber-700',
        Rejected: 'bg-red-100 text-red-700',
        Completed: 'bg-blue-100 text-blue-700'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const ReturnRequests = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const filteredRequests = RETURNS_MOCK.filter(req =>
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowDetails = (req) => {
        setSelectedRequest(req);
        setShowModal(true);
        setActiveDropdownId(null);
    };

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setActiveDropdownId(activeDropdownId === id ? null : id);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveDropdownId(null);
        if (activeDropdownId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeDropdownId]);

    return (
        <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h5 className="font-bold text-gray-800 text-lg">Return Requests</h5>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full max-w-[300px] focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <div className="pl-3 text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Return ID, Order, Customer..."
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
                                <th className="px-6 py-4 pl-6">Return ID</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.map((req, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 pl-6 font-bold text-red-500">{req.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{req.orderId}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{req.customer}</td>
                                    <td className="px-6 py-4 text-gray-600">{req.product}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{req.reason}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{req.date}</td>
                                    <td className="px-6 py-4 text-center"><ReturnStatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4 text-center relative">
                                        <button
                                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                            onClick={(e) => toggleDropdown(req.id, e)}
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {activeDropdownId === req.id && (
                                            <div className="absolute right-6 top-10 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={() => handleShowDetails(req)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye size={16} className="text-blue-500" />
                                                    <span>View Details</span>
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors">
                                                    <CheckCircle size={16} />
                                                    <span>Approve Return</span>
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                    <XCircle size={16} />
                                                    <span>Reject Return</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReturnDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                request={selectedRequest}
            />
        </div>
    );
};

export default ReturnRequests;
