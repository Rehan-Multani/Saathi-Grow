import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card, Spinner, InputGroup, Breadcrumb } from 'react-bootstrap';
import { Save, X, Plus, Trash2, Search, ArrowLeft, Eye, Sparkles, LayoutGrid, TrendingDown, PartyPopper } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import { createCampaign, updateCampaign, getCampaignById } from '../../api/campaignApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const ManageCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(id ? true : false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    highlightText: 'Limited Time Offer!',
    displayType: 'festive',
    bgColor: '#FFEBEF',
    textColor: '#D81B60',
    accentColor: '#E91E63',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts(adminUser.token);
        setProducts(productsData);

        if (id) {
          const campaign = await getCampaignById(adminUser.token, id);
          setFormData({
            title: campaign.title || '',
            subtitle: campaign.subtitle || '',
            highlightText: campaign.highlightText || 'Limited Time Offer!',
            displayType: campaign.displayType || 'festive',
            bgColor: campaign.bgColor || '#FFEBEF',
            textColor: campaign.textColor || '#D81B60',
            accentColor: campaign.accentColor || '#E91E63',
            isActive: campaign.isActive !== undefined ? campaign.isActive : true,
            order: campaign.order || 0
          });
          setSelectedProducts(campaign.products.map(p => ({
            productId: p.productId?._id || p.productId,
            name: p.productId?.name,
            image: p.productId?.image,
            mrp: p.productId?.mrp || p.productId?.basePrice,
            basePrice: p.productId?.basePrice
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setFetching(false);
      }
    };
    if (adminUser?.token) fetchData();
  }, [id, adminUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addProductToCampaign = (product) => {
    if (selectedProducts.find(p => p.productId === product._id)) {
      return toast.warning('Product already added');
    }
    setSelectedProducts([...selectedProducts, {
      productId: product._id,
      name: product.name,
      image: product.image,
      mrp: product.mrp || product.basePrice,
      basePrice: product.basePrice
    }]);
  };

  const removeProduct = (id) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== id));
  };

  const handlePriceChange = (id, price) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.productId === id ? { ...p, basePrice: Number(price) } : p
    ));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      return toast.error('Please add at least one product');
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));

      const productsPayload = selectedProducts.map(p => ({
        productId: p.productId,
        basePrice: p.basePrice
      }));
      data.append('products', JSON.stringify(productsPayload));

      if (id) {
        await updateCampaign(adminUser.token, id, data);
        toast.success('Campaign section updated');
      } else {
        await createCampaign(adminUser.token, data);
        toast.success('Campaign section created');
      }
      navigate('/admin/campaigns');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4 p-md-6">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1 text-gray-800">{id ? 'Edit Festive Section' : 'Create Special Festive Section'}</h4>
          <Breadcrumb className="small mb-0">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/admin/campaigns" }}>Festive Campaigns</Breadcrumb.Item>
            <Breadcrumb.Item active>{id ? 'Edit' : 'Create'}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Button variant="light" as={Link} to="/admin/campaigns" className="d-flex align-items-center gap-2 border shadow-sm px-4">
          <ArrowLeft size={18} /> Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <Sparkles size={20} /> UI Customization
                </h6>

                {/* Display Type Selector */}
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted">Section Display Type</Form.Label>
                  <div className="d-flex gap-3 mt-1">
                    <div
                      onClick={() => setFormData(p => ({ ...p, displayType: 'festive' }))}
                      className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.displayType === 'festive' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <PartyPopper size={24} className={`mx-auto mb-1 ${formData.displayType === 'festive' ? 'text-primary' : 'text-gray-400'}`} />
                      <div className={`small fw-bold ${formData.displayType === 'festive' ? 'text-primary' : 'text-gray-500'}`}>Festive Section</div>
                      <div className="text-[10px] text-muted">Colored card section</div>
                    </div>
                    <div
                      onClick={() => setFormData(p => ({ ...p, displayType: 'lowest_prices' }))}
                      className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.displayType === 'lowest_prices' ? 'border-success bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <TrendingDown size={24} className={`mx-auto mb-1 ${formData.displayType === 'lowest_prices' ? 'text-success' : 'text-gray-400'}`} />
                      <div className={`small fw-bold ${formData.displayType === 'lowest_prices' ? 'text-success' : 'text-gray-500'}`}>Lowest Prices</div>
                      <div className="text-[10px] text-muted">Discount strip section</div>
                    </div>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Section Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Valentine's Week Special"
                    required
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="e.g. Gifts for your loved ones"
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Highlight Pill Text</Form.Label>
                  <Form.Control
                    type="text"
                    name="highlightText"
                    value={formData.highlightText}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>

                <hr className="my-4 opacity-50" />

                {/* Color pickers only for festive type */}
                {formData.displayType === 'festive' && (
                  <Row className="mb-3">
                    <Col md={12} className="mb-3">
                      <Form.Label className="small fw-bold text-muted">Background Color</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="form-control-color border-0 p-0 overflow-hidden rounded-circle" style={{ height: '32px', width: '32px', minWidth: '32px' }} />
                        <Form.Control type="text" value={formData.bgColor} onChange={handleChange} name="bgColor" className="bg-light border-0 font-monospace small" />
                      </div>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Label className="small fw-bold text-muted">Text Color</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="form-control-color border-0 p-0 overflow-hidden rounded-circle" style={{ height: '32px', width: '32px', minWidth: '32px' }} />
                        <Form.Control type="text" value={formData.textColor} onChange={handleChange} name="textColor" className="bg-light border-0 font-monospace small" />
                      </div>
                    </Col>
                    <Col md={12}>
                      <Form.Label className="small fw-bold text-muted">Accent Color (Buttons)</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="form-control-color border-0 p-0 overflow-hidden rounded-circle" style={{ height: '32px', width: '32px', minWidth: '32px' }} />
                        <Form.Control type="text" value={formData.accentColor} onChange={handleChange} name="accentColor" className="bg-light border-0 font-monospace small" />
                      </div>
                    </Col>
                  </Row>
                )}

                {/* Live Preview */}
                {formData.displayType === 'festive' ? (
                  <div className="mt-3 p-4 rounded shadow-sm border" style={{ backgroundColor: formData.bgColor }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: formData.accentColor, color: '#fff', fontSize: '10px' }}>
                        {formData.highlightText}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: formData.textColor }}>Preview</div>
                    </div>
                    <h4 className="fw-bold mb-1" style={{ color: formData.textColor }}>{formData.title || 'Section Title'}</h4>
                    <p className="small mb-0" style={{ color: formData.textColor, opacity: 0.8 }}>{formData.subtitle || 'Subtitle goes here'}</p>
                    <div className="mt-4 text-center">
                      <Button size="sm" className="px-5 py-2 fw-bold" style={{ backgroundColor: formData.accentColor, border: 'none', borderRadius: '8px' }}>ADD</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-4 rounded shadow-sm border" style={{ background: 'linear-gradient(to right, #e8f5e9, #ffffff)' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="bg-success p-1 rounded">
                        <TrendingDown size={14} className="text-white" />
                      </div>
                      <span className="fw-bold text-success small">{formData.title || 'Lowest Prices Ever'}</span>
                    </div>
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border border-danger-subtle bg-danger-subtle">
                      <div className="rounded-circle bg-danger" style={{ width: 8, height: 8 }}></div>
                      <span className="text-danger fw-bold" style={{ fontSize: 10 }}>🔥 {formData.highlightText}</span>
                    </div>
                    <div className="mt-3 d-flex gap-2">
                      {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2 border" style={{ width: 70, height: 90 }}></div>)}
                    </div>
                  </div>
                )}

                <Form.Group className="mt-4">
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label={<span className="fw-bold small text-muted">Visible on App Front</span>}
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-sm min-vh-75">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <Plus size={20} /> Manage Selection & Deal Pricing
                </h6>

                <div className="mb-4 position-relative">
                  <Form.Label className="small fw-bold text-muted">Add Products to this Section</Form.Label>
                  <InputGroup className="shadow-sm rounded-lg overflow-hidden border">
                    <InputGroup.Text className="bg-white border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                    <Form.Control
                      placeholder="Search by product name or SKU code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 py-2"
                    />
                  </InputGroup>

                  {searchTerm && (
                    <div className="border rounded-xl shadow-xl mt-2 bg-white position-absolute w-100 z-3 animate-in fade-in slide-in-from-top-2 duration-200" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {filteredItems.length > 0 ? filteredItems.map(p => (
                        <div key={p._id} className="p-3 border-bottom d-flex align-items-center justify-content-between cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => { addProductToCampaign(p); setSearchTerm(''); }}>
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-white border border-gray-100 p-1 rounded">
                              <img src={p.image} className="rounded" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                            </div>
                            <div>
                              <div className="small fw-bold text-gray-800">{p.name}</div>
                              <div className="text-[11px] text-muted font-mono">{p.sku} | Price: ₹{p.basePrice}</div>
                            </div>
                          </div>
                          <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                            <Plus size={18} />
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-muted small">No products found matching your search.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="bg-blue-50 border-0">
                      <tr>
                        <th className="small fw-bold text-blue-800 border-0 px-3 py-3 rounded-start">Product Details</th>
                        <th className="small fw-bold text-blue-800 border-0 text-center py-3">MRP (₹)</th>
                        <th className="small fw-bold text-blue-800 border-0 text-center py-3">Current Price (₹)</th>
                        <th className="small fw-bold text-blue-800 border-0 text-center py-3">Savings</th>
                        <th className="small fw-bold text-blue-800 border-0 text-center py-3 rounded-end">Action</th>
                      </tr>
                    </thead>
                    <tbody className="border-0">
                      {selectedProducts.length > 0 ? selectedProducts.map(p => (
                        <tr key={p.productId} className="border-bottom border-gray-50">
                          <td className="px-3 py-3 border-0">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-white border border-gray-100 p-1 rounded">
                                <img src={p.image} className="rounded" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                              </div>
                              <div className="small fw-bold text-gray-800">{p.name}</div>
                            </div>
                          </td>
                          <td className="text-center text-gray-400 border-0 py-3">₹{p.mrp}</td>
                          <td className="text-center border-0 py-3" style={{ width: '130px' }}>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={p.basePrice}
                              onChange={(e) => handlePriceChange(p.productId, e.target.value)}
                              className="text-center border shadow-sm fw-bold text-primary bg-white rounded-lg py-1.5"
                            />
                          </td>
                          <td className="text-center border-0 py-3">
                            <div className="px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold d-inline-block border border-green-100">
                              SAVE ₹{p.mrp - p.basePrice}
                            </div>
                          </td>
                          <td className="text-center border-0 py-3">
                            <Button variant="link" className="text-red-400 hover:text-red-600 p-0 transition-colors" onClick={() => removeProduct(p.productId)}>
                              <Trash2 size={18} />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10">
                            <div className="opacity-20 mb-3"><LayoutGrid size={40} className="mx-auto" /></div>
                            <p className="text-muted small">No products have been added to this campaign yet.<br />Use the search bar above to start building your festive collection.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="bg-white border-top fixed-bottom p-3 text-end shadow-lg z-1" style={{ width: 'calc(100% - 260px)', marginLeft: '260px' }}>
          <div className="container-fluid d-flex justify-content-end gap-3">
            <Button variant="light" size="lg" as={Link} to="/admin/campaigns" className="px-5 py-2 fw-medium border shadow-sm">Cancel</Button>
            <Button variant="primary" size="lg" type="submit" disabled={loading} className="px-5 py-2 fw-bold shadow-lg d-flex align-items-center gap-2">
              {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />}
              {id ? 'Update Campaign Section' : 'Publish Section'}
            </Button>
          </div>
        </div>
      </Form>
      <div className="mb-5 py-4"></div>
    </div>
  );
};

export default ManageCampaign;
