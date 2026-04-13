import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import BrandEditModal from '../../components/Brands/BrandEditModal'; 
import { useVendor } from '../../contexts/VendorContext';
import { getBrands, deleteBrand, updateBrand } from '../../../../common/api/brandApi';
import { toast } from 'react-toastify';

const AllBrands = () => {
  const { vendor } = useVendor();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBrands(vendor.token);
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, [vendor.token]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirmation('Delete Brand', 'Are you sure you want to delete this brand? This action cannot be undone.');
    if (result.isConfirmed) {
      try {
        await deleteBrand(vendor.token, id);
        setBrands(brands.filter(b => b._id !== id));
        await showSuccessAlert('Deleted!', 'Brand has been deleted.');
      } catch (error) {
        showErrorAlert('Error', error.message || 'Failed to delete brand');
      }
    }
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setShowEditModal(true);
  };

  const handleSave = async (updatedBrandData) => {
    try {
      const updated = await updateBrand(vendor.token, selectedBrand._id, updatedBrandData);
      setBrands(brands.map(b => b._id === updated._id ? updated : b));
      toast.success('Brand updated successfully');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update brand');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Brands</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">View global brands and manage your private ones.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              placeholder="Search by name or category..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Link to="/vendor/brands/add" className="bg-[#0c831f] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#0a6b19] transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus size={18} />
            Add Brand
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0c831f] rounded-full animate-spin mb-4"></div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Brands...</p>
          </div>
        ) : paginatedData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((b) => {
                    const isOwnBrand = b.vendor && b.vendor === vendor._id;
                    return (
                      <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1.5 flex items-center justify-center shadow-sm shrink-0">
                              {b.logo ? (
                                <img src={b.logo} alt={b.name} className="w-full h-full object-contain" />
                              ) : (
                                <Tag size={20} className="text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{b.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{b.description || 'No description available'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-gray-100/80 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                            {b.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${isOwnBrand ? 'bg-green-50 text-[#0c831f] border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {isOwnBrand ? "PRIVATE" : "GLOBAL"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOwnBrand ? (
                              <>
                                <button
                                  className="p-2 text-gray-400 border border-gray-200 rounded-lg shadow-sm hover:text-[#0c831f] hover:bg-green-50 hover:border-green-200 transition-colors"
                                  onClick={() => handleEdit(b)}
                                  title="Edit Brand"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="p-2 text-gray-400 border border-gray-200 rounded-lg shadow-sm hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                                  onClick={() => handleDelete(b._id)}
                                  title="Delete Brand"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic pr-2">Read-Only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalItems > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs font-medium text-gray-500">
                  Showing <span className="text-gray-900 font-bold">{indexOfFirstItem + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="text-gray-900 font-bold">{totalItems}</span> results
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1.5 border border-gray-200 rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (totalPages > 7) {
                      if (p !== 1 && p !== totalPages && Math.abs(currentPage - p) > 1) {
                        if (p === 2 && currentPage > 3) return <span key="dots1" className="text-gray-400 px-1 text-xs">...</span>;
                        if (p === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" className="text-gray-400 px-1 text-xs">...</span>;
                        return null;
                      }
                    }

                    return (
                      <button
                        key={p}
                        className={`w-8 h-8 rounded-lg text-xs font-bold shadow-sm transition-colors border ${currentPage === p ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    className="p-1.5 border border-gray-200 rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
               <Tag size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Brands Found</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">There are no brands matching your current search.</p>
            <Link to="/vendor/brands/add" className="bg-[#0c831f] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#0a6b19] transition-colors">
              Add New Brand
            </Link>
          </div>
        )}
      </div>

      <BrandEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        brand={selectedBrand}
        onSave={handleSave}
      />
    </div>
  );
};

export default AllBrands;
