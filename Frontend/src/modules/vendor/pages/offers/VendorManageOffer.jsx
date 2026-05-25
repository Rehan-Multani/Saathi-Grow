import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2, Search, ArrowLeft, Image as ImageIcon, LayoutGrid, Upload, Percent, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useVendor } from '../../contexts/VendorContext';
import { getVendorProducts } from '../../api/vendorProductApi';
import { getVendorOfferById, createVendorOffer, updateVendorOffer } from '../../api/vendorOfferApi';

const VendorManageOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vendor } = useVendor();
  const token = vendor?.token;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(id ? true : false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    bgColor: '#f8fafc',
    textColor: '#1e293b',
    accentColor: '#0c831f',
    isActive: true,
    order: 0,
    displayLocation: 'Home Slider',
    expiryDate: '',
    discountPercentage: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        // Load vendor's own products
        const prodData = await getVendorProducts(token);
        setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));

        if (id) {
          const offer = await getVendorOfferById(token, id);
          setFormData({
            title: offer.title || '',
            subtitle: offer.subtitle || '',
            description: offer.description || '',
            bgColor: offer.bgColor || '#f8fafc',
            textColor: offer.textColor || '#1e293b',
            accentColor: offer.accentColor || '#0c831f',
            isActive: offer.isActive !== undefined ? offer.isActive : true,
            order: offer.order || 0,
            displayLocation: offer.displayLocation || 'Home Slider',
            expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : '',
            discountPercentage: offer.discountPercentage || 0,
          });
          setImagePreview(offer.bannerImage);
          setSelectedProducts(
            (offer.products || []).map(p => ({
              productId: p.productId?._id || p.productId,
              name: p.productId?.name,
              image: p.productId?.image,
              mrp: p.productId?.mrp || p.productId?.basePrice,
              basePrice: p.basePrice || p.productId?.basePrice,
            }))
          );
        }
      } catch (error) {
        toast.error('Failed to load offer details');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDiscountChange = (e) => {
    const val = e.target.value;
    const percent = val === '' ? 0 : Number(val);
    setFormData(prev => ({ ...prev, discountPercentage: percent }));
    if (selectedProducts.length > 0) {
      setSelectedProducts(prev =>
        prev.map(p => ({ ...p, basePrice: Math.round(p.mrp * (1 - percent / 100)) }))
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const addProduct = (product) => {
    if (selectedProducts.find(p => p.productId === product._id)) {
      return toast.warning('Product already added');
    }
    const mrp = product.mrp || product.basePrice;
    const base = formData.discountPercentage > 0
      ? Math.round(mrp * (1 - formData.discountPercentage / 100))
      : product.basePrice;
    setSelectedProducts(prev => [...prev, {
      productId: product._id,
      name: product.name,
      image: product.image,
      mrp,
      basePrice: base,
    }]);
    setSearchTerm('');
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const handlePriceChange = (productId, price) => {
    setSelectedProducts(prev =>
      prev.map(p => p.productId === productId ? { ...p, basePrice: Number(price) } : p)
    );
  };

  const paginatedProducts = (selectedProducts || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((selectedProducts?.length || 0) / itemsPerPage);

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
    if (!id && !fileInputRef.current?.files[0]) {
      return toast.error('A banner image is required');
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (fileInputRef.current?.files[0]) {
        data.append('bannerImage', fileInputRef.current.files[0]);
      }
      const productsPayload = selectedProducts.map(p => ({ productId: p.productId, basePrice: p.basePrice }));
      data.append('products', JSON.stringify(productsPayload));

      if (id) {
        await updateVendorOffer(token, id, data);
        toast.success('Offer updated successfully!');
      } else {
        await createVendorOffer(token, data);
        toast.success('Banner offer published!');
      }
      navigate('/vendor/offers');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#0c831f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayDate = new Date();
  const minDateStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{id ? 'Edit Banner Offer' : 'Create Banner Offer'}</h1>
          <p className="text-xs text-gray-500">
            {id ? 'Modify your existing banner' : 'Launch a new banner deal for your customers'}
          </p>
        </div>
        <button
          onClick={() => navigate('/vendor/offers')}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Offer Visuals + Settings */}
          <div className="lg:col-span-2 space-y-5">

            {/* Banner Image Upload */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-0">
                <h6 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <ImageIcon size={16} className="text-[#0c831f]" /> Offer Visuals & Banner
                </h6>
              </div>
              <div className="p-5 space-y-4">
                {/* Image Drop Zone */}
                <div
                  className="relative h-[200px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium flex-col gap-2">
                        <Upload size={22} />
                        <span className="text-sm">Change Banner</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-[#0c831f]/10 flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} className="text-[#0c831f]" />
                      </div>
                      <p className="font-bold text-gray-600 text-sm">Upload Banner Image</p>
                      <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Recommended: 1200×500px</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>

                {/* Text Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Offer Title *</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Weekend Fresh Deals"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0c831f] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Subtitle</label>
                    <input
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      placeholder="e.g. Fresh Veggies at Unbeatable Prices"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0c831f] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block flex gap-1 items-center">
                      <Percent size={12} /> Discount Percentage
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <Percent size={14} className="text-gray-400" />
                      <input
                        type="number"
                        min={0} max={100}
                        value={formData.discountPercentage === 0 ? '' : formData.discountPercentage}
                        placeholder="0"
                        onChange={handleDiscountChange}
                        className="flex-1 !bg-transparent !border-none !p-0 !m-0 focus:!outline-none focus:!ring-0 !shadow-none text-sm"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe this deal for customers…"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0c831f] resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Preview Card */}
                <div
                  className="p-4 rounded-xl border overflow-hidden"
                  style={{ backgroundColor: formData.bgColor }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: formData.textColor, opacity: 0.5 }}>
                    Detail Page Preview
                  </p>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <h4 className="font-bold text-base" style={{ color: formData.textColor }}>{formData.title || 'Offer Title'}</h4>
                      <p className="text-xs opacity-60" style={{ color: formData.textColor }}>{formData.subtitle || 'Subtitle'}</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden border border-white/10 shrink-0">
                      {imagePreview && <img src={imagePreview} className="w-full h-full object-cover" alt="" />}
                    </div>
                  </div>
                  {formData.discountPercentage > 0 && (
                    <button
                      type="button"
                      className="mt-3 px-4 py-1.5 rounded-lg text-white text-sm font-bold shadow-md"
                      style={{ backgroundColor: formData.accentColor }}
                    >
                      {formData.discountPercentage}% OFF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h6 className="font-bold text-gray-700 text-sm">Display Settings</h6>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    min={minDateStr}
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0c831f]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Visual Branding</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">Background</label>
                    <div className="flex gap-2">
                      <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-gray-100" />
                      <input type="text" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">Text Content</label>
                    <div className="flex gap-2">
                      <input type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-gray-100" />
                      <input type="text" name="textColor" value={formData.textColor} onChange={handleChange} className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">Accent / Button</label>
                    <div className="flex gap-2">
                      <input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-gray-100" />
                      <input type="text" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative inline-block w-11 h-6">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 !m-0 !p-0"
                  />
                  <div className={`absolute inset-0 rounded-full transition-colors ${formData.isActive ? 'bg-[#0c831f]' : 'bg-gray-300'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform pointer-events-none ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">This offer is live and visible</span>
              </label>
            </div>
          </div>

          {/* RIGHT: Product Collection */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full">
              <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <h6 className="font-bold text-[#0c831f] text-sm flex items-center gap-2">
                  <LayoutGrid size={16} /> Products Collection
                </h6>
                <span className="bg-[#0c831f]/10 text-[#0c831f] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#0c831f]/20">
                  {selectedProducts.length} Items
                </span>
              </div>

              <div className="p-5">
                {/* Search Products */}
                <div className="relative mb-5">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#0c831f] transition-colors">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                      placeholder="Search your products to include in this banner…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                    />
                  </div>

                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden max-h-[320px] overflow-y-auto">
                      {filteredProducts.length > 0 ? filteredProducts.map(p => (
                        <div
                          key={p._id}
                          onClick={() => addProduct(p)}
                          className="flex items-center justify-between p-3 border-b border-gray-50 hover:bg-[#0c831f]/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 rounded-lg border object-cover" alt="" />
                            <div>
                              <p className="text-sm font-bold text-gray-800">{p.name}</p>
                              <p className="text-[11px] text-gray-400">₹{p.basePrice} / {p.sku}</p>
                            </div>
                          </div>
                          <div className="w-7 h-7 bg-[#0c831f] text-white rounded-lg flex items-center justify-center shadow-sm">
                            <Plus size={14} />
                          </div>
                        </div>
                      )) : (
                        <p className="p-4 text-center text-sm text-gray-400">No matching products found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-[11px] font-bold text-gray-400 uppercase">Product</th>
                        <th className="px-3 py-3 text-[11px] font-bold text-gray-400 uppercase text-center">MRP</th>
                        <th className="px-3 py-3 text-[11px] font-bold text-gray-400 uppercase text-center">Selling ₹</th>
                        <th className="px-3 py-3 text-[11px] font-bold text-gray-400 uppercase text-center">Benefit</th>
                        <th className="px-3 py-3 text-[11px] font-bold text-gray-400 uppercase text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedProducts.length > 0 ? paginatedProducts.map(p => (
                        <tr key={p.productId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg border overflow-hidden shrink-0">
                                <img src={p.image} className="w-full h-full object-cover" alt="" />
                              </div>
                              <span className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-gray-400 line-through text-sm font-mono">₹{p.mrp}</td>
                          <td className="px-3 py-3 text-center" style={{ width: 120 }}>
                            <input
                              type="number"
                              value={p.basePrice}
                              onChange={(e) => handlePriceChange(p.productId, e.target.value)}
                              className="w-full text-center text-sm font-bold text-[#0c831f] bg-[#0c831f]/10 border-0 rounded-lg py-1.5 outline-none"
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                              SAVE ₹{p.mrp - p.basePrice} ({Math.max(0, Math.round(((p.mrp - p.basePrice) / p.mrp) * 100))}%)
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                               type="button"
                              onClick={() => removeProduct(p.productId)}
                              className="p-1.5 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-20 text-gray-300">
                            <LayoutGrid size={40} className="mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-400">
                              No products selected.<br />Search and add your products above.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {selectedProducts.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4 px-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, selectedProducts.length)} of {selectedProducts.length}
                    </p>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        Prev
                      </button>
                      <div className="flex gap-1">
                        {getPageNumbers().map((page, i) => (
                          page === '...' ? (
                            <span key={`dots-${i}`} className="flex items-center px-1 text-gray-400">...</span>
                          ) : (
                            <button 
                              key={page}
                               type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-[#0c831f] text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      <button 
                        type="button"
                        disabled={currentPage === Math.ceil(selectedProducts.length / itemsPerPage)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentPage === Math.ceil(selectedProducts.length / itemsPerPage) ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Fixed bottom submit bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-100 shadow-2xl z-50 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
          <p className={`text-xs font-bold ${formData.isActive ? 'text-[#0c831f]' : 'text-gray-400'}`}>
            {formData.isActive ? '✓ Ready for Launch' : '⊘ Draft / Offline'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/offers')}
            className="px-5 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0c831f] hover:bg-[#0a6b19] text-white text-sm font-bold rounded-lg shadow-lg shadow-green-900/20 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            {id ? 'Save Changes' : 'Publish Offer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorManageOffer;
