import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, LayoutGrid, Image as ImageIcon, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getOfferDeals, deleteOfferDeal } from '../../api/offerDealApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';

const AllOffers = () => {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOfferDeals(adminUser.token);
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offer deals');
    } finally {
      setLoading(false);
    }
  }, [adminUser.token]);

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
    const result = await showDeleteConfirmation('Delete Offer Deal?', `Are you sure you want to remove "${title}"?`);
    if (result.isConfirmed) {
      try {
        await deleteOfferDeal(adminUser.token, id);
        setOffers(offers.filter(o => o._id !== id));
        showSuccessAlert('Deleted!', 'Offer has been removed.');
      } catch (error) {
        showErrorAlert('Error', error.message);
      }
    }
  };

  return (
    <div className="p-4 p-md-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h5 className="mb-0 font-bold text-gray-800 text-lg">Banner Offers & High-Yield Deals</h5>
            <p className="text-muted small mb-0">Manage premium banners that showcase specific product collections on the user home screen.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Create New Banner Offer</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-10">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted text-sm">Loading offers...</p>
          </div>
        ) : offers.length > 0 ? (
          offers.map((o) => (
            <div key={o._id} className="col-md-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-100 transition-all hover:shadow-md">
                <div className="relative h-[180px] bg-gray-100">
                  <img
                    src={o.bannerImage}
                    className="w-full h-full object-cover"
                    alt={o.title}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge bg={o.isActive ? 'success' : 'secondary'} className="shadow-sm">
                      {o.isActive ? 'Active' : 'Offline'}
                    </Badge>
                    <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-700 shadow-sm border border-white/20">
                      PRIORITY: {o.order}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <h6 className="text-white fw-bold mb-0">{o.title}</h6>
                    <p className="text-white/80 text-xs mb-0">{o.subtitle}</p>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center justify-between border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <LayoutGrid size={14} />
                      <span>{o.products.length} Products</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <ImageIcon size={14} />
                      <span>{o.displayLocation}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(o._id)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(o._id, o.title)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-20 bg-white rounded-xl border border-dashed text-gray-400 border-gray-200">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
            <h6 className="fw-bold text-gray-400">No Offer Banners Found</h6>
            <p className="small mb-4 text-gray-400">Create visually appealing banners to push your products to the top of the user feed.</p>
            <button onClick={handleCreate} className="btn btn-primary btn-sm px-4">Start Creating</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOffers;
