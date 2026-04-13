import React, { useState, useEffect, useRef } from 'react';
import { Save, Camera, X } from 'lucide-react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { getCategories } from '../../../../common/api/categoryApi';
import { useVendor } from '../../contexts/VendorContext';

const BrandEditModal = ({ show, onHide, brand, onSave }) => {
  const { vendor } = useVendor();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'Active',
    website: '',
    description: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempLogo, setTempLogo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(vendor.token);
        setCategories(data.filter(c => c.status === 'Active'));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (show && vendor?.token) fetchCategories();
  }, [show, vendor]);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        category: brand.category || '',
        status: brand.status || 'Active',
        website: brand.website || '',
        description: brand.description || ''
      });
      setLogoPreview(brand.logo || null);
      setLogoFile(null);
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCropComplete = (croppedImageBase64) => {
    setLogoPreview(croppedImageBase64);
    const file = dataURLtoFile(croppedImageBase64, 'brand-logo.jpg');
    setLogoFile(file);
    setShowCropper(false);
    setTempLogo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('status', formData.status);
    data.append('website', formData.website);
    data.append('description', formData.description);

    if (logoFile) {
      data.append('logo', logoFile);
    }

    onSave(data);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Edit Brand Details</h2>
          <button onClick={onHide} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} id="editBrandForm">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Section */}
              <div className="w-full md:w-48 shrink-0 flex flex-col items-center">
                <div className="relative inline-block mb-3">
                  <div className="w-36 h-36 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">No Logo</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2.5 bg-[#0c831f] text-white rounded-xl shadow-lg border-2 border-white hover:bg-[#0a6b19] transition-colors"
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Update Logo</p>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Brand Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onHide}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editBrandForm"
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0c831f] hover:bg-[#0a6b19] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

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

export default BrandEditModal;
