import React, { useState, useEffect, useRef } from 'react';
import { Save, X, ArrowLeft, Package, Upload, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';

const EditProduct = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { products, updateProduct: updateProductInContext } = useVendor();
    const fileInputRef = useRef(null);
    const otherFilesRef = useRef(null);

    const product = products.find(p => p._id === productId) || null;

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        mrp: '',
        price: '',
        unit: '',
        unitValue: 1,
        description: '',
        isVeg: true,
        stock: 0
    });

    const [variants, setVariants] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]);

    const categories = ['Vegetables & Fruits', 'Dairy & Breakfast', 'Munchies', 'Fashion', 'Electronics'];
    const brands = ['Fashion Hub', 'Amul', 'Nestle', 'Tata', 'Reliance', 'Other'];

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brandName || '',
                category: product.category || '',
                mrp: product.mrp || product.basePrice || '',
                price: product.basePrice || '',
                unit: product.unitType || '',
                unitValue: product.unitValue || 1,
                description: product.description || '',
                isVeg: product.isVeg !== undefined ? product.isVeg : true,
                stock: product.branchStocks?.reduce((acc, bs) => acc + bs.stock, 0) || 0
            });
            setVariants(product.variants || []);
            setImagePreview(product.image || null);
            setExistingGallery(product.gallery || []);
            setGalleryPreviews(product.gallery || []);
            setGalleryFiles([]);
        }
    }, [product]);

    const handleMainUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOtherUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const removeGalleryImage = (index, isExisting) => {
        if (isExisting) {
            setExistingGallery(prev => prev.filter((_, i) => i !== index));
            setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            const fileIndex = index - existingGallery.length;
            setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex));
            setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('brand', formData.brand);
        data.append('category', formData.category);
        data.append('mrp', formData.mrp);
        data.append('price', formData.price);
        data.append('unit', formData.unit);
        data.append('unitValue', formData.unitValue);
        data.append('description', formData.description);
        data.append('isVeg', formData.isVeg);

        if (mainImage) {
            data.append('image', mainImage);
        }

        if (galleryFiles.length > 0) {
            galleryFiles.forEach(file => {
                data.append('gallery', file);
            });
        }

        data.append('variants', JSON.stringify(variants.map(v => ({
            ...v,
            stock: Number(v.stock) || 0,
            price: Number(v.price) || Number(formData.price)
        }))));

        const success = await updateProductInContext(productId, data);
        if (success) {
            navigate('/vendor/products');
        }
    };

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Package size={48} className="text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-2">Product not found</h2>
                <p className="text-sm text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/vendor/products')}
                    className="px-4 py-2 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19]"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
            <input type="file" ref={fileInputRef} onChange={handleMainUpload} accept="image/*" className="hidden" />

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-3 md:px-8 py-2 md:py-3 lg:py-2.5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/vendor/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
                        <ArrowLeft size={18} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-sm md:text-base font-bold text-gray-900 tracking-tight">Edit product</h1>
                        <p className="text-[9px] md:text-[10px] text-gray-500 font-medium tracking-tight">Update your item on sathiGro</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <button onClick={() => navigate('/vendor/products')} className="hidden md:block px-4 py-2 rounded-lg text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-3 md:px-6 py-1.5 md:py-2 rounded-lg bg-[#0c831f] text-white text-[10px] md:text-xs font-bold hover:bg-[#0a6b19] shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <Save size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Update Product</span><span className="sm:hidden">Update</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 md:px-12 py-3 md:py-4 lg:py-4">
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 lg:space-y-5">

                    {/* Basic Information */}
                    <div className="space-y-2 md:space-y-3 lg:space-y-3">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-700 border-b border-gray-50 pb-1 tracking-tight">Basic information</h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 lg:gap-x-5 gap-y-2 md:gap-y-3 lg:gap-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500">Product name *</label>
                                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Enter product name" />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-gray-500">Unit Amount</label>
                                <input type="number" value={formData.unitValue} onChange={(e) => setFormData({ ...formData, unitValue: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Amount (e.g. 500, 1)" />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-gray-500">Unit</label>
                                <input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g., kg, gm, pcs" />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-gray-500">Category *</label>
                                <div className="relative">
                                    <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:border-[#0c831f] outline-none transition-all appearance-none cursor-pointer">
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-gray-500">Brand</label>
                                <div className="relative">
                                    <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:border-[#0c831f] outline-none transition-all appearance-none cursor-pointer">
                                        <option value="">Select brand</option>
                                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[10px] font-semibold text-gray-500">Description</label>
                            <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] outline-none transition-all resize-none placeholder:text-gray-300"
                                placeholder="Enter product description..." />
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div className="space-y-2 md:space-y-3 lg:space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-1">
                            <h3 className="text-[10px] md:text-xs font-bold text-gray-700 tracking-tight">Variants (Size, Color, etc.)</h3>
                            <button
                                type="button"
                                onClick={() => setVariants([...variants, { type: 'Size', value: '', stock: '', price: '' }])}
                                className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-[#0c831f] hover:underline"
                            >
                                <Plus size={10} /> Add Variant
                            </button>
                        </div>

                        <div className="space-y-2">
                            {variants.map((variant, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-2 bg-gray-50 p-2 rounded-lg relative group">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                                        <div className="space-y-0.5">
                                            <label className="text-[9px] font-semibold text-gray-500">Attr Type</label>
                                            <div className="relative">
                                                <select
                                                    value={variant.type}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].type = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:border-[#0c831f] outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="Size">Size</option>
                                                    <option value="Weight">Weight</option>
                                                    <option value="Color">Color</option>
                                                    <option value="Material">Material</option>
                                                    <option value="Style">Style</option>
                                                </select>
                                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[9px] font-semibold text-gray-500">Value</label>
                                            <input
                                                value={variant.value}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[index].value = e.target.value;
                                                    setVariants(newVariants);
                                                }}
                                                placeholder={variant.type === 'Color' ? 'e.g. Red' : 'e.g. XL, 1kg'}
                                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:border-[#0c831f] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[9px] font-semibold text-gray-500">Stock</label>
                                            <input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[index].stock = e.target.value;
                                                    setVariants(newVariants);
                                                }}
                                                placeholder="Qty"
                                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:border-[#0c831f] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[9px] font-semibold text-gray-500">Price</label>
                                            <input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[index].price = e.target.value;
                                                    setVariants(newVariants);
                                                }}
                                                placeholder="₹ 0.00"
                                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:border-[#0c831f] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                                        className="absolute -top-1 -right-1 md:static md:flex items-center justify-center p-1.5 md:p-1 text-red-500 hover:bg-red-50 rounded bg-white shadow-sm md:shadow-none border md:border-none border-gray-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {variants.length === 0 && (
                                <div className="text-center py-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                                    <p className="text-[10px] text-gray-400">No variants added type specific details liek size, color etc.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2 md:space-y-3 lg:space-y-3">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-700 border-b border-gray-50 pb-1 tracking-tight">Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 lg:gap-x-5 gap-y-2 md:gap-y-3 lg:gap-y-3">
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-gray-500">Price *</label>
                                <input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:border-[#0c831f] outline-none transition-all placeholder:text-gray-300"
                                    placeholder="0.00" />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-gray-500">Original price</label>
                                <input type="number" value={formData.mrp} onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-400 focus:border-[#0c831f] outline-none transition-all placeholder:text-gray-300"
                                    placeholder="0.00" />
                            </div>
                        </div>
                    </div>

                    {/* Product Media */}
                    <div className="bg-[#f9f8ff] border border-[#e5e0ff] rounded-xl p-2 md:p-3 space-y-2">
                        <div className="flex items-center gap-1.5 md:gap-2 text-[#4c3eac]">
                            <Upload size={12} strokeWidth={2.5} />
                            <h3 className="text-[9px] md:text-[10px] font-bold tracking-tight">Product media</h3>
                        </div>

                        <div className="bg-white border border-[#e5e0ff] rounded-lg p-3 space-y-2">
                            <h4 className="text-[9px] font-bold text-gray-500 uppercase">Main image</h4>
                            <div onClick={() => fileInputRef.current.click()}
                                className="w-full h-32 border-2 border-dashed border-[#e5e0ff] rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-50/50 transition-all overflow-hidden group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-full object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-[#6355d8] font-bold text-[10px]">
                                        <Upload size={20} />
                                        <span>Click to update image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-[#e5e0ff] rounded-lg p-3 space-y-2">
                            <h4 className="text-[9px] font-bold text-gray-500 uppercase">Gallery</h4>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {galleryPreviews.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-[#e5e0ff] bg-gray-50 p-1 group">
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeGalleryImage(i, i < existingGallery.length); }}
                                            className="absolute top-0 right-0 p-0.5 bg-white border border-gray-100 rounded-bl-md text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                                            <X size={8} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => otherFilesRef.current.click()}
                                    className="aspect-square border-2 border-dashed border-[#e5e0ff] rounded-md flex flex-col items-center justify-center text-[#6355d8] hover:bg-purple-50/50 transition-all">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <input type="file" ref={otherFilesRef} onChange={handleOtherUpload} accept="image/*" multiple className="hidden" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className="relative">
                                <input type="checkbox" checked={formData.isVeg} onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })} className="sr-only" />
                                <div className={`w-8 h-4 rounded-full transition-colors ${formData.isVeg ? 'bg-[#0c831f]' : 'bg-gray-200'}`} />
                                <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${formData.isVeg ? 'translate-x-4' : ''}`} />
                            </div>
                            <span className="text-[11px] font-bold text-gray-600">Vegetarian item</span>
                        </label>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;

