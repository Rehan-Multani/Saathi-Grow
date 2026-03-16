import React, { useState, useEffect } from 'react';
import { RefreshCcw, Check, X, Search, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getInventoryRequests, approveInventoryRequest, rejectInventoryRequest } from '../../../store-manager/api/inventoryRequestApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const InventoryRequests = () => {
  const { t } = useTranslation();
  const { adminUser } = useAdminAuth();
  const token = adminUser?.token;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getInventoryRequests(token);
      setRequests(data);
    } catch (error) {
      toast.error(error.message || t('stock.requests.alerts.fetch_error'));
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
      toast.success(t('stock.requests.alerts.approve_success'));
      fetchRequests();
    } catch (error) {
      toast.error(error.message || t('stock.requests.alerts.approve_error'));
    }
  };

  const handleReject = async (id) => {
    if (window.confirm(t('stock.requests.alerts.reject_confirm'))) {
      try {
        await rejectInventoryRequest(token, id);
        toast.success(t('stock.requests.alerts.reject_success'));
        fetchRequests();
      } catch (error) {
        toast.error(error.message || t('stock.requests.alerts.reject_error'));
      }
    }
  };

  const filteredRequests = requests.filter(req =>
    req.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFiltered = filteredRequests.length;
  const totalPages = Math.ceil(totalFiltered / limit) || 1;
  const paginatedRequests = filteredRequests.slice((page - 1) * limit, page * limit);

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('stock.requests.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('stock.requests.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('stock.requests.search_placeholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c831f]/20 focus:border-[#0c831f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCcw size={16} /> {t('stock.requests.refresh')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('stock.requests.table.product')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('stock.requests.table.branch')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('stock.requests.table.adjustment')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('stock.requests.table.status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('stock.requests.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    {t('stock.requests.loading')}
                  </td>
                </tr>
              ) : paginatedRequests.length > 0 ? (
                paginatedRequests.map(req => (
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
                          <div className="font-medium text-gray-900">{req.product?.name || t('stock.adjustments.unknown_product')}</div>
                          <div className="text-xs text-gray-500">{t('stock.requests.table.sku')}: {req.product?.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.branchId?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        {t('stock.requests.table.by')}: {req.managerId?.name}
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
                          {t('stock.requests.table.reviewed_by')} {req.reviewedBy?.name || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                 ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    {t('stock.requests.no_requests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalFiltered > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              {t('stock.branch_stock.pagination.showing')} <span className="font-semibold text-gray-900">{((page - 1) * limit) + 1}</span> {t('stock.branch_stock.pagination.to') || 'to'} <span className="font-semibold text-gray-900">{Math.min(page * limit, totalFiltered)}</span> {t('stock.branch_stock.pagination.of')} <span className="font-semibold text-gray-900">{totalFiltered}</span> {t('stock.requests.title')}
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  const isNear = Math.abs(page - p) <= 1;
                  const isEdge = p === 1 || p === totalPages;

                  if (isEdge || isNear) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${page === p
                          ? 'bg-[#0c831f] text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
                      >
                        {p}
                      </button>
                    );
                  } else if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-gray-400 px-1 font-bold">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                className={`p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all ${page === totalPages ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryRequests;
