import React, { useState } from 'react';
import { RotateCcw, Package, CheckCircle, XCircle, Clock, Search, Eye, Image as ImageIcon, X, AlertCircle, Check, MoreVertical } from 'lucide-react';
import { formatCurrency } from '../utils/formatDate';
import { useReturnRequests } from '../../../common/contexts/ReturnRequestsContext';

const ReturnRequests = () => {
    const { returnRequests, updateReturnStatus } = useReturnRequests();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [activeActionId, setActiveActionId] = useState(null);
    const [notification, setNotification] = useState(null);

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

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const handleApproveClick = (request) => {
        setSelectedRequest(request);
        setConfirmAction('approve');
        setShowConfirmModal(true);
    };

    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setConfirmAction('reject');
        setRejectReason('');
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => {
        if (!selectedRequest) return;

        if (confirmAction === 'approve') {
            updateReturnStatus(selectedRequest.id, 'approved', {
                refundDate: new Date().toISOString().split('T')[0]
            });
            showNotification('Return request approved successfully! Refund will be processed.', 'success');
        } else if (confirmAction === 'reject') {
            updateReturnStatus(selectedRequest.id, 'rejected', {
                rejectReason: rejectReason || 'Return request rejected by vendor'
            });
            showNotification('Return request rejected.', 'info');
        }

        setShowConfirmModal(false);
        setSelectedRequest(null);
        setRejectReason('');
    };

    return (
        <div className="space-y-4 md:space-y-6 lg:space-y-5 pb-12">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${notification.type === 'success' ? 'bg-green-500 text-white' :
                    notification.type === 'error' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                    }`}>
                    {notification.type === 'success' && <CheckCircle size={18} />}
                    {notification.type === 'error' && <XCircle size={18} />}
                    {notification.type === 'info' && <AlertCircle size={18} />}
                    <span className="text-sm font-bold">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                <div>
                    <h1 className="text-base md:text-xl lg:text-xl font-bold text-gray-900 tracking-tight">Return Requests</h1>
                    <p className="text-[10px] md:text-sm text-gray-500 font-medium">Manage product returns and refunds</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white border border-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 lg:p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2.5 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                            <Clock size={16} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">Pending</p>
                            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{pendingReturns}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <CheckCircle size={16} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">Approved</p>
                            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{approvedReturns}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0">
                            <XCircle size={16} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">Rejected</p>
                            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{rejectedReturns}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                            <RotateCcw size={16} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">Completed</p>
                            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{completedReturns}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-lg md:rounded-xl p-3 md:p-4 lg:p-3">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 md:pl-10 pr-4 py-1.5 md:py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-xs md:text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {['all', 'pending', 'approved', 'rejected', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold capitalize whitespace-nowrap border transition-all active:scale-95 ${filterStatus === status
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
            <div className="hidden md:block overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Order ID</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Customer</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Product</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Reason</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 md:px-6 py-2.5 md:py-3 lg:py-2.5 text-[9px] md:text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRequests.map((request, index) => (
                                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3">
                                        <span className="text-xs md:text-sm font-bold text-gray-900">{request.orderId}</span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3 text-xs md:text-sm text-gray-600">{request.customer}</td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3">
                                        <p className="text-xs md:text-sm font-medium text-gray-900">{request.product}</p>
                                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500 mt-1">
                                            <ImageIcon size={12} />
                                            {request.images.length} image(s)
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3 text-xs md:text-sm text-gray-600">{request.reason}</td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3 text-xs md:text-sm font-bold text-gray-900">{formatCurrency(request.amount)}</td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3 text-xs md:text-sm text-gray-600">{request.date}</td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3">
                                        <span className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${statusColors[request.status]}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 lg:py-3">
                                        <div className="relative flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (activeActionId === request.id) {
                                                        setActiveActionId(null);
                                                    } else {
                                                        // Calculate position relative to viewport
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const menuHeight = request.status === 'pending' ? 120 : 45; // Approx heights
                                                        const spaceBelow = window.innerHeight - rect.bottom;

                                                        let top, left;
                                                        // Open upwards if near bottom of screen
                                                        if (spaceBelow < menuHeight + 20) {
                                                            top = rect.top - menuHeight - 5;
                                                        } else {
                                                            top = rect.bottom + 5;
                                                        }

                                                        // Align right edge: rect.right - menuWidth (32 * 4 = 128px)
                                                        left = rect.right - 128;

                                                        // setMenuPosition({ top, left });
                                                        setActiveActionId(request.id);
                                                    }
                                                }}
                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeActionId === request.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveActionId(null)}
                                                    />
                                                    <div className={`absolute right-0 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1 overflow-visible animate-in fade-in zoom-in-95 duration-200 ${index >= filteredRequests.length - 2 && filteredRequests.length > 2
                                                        ? 'bottom-full mb-1'
                                                        : 'top-full mt-1'
                                                        }`}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewDetails(request);
                                                                setActiveActionId(null);
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        {request.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleApproveClick(request);
                                                                        setActiveActionId(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                                >
                                                                    <CheckCircle size={14} /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRejectClick(request);
                                                                        setActiveActionId(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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
            <div className="md:hidden space-y-3 md:space-y-4">
                {filteredRequests.map(request => (
                    <div key={request.id} className="p-4 md:p-5 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">{request.orderId}</span>
                                <h3 className="text-xs md:text-sm font-bold text-gray-900 mt-1">{request.product}</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-1">{request.customer}</p>
                            </div>
                            <span className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${statusColors[request.status]}`}>
                                {request.status}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 md:p-3 mb-3">
                            <p className="text-[10px] md:text-xs text-gray-500">Reason</p>
                            <p className="text-xs md:text-sm font-medium text-gray-900">{request.reason}</p>
                            <p className="text-[10px] md:text-xs text-gray-600 mt-1">{request.description}</p>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-[10px] md:text-xs text-gray-500">Refund Amount</p>
                                <p className="text-sm md:text-base font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] md:text-xs text-gray-500">Requested</p>
                                <p className="text-[10px] md:text-xs font-medium text-gray-900">{request.date}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleViewDetails(request)}
                                className="flex-1 py-2 text-[10px] md:text-xs font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                            >
                                View Details
                            </button>
                            {request.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleApproveClick(request)}
                                        className="flex-1 py-2 text-[10px] md:text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all active:scale-95"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectClick(request)}
                                        className="flex-1 py-2 text-[10px] md:text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all active:scale-95"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {
                showDetailModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
                        <div className="bg-white rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm md:text-lg font-bold text-gray-900">Return Request Details</h2>
                                    <p className="text-[10px] md:text-sm text-gray-500 mt-0.5">{selectedRequest.orderId}</p>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                                {/* Images */}
                                <div>
                                    <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-2 md:mb-3">Uploaded Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                                        {selectedRequest.images.map((img, idx) => (
                                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                                                <img src={img} alt={`Return proof ${idx + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-1">Customer</p>
                                        <p className="text-xs md:text-sm font-bold text-gray-900">{selectedRequest.customer}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-1">Product</p>
                                        <p className="text-xs md:text-sm font-bold text-gray-900">{selectedRequest.product}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-1">Return Reason</p>
                                        <p className="text-xs md:text-sm font-bold text-gray-900">{selectedRequest.reason}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-1">Refund Amount</p>
                                        <p className="text-xs md:text-sm font-bold text-[#0c831f]">{formatCurrency(selectedRequest.amount)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mb-1">Description</p>
                                    <p className="text-xs md:text-sm text-gray-700 bg-gray-50 p-2.5 md:p-3 rounded-lg">{selectedRequest.description}</p>
                                </div>

                                {selectedRequest.status === 'rejected' && selectedRequest.rejectReason && (
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-red-500 uppercase mb-1">Rejection Reason</p>
                                        <p className="text-xs md:text-sm text-gray-700 bg-red-50 p-2.5 md:p-3 rounded-lg border border-red-100">{selectedRequest.rejectReason}</p>
                                    </div>
                                )}

                                {selectedRequest.status === 'pending' && (
                                    <div className="flex gap-2 md:gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                handleApproveClick(selectedRequest);
                                            }}
                                            className="flex-1 py-2 md:py-2.5 bg-green-600 text-white rounded-lg text-xs md:text-sm font-bold hover:bg-green-700 transition-all active:scale-95"
                                        >
                                            Approve Return
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                handleRejectClick(selectedRequest);
                                            }}
                                            className="flex-1 py-2 md:py-2.5 bg-red-600 text-white rounded-lg text-xs md:text-sm font-bold hover:bg-red-700 transition-all active:scale-95"
                                        >
                                            Reject Return
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                showConfirmModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmModal(false)}>
                        <div className="bg-white rounded-xl md:rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4 md:p-6">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto ${confirmAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {confirmAction === 'approve' ? (
                                        <Check className="text-green-600" size={24} />
                                    ) : (
                                        <XCircle className="text-red-600" size={24} />
                                    )}
                                </div>

                                <h3 className="text-base md:text-lg font-bold text-gray-900 text-center mb-2">
                                    {confirmAction === 'approve' ? 'Approve Return Request?' : 'Reject Return Request?'}
                                </h3>

                                <p className="text-xs md:text-sm text-gray-600 text-center mb-4">
                                    {confirmAction === 'approve'
                                        ? `This will approve the return for ${selectedRequest.product} and process a refund of ${formatCurrency(selectedRequest.amount)}.`
                                        : `This will reject the return request for ${selectedRequest.product}.`
                                    }
                                </p>

                                {confirmAction === 'reject' && (
                                    <div className="mb-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-700 mb-1.5 block">Rejection Reason (Optional)</label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="Enter reason for rejection..."
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-xs md:text-sm resize-none"
                                            rows="3"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 md:gap-3">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="flex-1 py-2 md:py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmAction}
                                        className={`flex-1 py-2 md:py-2.5 text-white rounded-lg text-xs md:text-sm font-bold transition-all active:scale-95 ${confirmAction === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        {confirmAction === 'approve' ? 'Approve' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ReturnRequests;
