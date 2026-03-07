import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import BrandEditModal from '../../components/Brands/BrandEditModal'; // Using vendor specific modal
import { useVendor } from '../../contexts/VendorContext';
import { getBrands, deleteBrand, updateBrand } from '../../../admin/api/brandApi'; // Using admin API
import { toast } from 'react-toastify';

const AllBrands = () => {
  const { vendor } = useVendor();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Pagination State
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

  // Pagination Logic
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
    <div className="p-3">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div>
            <h5 className="mb-1 fw-bold">My Brands & Global Brands</h5>
            <p className="text-muted small mb-0">Manage your own brands and view available marketplace brands.</p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
            <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
              <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
              <Form.Control
                placeholder="Search by name or category..."
                className="border-start-0 ps-0 shadow-none text-xs"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
            <div className="d-flex gap-2">
              <Link to="/vendor/brands/add" className="btn btn-[#0c831f] text-white d-flex align-items-center justify-content-center gap-2 shadow-sm text-xs font-bold px-4 hover:bg-[#0a6b19]" style={{ backgroundColor: '#0c831f' }}>
                <Plus size={18} />
                <span>Add Brand</span>
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="grow" variant="success" />
              <p className="mt-2 text-muted small">Loading brands...</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              <Table hover responsive className="mb-0 align-middle">
                <thead className="bg-[#f8f9fa] border-b">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase">Brand</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase">Category</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase">Type</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((b) => {
                    const isOwnBrand = b.vendor && b.vendor === vendor._id;
                    return (
                      <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="w-10 h-10 rounded bg-white border border-gray-100 p-1 flex-shrink-0 shadow-xs">
                              {b.logo ? (
                                <img src={b.logo} alt={b.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full d-flex align-items-center justify-content-center text-gray-300">
                                  <Tag size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-dark">{b.name}</div>
                              <div className="text-[10px] text-muted truncate max-w-[200px]">{b.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge bg="light" className="text-muted border font-semibold text-[9px] uppercase">
                            {b.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge bg={isOwnBrand ? "success" : "secondary"} className="text-[8px] font-bold px-2 py-1">
                            {isOwnBrand ? "PRIVATE" : "GLOBAL"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {isOwnBrand ? (
                              <>
                                <Button
                                  variant="light" size="sm" className="btn-icon text-[#0c831f] border border-[#0c831f]/10"
                                  onClick={() => handleEdit(b)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="light" size="sm" className="btn-icon text-danger border border-red-50"
                                  onClick={() => handleDelete(b._id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </>
                            ) : (
                              <span className="text-[10px] text-muted italic font-medium">Read-Only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {/* Pagination UI */}
              {totalItems > 0 && (
                <div className="px-4 py-3 border-t bg-gray-50 flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                  <div className="text-[11px] text-gray-500 font-medium">
                    Showing <span className="text-dark font-bold">{indexOfFirstItem + 1}</span> to <span className="text-dark font-bold">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="text-dark font-bold">{totalItems}</span> results
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Button
                      variant="white" size="sm"
                      className="p-1 border shadow-xs hover:bg-white disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1;
                      // Only show 5 pages nearby if many pages
                      if (totalPages > 7) {
                        if (p !== 1 && p !== totalPages && Math.abs(currentPage - p) > 1) {
                          if (p === 2 && currentPage > 3) return <span key="dots1" className="text-muted px-1 text-xs">...</span>;
                          if (p === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" className="text-muted px-1 text-xs">...</span>;
                          return null;
                        }
                      }

                      return (
                        <Button
                          key={p}
                          variant={currentPage === p ? "success" : "white"}
                          size="sm"
                          className={`w-8 h-8 p-0 border shadow-xs font-bold text-[11px] ${currentPage === p ? 'bg-[#0c831f] border-[#0c831f] text-white' : 'bg-white hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      );
                    })}

                    <Button
                      variant="white" size="sm"
                      className="p-1 border shadow-xs hover:bg-white disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <Tag size={40} className="text-muted mb-3 opacity-20" />
              <h6 className="fw-bold">No Brands Found</h6>
              <p className="text-xs text-muted">No brands match your current search.</p>
              <Link to="/vendor/brands/add" className="btn btn-[#0c831f] text-white btn-sm mt-2 px-4 font-bold" style={{ backgroundColor: '#0c831f' }}>Add Brand</Link>
            </div>
          )}
        </Card.Body>
      </Card>

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
