import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, InputGroup, Table, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { Search, Package, Check, Plus } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { toast } from 'react-toastify';

/**
 * ProductPickerModal - A production-level multi-select product picker.
 * Specifically excludes vendor products for admin banner/campaign management.
 */
const ProductPickerModal = ({ show, onHide, onSelect, existingProductIds = [], token }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stagedProducts, setStagedProducts] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories(token);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts(token, {
        search: searchTerm,
        category: selectedCategory,
        page,
        limit: 15, // Keep it usable but compact
        source: 'branch' // EXCLUDE VENDOR PRODUCTS
      });
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, selectedCategory, page]);

  useEffect(() => {
    if (show) {
      fetchCategories();
      fetchProducts();
      setStagedProducts([]);
    }
  }, [show, fetchCategories, fetchProducts]);

  const toggleProduct = (product) => {
    if (stagedProducts.find(p => p._id === product._id)) {
      setStagedProducts(stagedProducts.filter(p => p._id !== product._id));
    } else {
      setStagedProducts([...stagedProducts, product]);
    }
  };

  const handleConfirm = () => {
    onSelect(stagedProducts);
    onHide();
  };

  const isChecked = (id) => !!stagedProducts.find(p => p._id === id);
  const isAlreadyAdded = (id) => existingProductIds.includes(id);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 p-2 rounded-lg me-3 text-primary">
            <Package size={24} />
          </div>
          <div>
            <div className="h5 mb-0 fw-bold">Select Products</div>
            <div className="text-muted small fw-normal">Excluding vendor products for local deals</div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <Row className="mb-3 g-3">
          <Col md={6}>
            <InputGroup className="bg-light border-0 rounded-xl overflow-hidden px-2 shadow-sm">
              <InputGroup.Text className="bg-transparent border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
              <Form.Control
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="bg-transparent border-0 shadow-none py-2 text-sm"
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select 
              className="bg-light border-0 py-2 rounded-xl text-sm shadow-none px-3"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
             <div className="bg-blue-600 text-white h-full d-flex align-items-center justify-content-center rounded-xl fw-bold text-sm shadow-sm px-2 py-2">
                {stagedProducts.length} Selected
             </div>
          </Col>
        </Row>

        <div className="table-responsive" style={{ minHeight: '450px' }}>
          <Table hover className="align-middle border-0">
            <thead className="bg-light text-muted small text-uppercase font-bold border-0">
              <tr>
                <th className="border-0 ps-3" style={{ width: '50px' }}></th>
                <th className="border-0">Product Details</th>
                <th className="border-0 text-center">Category</th>
                <th className="border-0 text-center">Stock Info</th>
                <th className="border-0 text-end pe-3">Market Price</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="lg" />
                    <p className="mt-3 text-muted fw-medium">Searching catalog...</p>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map(p => (
                  <tr 
                    key={p._id} 
                    className={`cursor-pointer transition-all border-bottom-0 ${isChecked(p._id) ? 'bg-blue-50' : ''} ${isAlreadyAdded(p._id) ? 'opacity-40 grayscale-sm' : 'hover:bg-gray-50'}`}
                    onClick={() => !isAlreadyAdded(p._id) && toggleProduct(p)}
                  >
                    <td className="ps-3 border-0">
                      <div className={`w-5 h-5 rounded d-flex align-items-center justify-content-center border ${isChecked(p._id) || isAlreadyAdded(p._id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {isChecked(p._id) || isAlreadyAdded(p._id) ? <Check size={14} className="text-white" /> : null}
                      </div>
                    </td>
                    <td className="border-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img src={p.image} className="w-12 h-12 rounded-lg border object-cover shadow-xs" alt="" />
                        <div>
                          <div className="fw-bold text-gray-800 mb-0.5">{p.name}</div>
                          <div className="d-flex align-items-center gap-2">
                             <span className="text-[10px] text-muted font-mono bg-gray-100 px-1.5 py-0.5 rounded uppercase">{p.sku}</span>
                             {isAlreadyAdded(p._id) && <span className="text-[9px] fw-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Already Added</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center border-0">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-[9px] fw-black uppercase tracking-widest border border-indigo-100">
                        {p.category}
                      </span>
                    </td>
                    <td className="text-center border-0">
                      {(() => {
                        // Calculate total stock across all branches if individual stock is not set/aggregated
                        const totalStock = (p.branchStocks && p.branchStocks.length > 0)
                          ? p.branchStocks.reduce((sum, bs) => sum + (bs.stock || 0), 0)
                          : (p.stock || 0);
                        
                        return (
                          <div className={`text-[11px] fw-bold ${totalStock <= (p.lowStockThreshold || 10) ? 'text-danger' : 'text-success'}`}>
                            {totalStock} {p.unitType || 'units'}
                          </div>
                        );
                      })()}
                      {p.branchStocks && p.branchStocks.length > 0 && (
                        <div className="mt-1 d-flex flex-wrap justify-content-center gap-1">
                          {p.branchStocks.map((bs, i) => bs.branchId && (
                             <Badge key={i} className="text-[8px] bg-blue-50 text-blue-700 border border-blue-100 fw-bold py-0.5 px-1.5 uppercase shadow-none">
                                {bs.branchId.name || 'Branch'}
                             </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-end border-0 pe-3">
                       <span className="fw-bold text-gray-800">₹{p.basePrice}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="text-muted small">No products found for the current selection.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Modal Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 px-2">
           <div className="text-muted small">
              Page {page} of {totalPages}
           </div>
           <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
           </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 pb-4 px-4">
        <div className="me-auto text-muted small">
           {stagedProducts.length} new items will be added. Click to confirm.
        </div>
        <Button variant="light" onClick={onHide} className="fw-bold px-4 py-2 text-gray-600">Dismiss</Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm} 
          disabled={stagedProducts.length === 0}
          className="fw-bold px-5 py-2 shadow-sm d-flex align-items-center gap-2"
        >
          <Plus size={18} /> Confirm Selection
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductPickerModal;
