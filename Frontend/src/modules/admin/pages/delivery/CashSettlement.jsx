import React, { useState, useEffect } from 'react';
import {
  getCashSettlementList,
  settleRiderCash
} from '../../api/adminDeliveryApi';
import {
  Wallet,
  User,
  CheckCircle,
  RefreshCcw,
  Search,
  AlertCircle,
  HandCoins,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const CashSettlement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState({ totalPendingCash: 0, activeCollectors: 0 });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch
      };
      const response = await getCashSettlementList(params);
      
      const data = response.partners || response;
      setPartners(data);
      
      if (response.stats) {
        setStats(response.stats);
      }
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch settlement list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch]);

  const handleSettle = async (partner) => {
    const result = await Swal.fire({
      title: 'Verify Physical Handover?',
      text: `Are you sure you have received ₹${partner.cashInHand} from ${partner.name}? This will reset their liability.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#028A0F',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Settled!'
    });

    if (result.isConfirmed) {
      try {
        await settleRiderCash(partner._id);
        toast.success(`Settled ₹${partner.cashInHand} with ${partner.name}`);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Settlement failed");
      }
    }
  };

  return (
    <div className="p-4 p-md-6 min-vh-100 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="d-flex align-items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-0">Cash Settlement</h1>
              <PageInfoTooltip info={pageInfoData.cashSettlement} />
          </div>
          <p className="text-sm text-slate-500 font-medium">Reconcile COD collections from physical handovers</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
          title="Refresh Data"
        >
          <RefreshCcw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-all text-slate-600`} />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <Wallet size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Cumulative</span>
              <span className="text-xs font-bold text-slate-500 uppercase">Total Pending Cash</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">
            ₹{stats.totalPendingCash.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <User size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Live Agency</span>
              <span className="text-xs font-bold text-slate-500 uppercase">Active Collectors</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats.activeCollectors} <span className="text-lg font-bold text-slate-400 ml-1">Riders</span></h3>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner relative z-10">
              <CheckCircle size={24} />
            </div>
            <span className="text-sm font-black text-emerald-800 uppercase tracking-wider relative z-10">Policy Hub</span>
          </div>
          <p className="text-xs font-bold text-emerald-700/80 leading-relaxed relative z-10 italic">
            "Physical cash must be collected and verified before clicking 'Settle'. Ensure denomination matching."
          </p>
        </div>
      </div>

      {/* List Table container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#028A0F] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search rider name, phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 ring-emerald-500/20 transition-all font-medium placeholder-slate-400"
            />
          </div>
          {debouncedSearch && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100 animate-in fade-in slide-in-from-right-4">
              Showing Results for: "{debouncedSearch}"
            </span>
          )}
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Rider Information</th>
                <th className="px-8 py-5">Unique Identity</th>
                <th className="px-8 py-5">Last Settlement</th>
                <th className="px-8 py-5 text-center">Liability Amount</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/80">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0"></div>
                        <div className="space-y-2 flex-grow">
                          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-50 rounded w-1/3"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : partners.length > 0 ? (
                partners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 text-nowrap">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                            {partner.profileImage ? (
                              <img src={partner.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 uppercase font-black">
                                {partner.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-base group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{partner.name}</span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Phone size={10} /> {partner.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-mono font-black tracking-widest border border-slate-200 uppercase">
                        {partner.uniqueId}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500">
                          {partner.lastSettledAt ? new Date(partner.lastSettledAt).toLocaleDateString() : 'Initial Collection'}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase leading-none tracking-tighter mt-1">Settlement Cycle</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center px-4 py-2 bg-emerald-50/30 rounded-2xl border border-emerald-100/20 group-hover:bg-emerald-50 transition-colors shadow-sm">
                        <span className="text-xl font-black text-emerald-700 tracking-tighter">₹{partner.cashInHand}</span>
                        <span className="text-[9px] text-emerald-600/60 font-black uppercase tracking-widest mt-0.5">Physical Cash</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleSettle(partner)}
                        className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-slate-900/10 hover:bg-emerald-600 hover:shadow-emerald-600/30 transition-all duration-300 active:scale-95 group/btn"
                      >
                        <HandCoins size={14} className="group-hover/btn:rotate-12 transition-transform" />
                        Acknowledge Collection
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200 border border-slate-100">
                        <AlertCircle size={40} />
                      </div>
                      <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-2">Clean Slate</h4>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                        No pending cash handovers found. Either all collections are settled or collectors haven't reported COD yet.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        {!loading && pagination.total > 0 && (
          <div className="bg-slate-50/40 border-t border-slate-100 px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">
              Showing <span className="text-slate-800">{(page - 1) * limit + 1}</span> 
              <span className="mx-1">to</span> 
              <span className="text-slate-800">{Math.min(page * limit, pagination.total)}</span> 
              <span className="mx-1">of</span> 
              <span className="text-slate-800">{pagination.total}</span> Total Collectors
            </div>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-2.5 rounded-xl border transition-all ${
                  page === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${
                          page === p 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-110' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  } else if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-slate-400 px-1 font-black text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className={`p-2.5 rounded-xl border transition-all ${
                  page === pagination.totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashSettlement;
