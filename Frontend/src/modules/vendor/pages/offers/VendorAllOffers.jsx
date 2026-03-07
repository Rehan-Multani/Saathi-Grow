import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, LayoutGrid, Image as ImageIcon, RefreshCcw, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useVendor } from '../../contexts/VendorContext';
import { getVendorOffers, deleteVendorOffer } from '../../api/vendorOfferApi';

const VendorAllOffers = () => {
  const navigate = useNavigate();
  const { vendor } = useVendor();
  const token = vendor?.token;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getVendorOffers(token);
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load your offer deals');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove banner offer "${title}"? This action cannot be undone.`)) return;
    try {
      await deleteVendorOffer(token, id);
      setOffers(prev => prev.filter(o => o._id !== id));
      toast.success('Offer removed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Banner Offers & Deals</h1>
          <p className="text-xs text-gray-500 font-medium">Create premium banners that showcase your products to customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/vendor/offers/create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c831f] hover:bg-[#0a6b19] text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Create Banner Offer
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-[180px] bg-gray-200" />
                <div className="p-4 flex gap-3">
                  <div className="h-4 bg-gray-200 rounded flex-1" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {offers.map(o => (
              <div key={o._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                {/* Banner Image */}
                <div className="relative h-[180px] bg-gray-100">
                  {o.bannerImage ? (
                    <img src={o.bannerImage} className="w-full h-full object-cover" alt={o.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm ${o.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                      {o.isActive ? 'Active' : 'Offline'}
                    </span>
                    {o.discountPercentage > 0 && (
                      <span className="bg-[#f7cb15] text-gray-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                        {o.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  {/* Overlay info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h6 className="text-white font-bold mb-0">{o.title}</h6>
                    {o.subtitle && <p className="text-white/80 text-xs mb-0">{o.subtitle}</p>}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <LayoutGrid size={13} />
                      <span>{o.products?.length || 0} Products</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Tag size={13} />
                      <span>{o.displayLocation}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/vendor/offers/edit/${o._id}`)}
                      className="p-1.5 rounded-lg bg-[#0c831f]/10 text-[#0c831f] hover:bg-[#0c831f]/20 transition-colors border border-[#0c831f]/20"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(o._id, o.title)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <div className="w-16 h-16 bg-[#0c831f]/10 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={28} className="text-[#0c831f]" />
            </div>
            <h5 className="font-bold text-gray-700 mb-2">No Banner Offers Yet</h5>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Create visually appealing banners to showcase your products and attract more customers.
            </p>
            <button
              onClick={() => navigate('/vendor/offers/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0c831f] text-white rounded-lg font-medium hover:bg-[#0a6b19] transition-colors shadow-sm text-sm"
            >
              <Plus size={16} /> Create First Banner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorAllOffers;
