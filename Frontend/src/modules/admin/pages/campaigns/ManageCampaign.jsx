import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card, Spinner, InputGroup, Breadcrumb, Badge } from 'react-bootstrap';
import { Save, X, Plus, Trash2, Search, ArrowLeft, Eye, Sparkles, LayoutGrid, TrendingDown, PartyPopper } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { createCampaign, updateCampaign, getCampaignById } from '../../api/campaignApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import ProductPickerModal from '../../components/common/ProductPickerModal';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const ManageCampaign = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(id ? true : false);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        const [categoriesData] = await Promise.all([
          getCategories(adminUser.token)
        ]);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

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
        toast.error(t('common.error_loading', { defaultValue: 'Failed to load data' }));
      } finally {
        setFetching(false);
      }
    };
    if (adminUser?.token) fetchData();
  }, [id, adminUser, t]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePickerSelect = (newProducts) => {
    const formatted = newProducts.map(product => ({
      productId: product._id,
      name: product.name,
      image: product.image,
      mrp: product.mrp || product.basePrice,
      basePrice: product.basePrice
    }));

    setSelectedProducts([...selectedProducts, ...formatted]);
    toast.success(t('campaigns.alerts.products_added', { count: formatted.length, defaultValue: `${formatted.length} products added to campaign` }));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const handlePriceChange = (productId, price) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.productId === productId ? { ...p, basePrice: price === '' ? '' : Number(price) } : p
    ));
  };

  const paginatedProducts = selectedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(selectedProducts.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      return toast.error(t('campaigns.alerts.no_products', { defaultValue: 'Please add at least one product' }));
    }

    setLoading(true);
    try {
      const payload = {
          ...formData,
          products: selectedProducts.map(p => ({
            productId: p.productId,
            basePrice: p.basePrice
          }))
      };

      if (id) {
        await updateCampaign(adminUser.token, id, payload);
        toast.success(t('campaigns.alerts.update_success'));
      } else {
        await createCampaign(adminUser.token, payload);
        toast.success(t('campaigns.alerts.create_success'));
      }
      navigate('/admin/campaigns');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-1 text-gray-800">{id ? t('campaigns.edit') : t('campaigns.add_new')}</h4>
            <PageInfoTooltip info={pageInfoData.manageCampaign} />
          </div>
          <Breadcrumb className="small mb-0">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/admin/campaigns" }}>{t('campaigns.title')}</Breadcrumb.Item>
            <Breadcrumb.Item active>{id ? t('common.edit') : t('common.create')}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Button variant="light" as={Link} to="/admin/campaigns" className="d-flex align-items-center gap-2 border shadow-sm px-4">
          <ArrowLeft size={18} /> {t('common.back', { defaultValue: 'Back' })}
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <Sparkles size={20} /> {t('campaigns.form.ui_customization')}
                </h6>

                {/* Display Type Selector */}
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted">{t('campaigns.form.display_type')}</Form.Label>
                  <div className="d-flex gap-3 mt-1">
                    <div
                      onClick={() => setFormData(p => ({ ...p, displayType: 'festive' }))}
                      className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.displayType === 'festive' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <PartyPopper size={24} className={`mx-auto mb-1 ${formData.displayType === 'festive' ? 'text-primary' : 'text-gray-400'}`} />
                      <div className={`small fw-bold ${formData.displayType === 'festive' ? 'text-primary' : 'text-gray-500'}`}>{t('campaigns.form.festive_type')}</div>
                    </div>
                    <div
                      onClick={() => setFormData(p => ({ ...p, displayType: 'lowest_prices' }))}
                      className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.displayType === 'lowest_prices' ? 'border-success bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <TrendingDown size={24} className={`mx-auto mb-1 ${formData.displayType === 'lowest_prices' ? 'text-success' : 'text-gray-400'}`} />
                      <div className={`small fw-bold ${formData.displayType === 'lowest_prices' ? 'text-success' : 'text-gray-500'}`}>{t('campaigns.form.lowest_price_type')}</div>
                    </div>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">{t('products.form.name')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t('campaigns.form.placeholder.title')}
                    required
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">{t('products.form.description')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder={t('campaigns.form.placeholder.subtitle')}
                    className="py-2"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">{t('campaigns.form.pill_text')}</Form.Label>
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
                      <Form.Label className="small fw-bold text-muted">{t('campaigns.form.bg_color')}</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="form-control-color border-0 p-0 overflow-hidden rounded-circle" style={{ height: '32px', width: '32px', minWidth: '32px' }} />
                        <Form.Control type="text" value={formData.bgColor} onChange={handleChange} name="bgColor" className="bg-light border-0 font-monospace small" />
                      </div>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Label className="small fw-bold text-muted">{t('campaigns.form.text_color')}</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="form-control-color border-0 p-0 overflow-hidden rounded-circle" style={{ height: '32px', width: '32px', minWidth: '32px' }} />
                        <Form.Control type="text" value={formData.textColor} onChange={handleChange} name="textColor" className="bg-light border-0 font-monospace small" />
                      </div>
                    </Col>
                    <Col md={12}>
                      <Form.Label className="small fw-bold text-muted">{t('campaigns.form.accent_color')}</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="form-control-color border-0 p-0 overflow-hidden rounded-circle" style={{ height: '32px', width: '32px', minWidth: '32px' }} />
                        <Form.Control type="text" value={formData.accentColor} onChange={handleChange} name="accentColor" className="bg-light border-0 font-monospace small" />
                      </div>
                    </Col>
                  </Row>
                )}

                {/* Live Preview */}
                <div className="mt-3">
                    <h6 className="small fw-bold text-muted mb-2">{t('common.preview', { defaultValue: 'Live Preview' })}</h6>
                    {formData.displayType === 'festive' ? (
                    <div className="p-4 rounded shadow-sm border" style={{ backgroundColor: formData.bgColor }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: formData.accentColor, color: '#fff', fontSize: '10px' }}>
                            {formData.highlightText}
                        </div>
                        </div>
                        <h4 className="fw-bold mb-1" style={{ color: formData.textColor }}>{formData.title || 'Section Title'}</h4>
                        <p className="small mb-0" style={{ color: formData.textColor, opacity: 0.8 }}>{formData.subtitle || 'Subtitle goes here'}</p>
                    </div>
                    ) : (
                    <div className="p-4 rounded shadow-sm border" style={{ background: 'linear-gradient(to right, #e8f5e9, #ffffff)' }}>
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
                    </div>
                    )}
                </div>

                <Form.Group className="mt-4">
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label={<span className="fw-bold small text-muted">{t('campaigns.form.visible_front')}</span>}
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
                  <Plus size={20} /> {t('campaigns.table.manage_selection')}
                </h6>

                <div className="mb-4">
                  <div className="d-flex flex-column align-items-center justify-content-center p-5 border-2 border-dashed rounded-4 bg-light cursor-pointer" onClick={() => setShowPicker(true)}>
                    <div className="bg-white p-3 rounded-circle shadow-sm text-primary mb-3">
                      <Plus size={28} />
                    </div>
                    <div className="fw-bold text-dark">{t('campaigns.table.browse_add')}</div>
                    <div className="text-muted small text-center mt-1 px-4">{t('campaigns.table.browse_help')}</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="bg-light border-0">
                      <tr>
                        <th className="small fw-bold text-muted border-0 px-3 py-3">{t('campaigns.table.product_details')}</th>
                        <th className="small fw-bold text-muted border-0 text-center py-3">{t('products.form.mrp')}</th>
                        <th className="small fw-bold text-muted border-0 text-center py-3">{t('products.form.base_price')}</th>
                        <th className="small fw-bold text-muted border-0 text-center py-3">{t('campaigns.table.savings')}</th>
                        <th className="small fw-bold text-muted border-0 text-center py-3">{t('locations.branches.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="border-0">
                      {paginatedProducts.length > 0 ? paginatedProducts.map(p => (
                        <tr key={p.productId}>
                          <td className="px-3 py-3 border-0">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-white border border-light p-1 rounded">
                                <img src={p.image} className="rounded" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                              </div>
                              <div className="small fw-bold text-dark">{p.name}</div>
                            </div>
                          </td>
                          <td className="text-center text-muted border-0 py-3">₹{p.mrp}</td>
                          <td className="text-center border-0 py-3" style={{ width: '130px' }}>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={p.basePrice}
                              onFocus={(e) => { if (p.basePrice === 0 || p.basePrice === "0") handlePriceChange(p.productId, '') }}
                              onBlur={(e) => { if (p.basePrice === "" || p.basePrice === null) handlePriceChange(p.productId, 0) }}
                              onChange={(e) => handlePriceChange(p.productId, e.target.value)}
                              className="text-center fw-bold text-primary"
                            />
                          </td>
                          <td className="text-center border-0 py-3">
                            <Badge bg="success-soft" className="text-success fw-bold">
                              {t('campaigns.table.save_amount', { amount: p.mrp - p.basePrice, defaultValue: `SAVE ₹${p.mrp - p.basePrice}` })}
                            </Badge>
                          </td>
                          <td className="text-center border-0 py-3">
                            <Button variant="link" className="text-danger p-0" onClick={() => removeProduct(p.productId)}>
                              <Trash2 size={18} />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="opacity-25 mb-3"><LayoutGrid size={40} className="mx-auto" /></div>
                            <p className="text-muted small">{t('common.no_data', { defaultValue: 'No products selected.' })}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {selectedProducts.length > itemsPerPage && (
                  <div className="d-flex justify-content-between align-items-center mt-3 px-2">
                    <div className="text-muted small">
                      {t('categories.pagination.showing')} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, selectedProducts.length)} {t('categories.pagination.of')} {selectedProducts.length}
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="light" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        {t('common.prev', { defaultValue: 'Prev' })}
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        {t('common.next', { defaultValue: 'Next' })}
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="bg-white border-top fixed-bottom p-3 text-end shadow-lg" style={{ left: '260px', right: 0, zIndex: 1000 }}>
          <div className="d-flex justify-content-end gap-3 px-4">
            <Button variant="light" as={Link} to="/admin/campaigns" className="px-5">{t('common.cancel')}</Button>
            <Button variant="primary" type="submit" disabled={loading} className="px-5 d-flex align-items-center gap-2">
              {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />}
              {id ? t('campaigns.form.update') : t('campaigns.form.publish')}
            </Button>
          </div>
        </div>
      </Form>
      <ProductPickerModal
        show={showPicker}
        onHide={() => setShowPicker(false)}
        onSelect={handlePickerSelect}
        existingProductIds={selectedProducts.map(p => p.productId)}
        token={adminUser?.token}
      />
      <div className="mb-5 py-4"></div>
    </div>
  );
};

export default ManageCampaign;
