import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Upload, X, Sparkles, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useVendor } from '../../contexts/VendorContext';
import { getCategories } from '../../../../common/api/categoryApi';
import { getSubCategories } from '../../../../common/api/subcategoryApi';
import { getBrands } from '../../../../common/api/brandApi';
import { addVendorProduct, getVendorAISuggestions } from '../../api/vendorProductApi';
import { getAvailableVendorLocations } from '../../api/vendorLocationApi';
import { toast } from 'react-toastify';

const AddProduct = () => {
    const navigate = useNavigate();
    const { vendor, fetchProducts } = useVendor();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState({ description: false, tags: false });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subCategory: '',
        brandName: '',
        basePrice: '',
        mrp: '',
        isVeg: true,
        unitType: 'pcs',
        unitValue: 1,
        physicalLocation: '',
        description: '',
        sku: '',
        tags: [],
        stock: 0,
        lowStockThreshold: 10,
        status: 'Active',
        isSaathiGrow: false
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, subCategoriesData, brandsData] = await Promise.all([
                    getCategories(vendor.token),
                    getSubCategories(vendor.token),
                    getBrands(vendor.token)
                ]);
                setCategories(categoriesData.filter(c => c.status === 'Active'));
                setSubCategories(subCategoriesData.filter(sc => sc.status === 'Active'));
                setBrands(brandsData.filter(b => b.status === 'Active'));
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load initial data');
            } finally {
                setInitialLoading(false);
            }
        };

        if (vendor?.token) {
            fetchData();
        }
    }, [vendor.token]);

    useEffect(() => {
        if (!vendor?.token) return;
        getAvailableVendorLocations(vendor.token)
            .then(data => setAvailableLocations(Array.isArray(data) ? data : []))
            .catch(() => setAvailableLocations([]));
    }, [vendor?.token]);

    useEffect(() => {
        if (formData.category) {
            const matches = brands.filter(b => {
                const brandCat = (b.category || '').toLowerCase().trim();
                const selectedCat = (formData.category || '').toLowerCase().trim();
                return brandCat === selectedCat;
            });
            setFilteredBrands(matches);

            const filteredSub = subCategories.filter(sc =>
                (sc.categoryName || '').toLowerCase().trim() === (formData.category || '').toLowerCase().trim() ||
                (sc.category?.name || '').toLowerCase().trim() === (formData.category || '').toLowerCase().trim()
            );
            setFilteredSubCategories(filteredSub);

            if (formData.brandName && !matches.find(m => m.name === formData.brandName)) {
                setFormData(prev => ({ ...prev, brandName: '' }));
            }
            if (formData.subCategory && !filteredSub.find(sc => sc.name === formData.subCategory)) {
                setFormData(prev => ({ ...prev, subCategory: '' }));
            }
        } else {
            setFilteredBrands([]);
            setFilteredSubCategories([]);
            setFormData(prev => ({ ...prev, brandName: '', subCategory: '' }));
        }
    }, [formData.category, brands, subCategories]);

    const generateSKU = () => {
        const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PROD';
        const namePart = formData.name ? formData.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X') : 'XXX';
        const uid = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `V-${prefix}-${namePart}-${uid}`;
    };

    useEffect(() => {
        if (formData.name && formData.category && !formData.sku) {
            setFormData(prev => ({ ...prev, sku: generateSKU() }));
        }
    }, [formData.name, formData.category]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImage) => {
        setImagePreview(croppedImage);
        setShowCropper(false);
        setTempImage(null);
        const res = await fetch(croppedImage);
        const blob = await res.blob();
        setImageFile(new File([blob], 'product.jpg', { type: 'image/jpeg' }));
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + galleryFiles.length > 10) {
            return toast.warning('Maximum 10 gallery images allowed');
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const removeGalleryImage = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRefreshSKU = () => {
        setFormData({ ...formData, sku: generateSKU() });
    };

    const handleAISuggestion = async (type) => {
        if (!formData.name) {
            return toast.warning('Please enter a product name first');
        }
        setAiLoading(prev => ({ ...prev, [type]: true }));
        try {
            const data = await getVendorAISuggestions(vendor.token, formData.name, type);
            if (type === 'description') {
                setFormData(prev => ({ ...prev, description: data.suggestion }));
                toast.success('Description generated!');
            }
        } catch (error) {
            toast.error(error.message || `Failed to generate ${type}`);
        } finally {
            setAiLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isBrandRequired = formData.category && filteredBrands.length > 0;

        if (!formData.name || !formData.category || (isBrandRequired && !formData.brandName) || !formData.basePrice || !formData.sku) {
            return toast.error('Please fill all required fields');
        }
        setLoading(true);
        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    data.append(key, formData.tags.join(','));
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (imageFile) data.append('image', imageFile);
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => data.append('gallery', file));
            }

            await addVendorProduct(vendor.token, data);
            await fetchProducts();
            toast.success('Product created successfully!');
            navigate('/vendor/products');
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0c831f] rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto border-t border-transparent">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/vendor/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Product</h1>
                    <p className="text-sm text-gray-500 font-medium">Create a new product for your catalog.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">General Information</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Product Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all" />
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-xs font-bold text-gray-700">Description</label>
                                        <button type="button" onClick={() => handleAISuggestion('description')} disabled={aiLoading.description} className="text-xs font-bold text-[#0c831f] flex items-center gap-1 hover:underline">
                                            {aiLoading.description ? <div className="w-3 h-3 border-2 border-[#0c831f] border-t-transparent rounded-full animate-spin" /> : <Sparkles size={12} />}
                                            AI Write
                                        </button>
                                    </div>
                                    <textarea rows={4} name="description" value={formData.description} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all resize-none" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Pricing & Units</h2>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Price (₹)</label>
                                    <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#0c831f] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">MRP (₹)</label>
                                    <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Unit Type</label>
                                    <select name="unitType" value={formData.unitType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all bg-white">
                                        <option value="pcs">Pcs</option><option value="kg">Kg</option><option value="gm">Gm</option><option value="ml">Ml</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Stock</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#0c831f] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Low Stock Alert at</label>
                                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Physical Location</label>
                                    {availableLocations.length > 0 ? (
                                        <select name="physicalLocation" value={formData.physicalLocation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all bg-white">
                                            <option value="">— Not Assigned —</option>
                                            {availableLocations.map(loc => (
                                                <option key={loc._id} value={loc.label}>{loc.label}{loc.description ? ` (${loc.description})` : ''}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input type="text" placeholder="No locations — type manually" name="physicalLocation" value={formData.physicalLocation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all" />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Dietary Type</label>
                                    <div className="flex bg-gray-50 p-1 border border-gray-200 rounded-lg">
                                        <button type="button" onClick={() => setFormData({ ...formData, isVeg: true })} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${formData.isVeg ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>VEG</button>
                                        <button type="button" onClick={() => setFormData({ ...formData, isVeg: false })} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${!formData.isVeg ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>NON-VEG</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[350px] space-y-6 shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Classification</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all bg-white">
                                        <option value="">Select Category...</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Subcategory</label>
                                    <select name="subCategory" value={formData.subCategory} onChange={handleChange} disabled={!formData.category} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400">
                                        <option value="">Select Subcategory...</option>
                                        {filteredSubCategories.map(sc => <option key={sc._id} value={sc.name}>{sc.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                        Brand {formData.category && filteredBrands.length > 0 && <span className="text-red-500">*</span>}
                                    </label>
                                    <select name="brandName" value={formData.brandName} onChange={handleChange} required={formData.category && filteredBrands.length > 0} disabled={!formData.category || (formData.category && filteredBrands.length === 0)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400">
                                        <option value="">{formData.category && filteredBrands.length === 0 ? 'No Brands Available' : 'Select Brand...'}</option>
                                        {filteredBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </select>
                                    {formData.category && filteredBrands.length === 0 && (
                                        <p className="text-[10px] text-yellow-600 flex items-center gap-1 mt-1.5 font-medium"><AlertCircle size={10} /> No brands found in category. Skip.</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">SKU (Auto-generated)</label>
                                    <div className="relative">
                                    <input type="text" readOnly value={formData.sku} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 text-gray-500 cursor-not-allowed pr-10" />
                                    <button type="button" onClick={handleRefreshSKU} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 bg-white rounded-md border border-gray-100 shadow-sm"><RefreshCw size={14} /></button>
                                    </div>
                                </div>

                                {formData.sku && (
                                    <div className="flex justify-center p-4 border border-gray-100 rounded-xl bg-gray-50">
                                        <QRCodeSVG value={formData.sku} size={100} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Media</h2>
                            
                            <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center p-4 hover:bg-gray-100 transition-colors cursor-pointer group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                                ) : (
                                    <div className="text-center py-4">
                                        <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                                        <span className="text-xs font-bold text-gray-500 block">Click to upload Main Image</span>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {galleryPreviews.map((p, i) => (
                                    <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group">
                                        <img src={p} alt="Gallery" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                    </div>
                                ))}
                                {galleryPreviews.length < 10 && (
                                    <div onClick={() => document.getElementById('edit-gallery-input').click()} className="w-12 h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <Plus size={16} />
                                    </div>
                                )}
                                <input id="edit-gallery-input" type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => navigate('/vendor/products')} className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#0c831f] text-white text-sm font-bold rounded-xl hover:bg-[#0a6b19] flex items-center gap-2 shadow-sm transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />} Create Product
                    </button>
                </div>
            </form>

            {showCropper && <ImageCropperModal show={showCropper} imageSrc={tempImage} onCancel={() => setShowCropper(false)} onCropComplete={handleCropComplete} aspect={1} />}
        </div>
    );
};

export default AddProduct;
