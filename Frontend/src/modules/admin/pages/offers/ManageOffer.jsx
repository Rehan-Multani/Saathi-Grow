import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Row, Col, Card, Spinner, InputGroup, Breadcrumb } from 'react-bootstrap';
import { Save, X, Plus, Trash2, Search, ArrowLeft, Image as ImageIcon, Sparkles, LayoutGrid, Upload, Percent } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { createOfferDeal, updateOfferDeal, getOfferDealById } from '../../api/offerDealApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import ProductPickerModal from '../../components/common/ProductPickerModal';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const ManageOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(id ? true : false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    bgColor: '#f8fafc',
    textColor: '#1e293b',
    accentColor: '#3b82f6',
    isActive: true,
    order: 0,
    displayLocation: 'Home Slider',
    expiryDate: '',
    discountPercentage: 0,
    animationType: 'Default',
    backgroundEffect: 'None'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData] = await Promise.all([
          getCategories(adminUser.token)
        ]);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        if (id) {
          const offer = await getOfferDealById(adminUser.token, id);
          setFormData({
            title: offer.title || '',
            subtitle: offer.subtitle || '',
            description: offer.description || '',
            bgColor: offer.bgColor || '#f8fafc',
            textColor: offer.textColor || '#1e293b',
            accentColor: offer.accentColor || '#3b82f6',
            isActive: offer.isActive !== undefined ? offer.isActive : true,
            order: offer.order || 0,
            displayLocation: offer.displayLocation || 'Home Slider',
            expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : '',
            discountPercentage: offer.discountPercentage || 0,
            animationType: offer.animationType || 'Default',
            backgroundEffect: offer.backgroundEffect || 'None'
          });
          setImagePreview(offer.bannerImage);
          setSelectedProducts(offer.products.map(p => ({
            productId: p.productId?._id || p.productId,
            name: p.productId?.name,
            image: p.productId?.image,
            mrp: p.productId?.mrp || p.productId?.basePrice,
            basePrice: p.productId?.basePrice
          })));
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
        toast.error('Failed to load offer details');
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

  const handleDiscountChange = (e) => {
    const percent = Number(e.target.value);
    setFormData(prev => ({ ...prev, discountPercentage: percent }));

    if (selectedProducts.length > 0) {
      setSelectedProducts(prev => prev.map(p => ({
        ...p,
        basePrice: Math.round(p.mrp * (1 - percent / 100))
      })));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePickerSelect = (newProducts) => {
    const formatted = newProducts.map(product => {
      const mrp = product.mrp || product.basePrice;
      const initialBasePrice = formData.discountPercentage > 0
        ? Math.round(mrp * (1 - formData.discountPercentage / 100))
        : product.basePrice;

      return {
        productId: product._id,
        name: product.name,
        image: product.image,
        mrp: mrp,
        basePrice: initialBasePrice
      };
    });

    setSelectedProducts([...selectedProducts, ...formatted]);
    toast.success(`${formatted.length} products added to collection`);
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

    if (!id && !fileInputRef.current.files[0]) {
      return toast.error('A banner image is required for new offers');
    }

    if (formData.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(formData.expiryDate) <= today) {
        return toast.error('Expiry date must be in the future');
      }
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));

      if (fileInputRef.current.files[0]) {
        data.append('bannerImage', fileInputRef.current.files[0]);
      }

      const productsPayload = selectedProducts.map(p => ({
        productId: p.productId,
        basePrice: p.basePrice
      }));
      data.append('products', JSON.stringify(productsPayload));

      if (id) {
        await updateOfferDeal(adminUser.token, id, data);
        toast.success('Offer deal updated successfully');
      } else {
        await createOfferDeal(adminUser.token, data);
        toast.success('Premium offer deal published');
      }
      navigate('/admin/offers/deals');
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
            <h4 className="fw-bold mb-1 text-gray-800">{id ? 'Edit Banner Offer' : 'Launch New Banner Offer'}</h4>
            <PageInfoTooltip info={pageInfoData.manageOffer} />
          </div>
          <Breadcrumb className="small mb-0 font-medium">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/admin/offers/deals" }}>Offers & Deals</Breadcrumb.Item>
            <Breadcrumb.Item active>{id ? 'Edit' : 'Create'}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Button variant="light" as={Link} to="/admin/offers/deals" className="d-flex align-items-center gap-2 border shadow-sm px-4 rounded-lg">
          <ArrowLeft size={18} /> Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={5}>
            <Card className="border-0 shadow-sm mb-4 rounded-xl overflow-hidden">
              <Card.Header className="bg-white border-bottom-0 pt-4 px-4 pb-0">
                <h6 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                  <ImageIcon size={18} /> Offer Visuals & Banner
                </h6>
              </Card.Header>
              <Card.Body className="p-4">
                <div
                  className="relative h-[220px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden mb-4 group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium flex-col gap-2">
                        <Upload size={24} />
                        <span>Change Banner Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="bg-blue-600/10 p-3 rounded-full mb-3 d-inline-block text-blue-600">
                        <Upload size={24} />
                      </div>
                      <div className="fw-bold text-gray-700">Upload Banner Image</div>
                      <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Recommended: 1200x500px</div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label className="small fw-bold text-gray-500 mb-1">Offer Title</Form.Label>
                    <Form.Control
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Price Crash! Savings alert"
                      className="bg-light border-0 py-2 rounded-lg"
                      required
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small fw-bold text-gray-500 mb-1">Subtitle</Form.Label>
                    <Form.Control
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      placeholder="e.g. Daily Essentials Bundle Save Big"
                      className="bg-light border-0 py-2 rounded-lg"
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small fw-bold text-gray-500 mb-1">Discount Percentage (%)</Form.Label>
                    <InputGroup className="bg-light border-0 rounded-lg overflow-hidden">
                      <InputGroup.Text className="bg-transparent border-0"><Percent size={16} /></InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="discountPercentage"
                        value={formData.discountPercentage === 0 && formData.discountPercentage !== "" ? "0" : formData.discountPercentage}
                        onChange={handleDiscountChange}
                        onFocus={(e) => {
                          if (formData.discountPercentage === 0 || formData.discountPercentage === "0") {
                            setFormData(prev => ({ ...prev, discountPercentage: "" }));
                          }
                        }}
                        onBlur={(e) => {
                          if (formData.discountPercentage === "" || formData.discountPercentage === null) {
                            setFormData(prev => ({ ...prev, discountPercentage: 0 }));
                          }
                        }}
                        placeholder="Set global discount for collection..."
                        className="bg-transparent border-0 py-2"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small fw-bold text-gray-500 mb-1">Brief Description (Show on detail page)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the value of this deal to the user..."
                      className="bg-light border-0 py-2 rounded-lg"
                    />
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="p-3 rounded-xl border overflow-hidden relative" style={{ backgroundColor: formData.bgColor }}>
                  <h6 className="small fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: formData.textColor }}>
                    <ImageIcon size={14} /> Detail Page Header Preview
                  </h6>
                  <div className="flex gap-4">
                    <div className="flex-1 relative z-1">
                      <h4 className="fw-bold mb-1" style={{ color: formData.textColor }}>{formData.title || 'Offer Title'}</h4>
                      <p className="small mb-0 opacity-70" style={{ color: formData.textColor }}>{formData.subtitle || 'Subtitle preview'}</p>
                    </div>
                    <div className="w-24 h-24 rounded-lg bg-gray-200 shadow-sm border border-white/10 overflow-hidden">
                      {imagePreview && <img src={imagePreview} className="w-full h-full object-cover" alt="Preview small" />}
                    </div>
                  </div>
                  <div className="mt-4 relative z-1">
                    <button className="btn btn-sm px-4 py-2 fw-bold text-white rounded-lg shadow-sm" style={{ backgroundColor: formData.accentColor, border: 'none' }}>
                      {formData.discountPercentage}% OFF
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3 text-gray-700">Display Settings</h6>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label className="small fw-bold text-gray-500">Expiry Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="expiryDate" 
                      value={formData.expiryDate} 
                      onChange={handleChange} 
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-light border-0 py-2" 
                    />
                  </Col>
                </Row>
                
                <h6 className="fw-bold mt-4 mb-3 text-gray-400 small uppercase tracking-wider">Visual Branding</h6>
                <div className="space-y-3">
                  <div className="d-flex align-items-center justify-between gap-3">
                    <Form.Label className="text-[10px] fw-bold text-gray-500 uppercase mb-0">Background</Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="p-1 rounded border-0 shadow-sm" style={{ width: '30px', height: '30px' }} />
                      <Form.Control type="text" name="bgColor" value={formData.bgColor} onChange={handleChange} className="bg-light border-0 py-1 px-2 small font-mono" style={{ fontSize: '10px', width: '70px' }} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-between gap-3">
                    <Form.Label className="text-[10px] fw-bold text-gray-500 uppercase mb-0">Text Color</Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="p-1 rounded border-0 shadow-sm" style={{ width: '30px', height: '30px' }} />
                      <Form.Control type="text" name="textColor" value={formData.textColor} onChange={handleChange} className="bg-light border-0 py-1 px-2 small font-mono" style={{ fontSize: '10px', width: '70px' }} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-between gap-3">
                    <Form.Label className="text-[10px] fw-bold text-gray-500 uppercase mb-0">Accent / Btn</Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="p-1 rounded border-0 shadow-sm" style={{ width: '30px', height: '30px' }} />
                      <Form.Control type="text" name="accentColor" value={formData.accentColor} onChange={handleChange} className="bg-light border-0 py-1 px-2 small font-mono" style={{ fontSize: '10px', width: '70px' }} />
                    </div>
                  </div>
                </div>
                <Form.Group className="mt-3">
                  <Form.Label className="small fw-bold text-gray-500 d-flex align-items-center gap-2">
                    <Sparkles size={14} className="text-blue-500" /> Floating Animation Style
                  </Form.Label>
                  <Form.Select 
                    name="animationType" 
                    value={formData.animationType} 
                    onChange={handleChange} 
                    className="bg-light border-0 py-2"
                  >
                    <option value="None">No Animation</option>
                    <option value="Default">Default (Gifts & Shopping)</option>
                    <option value="Cleaning">Cleaning & Household</option>
                    <option value="Fruits">Fresh Fruits</option>
                    <option value="Vegetables">Green Vegetables</option>
                    <option value="Staples">Daily Staples (Rice/Dal)</option>
                    <option value="Snacks">Snacks & Bakery</option>
                    <option value="Meat">Meat & Seafood</option>
                    <option value="Beverages">Beverages & Drinks</option>
                    <option value="Bakery">Bakery & Cookies</option>
                    <option value="BabyCare">Baby & Kids Care</option>
                    <option value="PetCare">Pet Supplies</option>
                    <option value="Beauty">Beauty & Personal Care</option>
                    <option value="Festive">Festive / Packaged FMCG</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="small fw-bold text-gray-500 d-flex align-items-center gap-2">
                    <Sparkles size={14} className="text-orange-400" /> Background Visual Effect
                  </Form.Label>
                  <Form.Select 
                    name="backgroundEffect" 
                    value={formData.backgroundEffect} 
                    onChange={handleChange} 
                    className="bg-light border-0 py-2"
                  >
                    <option value="None">No Background Effect</option>
                    <option value="Confetti">🎉 Falling Confetti (Sale/Party)</option>
                    <option value="Sparkles">✨ Floating Sparkles (Premium/New)</option>
                    <option value="Bubbles">🫧 Rising Bubbles (Fresh/Clean)</option>
                    <option value="Snow">❄️ Falling Snow (Winter/Festive)</option>
                  </Form.Select>
                  <Form.Text className="text-muted small">Subtle environmental effect behind content.</Form.Text>
                </Form.Group>
                <hr className="my-4" />
                <Form.Check
                  type="switch"
                  id="isActive"
                  label={<span className="fw-medium text-gray-600">This offer is live and visible</span>}
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-xl h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <LayoutGrid size={18} /> Products Collection
                  </h6>
                  <span className="badge bg-blue-50 text-blue-600 rounded-pill px-3 py-2 border border-blue-100">{selectedProducts.length} Items Selected</span>
                </div>

                <div className="mb-4">
                  <div className="flex bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 items-center justify-center flex-col hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group" onClick={() => setShowPicker(true)}>
                    <div className="bg-white p-3 rounded-full shadow-sm text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                      <Plus size={28} />
                    </div>
                    <div className="fw-bold text-gray-700">Add Products to Collection</div>
                    <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Pick from local inventory (Non-Vendor)</div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle caption-top">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="small fw-bold text-gray-400 border-0 ps-3 py-3">Product Name</th>
                        <th className="small fw-bold text-gray-400 border-0 text-center py-3">Market Price</th>
                        <th className="small fw-bold text-gray-400 border-0 text-center py-3">Selling Price (₹)</th>
                        <th className="small fw-bold text-gray-400 border-0 text-center py-3">Benefit</th>
                        <th className="small fw-bold text-gray-400 border-0 text-end pe-3 py-3">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="border-0">
                      {paginatedProducts.length > 0 ? paginatedProducts.map((p, idx) => (
                        <tr key={p.productId} className="border-bottom border-gray-100">
                          <td className="ps-3 py-3">
                            <div className="d-flex align-items-center gap-3 text-gray-800">
                              <div className="p-1 bg-gray-50 rounded border flex-shrink-0">
                                <img src={p.image} className="w-10 h-10 rounded object-cover" alt="" />
                              </div>
                              <div className="fw-bold small truncate max-w-[180px]">{p.name}</div>
                            </div>
                          </td>
                          <td className="text-center text-gray-400 line-through font-mono small">₹{p.mrp}</td>
                          <td className="text-center" style={{ width: '130px' }}>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={p.basePrice}
                              onFocus={(e) => { if (p.basePrice === 0 || p.basePrice === "0") handlePriceChange(p.productId, '') }}
                              onBlur={(e) => { if (p.basePrice === "" || p.basePrice === null) handlePriceChange(p.productId, 0) }}
                              onChange={(e) => handlePriceChange(p.productId, e.target.value)}
                              className="text-center fw-bold text-blue-600 bg-blue-50 border-0 rounded-lg py-1.5 shadow-none"
                            />
                          </td>
                          <td className="text-center">
                            <span className="px-2 py-1 rounded-sm font-bold text-[10px] bg-green-50 text-green-700 border border-green-100 shadow-sm d-inline-block">
                              SAVE ₹{p.mrp - p.basePrice} ({Math.round(((p.mrp - p.basePrice) / p.mrp) * 100)}%)
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            <button
                               type="button"
                              onClick={() => removeProduct(p.productId)}
                              className="p-1.5 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-24 text-gray-300">
                            <div className="opacity-40 mb-3"><LayoutGrid size={48} className="mx-auto" /></div>
                            <p className="small fw-medium">No products selected for this banner.<br />Search and add items to create a high-value offer collection.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {selectedProducts.length > itemsPerPage && (
                  <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, selectedProducts.length)} of {selectedProducts.length}
                    </div>
                    <div className="d-flex gap-1">
                      <Button 
                        variant="light" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="rounded-lg border-0 bg-gray-50 px-3"
                      >
                        Prev
                      </Button>
                      {getPageNumbers().map((page, i) => (
                         page === '...' ? (
                          <span key={`dots-${i}`} className="d-flex align-items-center px-1 text-gray-400">...</span>
                        ) : (
                          <Button 
                            key={page}
                            variant={currentPage === page ? "primary" : "light"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="rounded-lg border-0 w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      ))}
                      <Button 
                        variant="light" 
                        size="sm" 
                        disabled={currentPage === Math.ceil(selectedProducts.length / itemsPerPage)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="rounded-lg border-0 bg-gray-50 px-3"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="bg-white border-top fixed-bottom p-3 shadow-2xl z-50 text-end" style={{ width: 'calc(100% - 260px)', marginLeft: '260px' }}>
          <div className="container-fluid d-flex justify-content-end gap-3 align-items-center">
            <div className="me-auto hidden md:block text-start">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status</div>
              <div className={`text-xs font-bold ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {formData.isActive ? '₹ Ready for Launch' : '₹ Draft / Offline'}
              </div>
            </div>
            <Button variant="light" as={Link} to="/admin/offers/deals" className="px-5 py-2 fw-bold text-gray-500 hover:bg-gray-100 border shadow-sm">Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading} className="px-5 py-2 fw-bold shadow-lg d-flex align-items-center gap-2">
              {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />}
              {id ? 'Apply Changes' : 'Publish Offer'}
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
      <div className="py-10"></div>
    </div>
  );
};

export default ManageOffer;
