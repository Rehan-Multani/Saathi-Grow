import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, LayoutGrid } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCampaigns, deleteCampaign } from '../../api/campaignApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';

const AllCampaigns = () => {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCampaigns(adminUser.token);
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [adminUser.token]);

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
    const result = await showDeleteConfirmation('Delete Campaign Section?', `Are you sure you want to remove "${title}"?`);
    if (result.isConfirmed) {
      try {
        await deleteCampaign(adminUser.token, id);
        setCampaigns(campaigns.filter(c => c._id !== id));
        showSuccessAlert('Deleted!', 'Section has been removed.');
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
            <h5 className="mb-0 font-bold text-gray-800 text-lg">Festive & Special Campaign Sections</h5>
            <p className="text-muted small mb-0">Create and manage customizable UI sections for your mobile app & web frontend.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-10">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted text-sm">Loading campaign sections...</p>
          </div>
        ) : campaigns.length > 0 ? (
          campaigns.map((c) => (
            <div key={c._id} className="col-md-6 col-xl-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-100 transition-all hover:shadow-md">
                <div className="p-4 flex-grow-1" style={{ backgroundColor: c.bgColor + '20' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: c.bgColor, color: c.textColor }}
                    >
                      {c.highlightText}
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </div>
                  </div>
                  <h6 className="font-bold text-gray-800 mb-1">{c.title}</h6>
                  <p className="text-xs text-gray-500 mb-3">{c.subtitle}</p>

                  <div className="flex -space-x-2 overflow-hidden mb-4">
                    {c.products.slice(0, 5).map((p, idx) => (
                      <img
                        key={idx}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-white"
                        src={p.productId?.image}
                        alt=""
                      />
                    ))}
                    {c.products.length > 5 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        +{c.products.length - 5}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide ${c.displayType === 'lowest_prices' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                      {c.displayType === 'lowest_prices' ? '📉 Lowest Prices' : '🎉 Festive'}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <LayoutGrid size={14} />
                      {c.products.length} Products
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(c._id)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id, c.title)}
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
          <div className="col-12 text-center py-10 bg-white rounded-xl border border-dashed text-gray-400">
            <Eye size={40} className="mx-auto mb-3 opacity-20" />
            <p>No campaign sections found. Create your first festive deal!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCampaigns;
