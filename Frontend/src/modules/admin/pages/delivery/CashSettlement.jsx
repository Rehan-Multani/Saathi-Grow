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
  HandCoins
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const CashSettlement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCashSettlementList();
      setPartners(data);
    } catch (error) {
      toast.error("Failed to fetch settlement list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        toast.success(`Settled ₹${partner.cashInHand} with ${partner.name} `);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Settlement failed");
      }
    }
  };

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Rider Cash Settlement</h1>
          <p className="text-sm text-slate-500">Reconcile COD collections from physical handovers</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Pending Cash</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            ₹{partners.reduce((acc, curr) => acc + curr.cashInHand, 0).toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Collectors</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{partners.length} Riders</h3>
        </div>

        <div className="bg-[#028A0F]/5 p-6 rounded-3xl border border-[#028A0F]/10 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#028A0F]/10 text-[#028A0F] flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <span className="text-sm font-bold text-[#028A0F] uppercase tracking-wider">Policy</span>
          </div>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            Physical cash must be collected and verified before clicking 'Settle'.
          </p>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search rider name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 ring-[#028A0F]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Rider</th>
                <th className="px-6 py-4">Unique ID</th>
                <th className="px-6 py-4">Cash on Hand</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-8 h-4 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : filteredPartners.length > 0 ? (
                filteredPartners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                          {partner.profileImage ? (
                            <img src={partner.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <User size={20} />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-700">{partner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400">{partner.uniqueId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-[#028A0F]">₹{partner.cashInHand}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Handover</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSettle(partner)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#028A0F] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#028A0F]/20 hover:scale-105 transition-all ml-auto"
                      >
                        <HandCoins size={14} />
                        Settle Now
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <AlertCircle size={48} className="mb-2" />
                      <p className="font-bold uppercase tracking-widest text-sm">No pending cash found</p>
                    </div>
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

export default CashSettlement;
