import React, { useState, useEffect } from 'react';
import { RefreshCcw, Check, X, Search, Database } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getInventoryRequests, approveInventoryRequest, rejectInventoryRequest } from '../../../store-manager/api/inventoryRequestApi';
import { toast } from 'react-toastify';

const InventoryRequests = () => {
  const { adminUser } = useAdminAuth();
  const token = adminUser?.token;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getInventoryRequests(token);
      setRequests(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch inventory requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      await approveInventoryRequest(token, id);
      toast.success('Request approved successfully');
      fetchRequests();
    } catch (error) {
      toast.error(error.message || 'Error parsing the request handling');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this update request?")) {
      try {
        await rejectInventoryRequest(token, id);
        toast.success('Request rejected');
        fetchRequests();
      } catch (error) {
        toast.error(error.message || 'Failed to reject the stock update');
      }
    }
  };

  const filteredRequests = requests.filter(req =>
    req.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Branch Inventory Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve stock adjustments from store managers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by product or branch..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c831f]/20 focus:border-[#0c831f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Branch & Requester</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Adjustment</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Loading mapping requests...
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {req.product?.image ? (
                            <img src={req.product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Database size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{req.product?.name || 'Deleted Product'}</div>
                          <div className="text-xs text-gray-500">SKU: {req.product?.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.branchId?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        By: {req.managerId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{req.currentStock}</span>
                        <span className="text-gray-300">→</span>
                        <span className={`font-semibold ${req.requestedStock > req.currentStock ? 'text-green-600' : 'text-orange-600'}`}>
                          {req.requestedStock}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                        {req.adjustmentType}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApprove(req._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleReject(req._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 border border-gray-100 bg-gray-50 px-2 py-1 rounded">
                          Reviewed By {req.reviewedBy?.name || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No pending stock requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryRequests;
