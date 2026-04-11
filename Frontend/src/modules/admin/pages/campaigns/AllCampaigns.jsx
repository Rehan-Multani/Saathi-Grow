import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, LayoutGrid, Search, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCampaigns, deleteCampaign } from '../../api/campaignApi';
import Swal from 'sweetalert2';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllCampaigns = () => {
  const { t } = useTranslation('admin_campaigns');
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getCampaigns(adminUser.token);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(t('messages.fetch_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminUser.token, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    navigate('/admin/campaigns/add');
  };

  const handleEdit = (id) => {
    navigate(`/admin/campaigns/edit/${id}`);
  };

  const handleDelete = async (id, title) => {
    Swal.fire({
      title: t('messages.delete_confirm_title'),
      text: t('messages.delete_confirm_msg', { name: title }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCampaign(adminUser.token, id);
          setCampaigns(campaigns.filter(c => c._id !== id));
          Swal.fire({
            title: t('messages.delete_success'),
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
            <PageInfoTooltip data={pageInfoData.allCampaigns} />
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-xs font-bold text-slate-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
          >
            <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100"
          >
            <Plus size={16} />
            <span>{t('add_new')}</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && !refreshing ? (
          [1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse h-48"></div>
          ))
        ) : filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md hover:border-blue-200">
               <div className="p-6 relative overflow-hidden" style={{ backgroundColor: c.bgColor + '15' }}>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span 
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight shadow-sm border"
                      style={{ backgroundColor: c.bgColor, color: c.textColor, borderColor: c.textColor + '20' }}
                    >
                      {c.highlightText}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                      c.isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-400 text-white border-slate-400'
                    }`}>
                      {c.isActive ? t('status.active') : t('status.offline')}
                    </span>
                  </div>

                  <h3 className="text-slate-900 text-sm font-bold leading-tight uppercase tracking-tight mb-1 truncate">{c.title}</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide truncate mb-5">{c.subtitle}</p>

                  <div className="flex items-center -space-x-3">
                    {c.products.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-lg ring-2 ring-white shadow-sm overflow-hidden bg-white border border-slate-100">
                        <img src={p.productId?.image} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                    {c.products.length > 5 && (
                      <div className="w-8 h-8 rounded-lg ring-2 ring-white shadow-sm bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                        +{c.products.length - 5}
                      </div>
                    )}
                  </div>
               </div>

               <div className="p-5 flex items-center justify-between border-t border-slate-50 bg-white">
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                      c.displayType === 'lowest_prices' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {c.displayType === 'lowest_prices' ? t('types.lowest_prices') : t('types.festive')}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase ml-1">
                      <LayoutGrid size={12} />
                      {c.products.length}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {!c.vendor && (
                      <button
                        onClick={() => handleEdit(c._id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c._id, c.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
               <Sparkles size={40} className="text-slate-200" />
            </div>
            <div>
              <h3 className="text-slate-800 font-bold uppercase tracking-wide text-xs mb-1">{t('empty_state')}</h3>
              <p className="text-slate-400 text-[11px] font-medium max-w-xs mx-auto">{t('empty_subtitle')}</p>
            </div>
            <button 
              onClick={handleCreate} 
              className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all outline-none"
            >
              {t('add_new')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCampaigns;
