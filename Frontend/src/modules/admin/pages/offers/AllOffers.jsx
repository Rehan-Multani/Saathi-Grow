import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, LayoutGrid, Image as ImageIcon, Search, RefreshCw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getOfferDeals, deleteOfferDeal } from '../../api/offerDealApi';
import Swal from 'sweetalert2';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllOffers = () => {
  const { t } = useTranslation('admin_offers');
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getOfferDeals(adminUser.token);
      setOffers(Array.isArray(data) ? data : []);
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
    navigate('/admin/offers/deals/add');
  };

  const handleEdit = (id) => {
    navigate(`/admin/offers/deals/edit/${id}`);
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
          await deleteOfferDeal(adminUser.token, id);
          setOffers(offers.filter(o => o._id !== id));
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

  const filteredOffers = offers.filter(o => 
    o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
            <PageInfoTooltip data={pageInfoData.allOffers} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && !refreshing ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-[280px] bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse"></div>
          ))
        ) : filteredOffers.length > 0 ? (
          filteredOffers.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md hover:border-blue-200">
              <div className="relative h-[200px] bg-slate-50 overflow-hidden">
                <img
                  src={o.bannerImage}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={o.title}
                />
                <div className="absolute top-4 right-4 shadow-lg">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                    o.isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-400 text-white border-slate-400'
                  }`}>
                    {o.isActive ? t('status.active') : t('status.offline')}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-slate-900/60 to-transparent">
                  <h3 className="text-white text-sm font-bold uppercase tracking-tight">{o.title}</h3>
                  <p className="text-white/80 text-[10px] font-bold mt-0.5 uppercase tracking-wide truncate">{o.subtitle}</p>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-wide">
                    <LayoutGrid size={14} className="text-blue-500" />
                    {t('products_count', { count: o.products.length })}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {!o.vendor && (
                    <button
                      onClick={() => handleEdit(o._id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(o._id, o.title)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 py-24 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <ImageIcon size={40} className="text-slate-200" />
            </div>
            <div>
              <h3 className="text-slate-800 font-bold uppercase tracking-wide text-xs mb-1">{t('empty_state')}</h3>
              <p className="text-slate-400 text-[11px] font-medium max-w-xs mx-auto">{t('empty_subtitle')}</p>
            </div>
            <button 
              onClick={handleCreate} 
              className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all outline-none"
            >
              {t('start_creating')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOffers;
