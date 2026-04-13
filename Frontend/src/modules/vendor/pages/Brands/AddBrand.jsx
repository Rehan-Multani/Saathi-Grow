import React, { useState, useEffect } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useVendor } from '../../contexts/VendorContext';
import { createBrand } from '../../../../common/api/brandApi';
import { getCategories } from '../../../../common/api/categoryApi';
import { toast } from 'react-toastify';

const AddBrand = () => {
  const navigate = useNavigate();
  const { vendor } = useVendor();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'Active',
    website: '',
    description: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(vendor.token);
        setCategories(data.filter(c => c.status === 'Active'));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (vendor?.token) fetchCategories();
  }, [vendor]);

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempLogo, setTempLogo] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogo(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBase64) => {
    setLogoPreview(croppedImageBase64);

    let arr = croppedImageBase64.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], 'brand-logo.jpg', { type: mime });

    setLogoFile(file);
    setShowCropper(false);
    setTempLogo(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      return toast.error('Name and Category are required');
    }

    setLoading(true);
    try {
      const brandData = new FormData();
      brandData.append('name', formData.name);
      brandData.append('category', formData.category);
      brandData.append('status', formData.status);
      brandData.append('website', formData.website);
      brandData.append('description', formData.description);
      if (logoFile) {
        brandData.append('logo', logoFile);
      }

      await createBrand(vendor.token, brandData);
      toast.success('Brand created successfully!');
      navigate('/vendor/brands');
    } catch (error) {
      toast.error(error.message || 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Brand</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Create a new brand for your products.</p>
        </div>
        <button
          onClick={() => navigate('/vendor/brands')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <X size={18} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Details */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Brand Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">Brand Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Nike"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">Category <span className="text-red-500">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about the brand..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Logo Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Brand Logo</h2>
              
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 group hover:bg-gray-100 transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]">
                {logoPreview ? (
                  <div className="relative w-full h-full flex justify-center">
                    <img src={logoPreview} className="max-h-32 object-contain rounded-lg" alt="Logo preview" />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLogoPreview(null); setLogoFile(null); }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400 font-medium">
                    <Upload size={32} className="mx-auto mb-3 text-gray-300" />
                    <span className="text-sm">Click to upload logo</span>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleLogoChange}
                  accept="image/*"
                  disabled={!!logoPreview || loading}
                />
              </div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-4 text-center">Square logo recommended</p>
            </div>

            {/* Submission */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Availability</h2>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] outline-none transition-all mb-6"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0c831f] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0a6b19] transition-colors shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                {loading ? 'Saving Brand...' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <ImageCropperModal
        show={showCropper}
        imageSrc={tempLogo}
        onCancel={() => { setShowCropper(false); setTempLogo(null); }}
        onCropComplete={handleCropComplete}
        aspect={1}
      />
    </div>
  );
};

export default AddBrand;
