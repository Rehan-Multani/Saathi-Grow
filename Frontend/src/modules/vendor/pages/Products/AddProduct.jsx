import React, { useState, useRef } from 'react';
import { X, Upload, ChevronDown, Plus, Trash2, Image as ImageIcon, Info, DollarSign, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';

const AddProduct = () => {
    const navigate = useNavigate();
    const { addProduct } = useVendor();
    const fileInputRef = useRef(null);

    const [images, setImages] = useState([]);
    const [tempImageUrl, setTempImageUrl] = useState('');

    // More comprehensive state
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: 'Vegetables & Fruits',
        mrp: '',
        price: '',
        unit: '',
        description: '',
        isVeg: true,
        stock: 10
    });

    const categories = [
        'Vegetables & Fruits', 'Dairy & Breakfast', 'Munchies', 'Cold Drinks',
        'Instant Food', 'Tea, Coffee & Health Drinks', 'Bakery & Biscuits'
    ];

    const calculateDiscount = () => {
        if (formData.mrp && formData.price) {
            const discount = ((formData.mrp - formData.price) / formData.mrp) * 100;
            return discount > 0 ? Math.round(discount) + '% OFF' : '';
        }
        return '';
    };

    // URL Handler
    const handleAddImageUrl = () => {
        if (tempImageUrl.trim()) {
            setImages([...images, tempImageUrl]);
            setTempImageUrl('');
        }
    };

    const handleUrlKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddImageUrl();
        }
    };

    // File Upload Handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a local blob URL for preview
            const objectUrl = URL.createObjectURL(file);
            setImages([...images, objectUrl]);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addProduct({
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            // Compatibility: Use first image as main image, keep array too
            image: images.length > 0 ? images[0] : 'https://via.placeholder.com/150',
            images: images
        });
        navigate('/vendor/products');
    };

    return (
        <div className="bg-white md:rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[calc(100vh-100px)]">

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 transition-shadow shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/vendor/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Add New Product</h1>
                        <p className="text-sm text-gray-500 hidden md:block">Fill in the details to list your item</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/vendor/products')}
                        className="hidden md:block px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-lg bg-[#0c831f] text-white text-sm font-bold hover:bg-[#0a6b19] shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Product
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Media (Sticky on Desktop) */}
                        <div className="w-full lg:w-1/3 space-y-4">
                            <div className="lg:sticky lg:top-8 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Product Images</h3>

                                {/* Main Preview Area (Click to Upload) */}
                                <div
                                    onClick={triggerFileUpload}
                                    className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#0c831f]/50 hover:bg-green-50/10 cursor-pointer transition-all"
                                >
                                    {images.length > 0 ? (
                                        <>
                                            <img src={images[0]} alt="Main" className="w-full h-full object-contain p-4 mix-blend-multiply" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2">
                                                    <Upload size={14} /> Change Image
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:scale-110 transition-transform duration-300">
                                                <Upload size={20} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-600">Click to Upload</p>
                                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                                        </div>
                                    )}
                                </div>

                                {/* URL Input Simulation */}
                                <div className="flex gap-2">
                                    <input
                                        value={tempImageUrl}
                                        onChange={(e) => setTempImageUrl(e.target.value)}
                                        onKeyDown={handleUrlKeyDown}
                                        placeholder="Or paste image URL here..."
                                        className="flex-1 text-xs px-3 py-2 border rounded-lg focus:border-[#0c831f] outline-none bg-gray-50 focus:bg-white transition-all shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddImageUrl}
                                        className="px-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Thumbnails List */}
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg border border-gray-200 relative overflow-hidden group cursor-pointer bg-white hover:border-[#0c831f] transition-all">
                                            <img src={img} alt="" className="w-full h-full object-cover" onClick={() => {
                                                // Clicking thumbnail could set it as main? For now just preview.
                                                // Or functionality to swap? 
                                                // Simple swap logic:
                                                const newImages = [...images];
                                                [newImages[0], newImages[idx]] = [newImages[idx], newImages[0]];
                                                setImages(newImages);
                                            }} />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                                className="absolute top-0.5 right-0.5 p-1 bg-black/50 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={10} className="text-white" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Functional Empty Slots - Click to Upload */}
                                    {[...Array(Math.max(0, 3 - images.length))].map((_, i) => (
                                        <button
                                            key={`empty-${i}`}
                                            type="button"
                                            onClick={triggerFileUpload}
                                            className="aspect-square rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 hover:border-[#0c831f] hover:text-[#0c831f] hover:bg-green-50/30 transition-all"
                                            title="Add Image"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details Form */}
                        <div className="flex-1 space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <Info size={18} className="text-[#0c831f]" /> Basic Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Brand Name</label>
                                        <input
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all"
                                            placeholder="e.g. Amul"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Product Name</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all"
                                            placeholder="e.g. Toned Milk"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Category</label>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Food Preference</label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="radio" checked={formData.isVeg} onChange={() => setFormData({ ...formData, isVeg: true })} name="veg" className="hidden" />
                                                <div className={`w-5 h-5 border-2 flex items-center justify-center rounded transition-colors ${formData.isVeg ? 'border-green-600 bg-green-50' : 'border-gray-300 group-hover:border-green-400'}`}>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${formData.isVeg ? 'bg-green-600' : 'bg-transparent'}`}></div>
                                                </div>
                                                <span className={`text-sm font-bold ${formData.isVeg ? 'text-green-700' : 'text-gray-500'}`}>Vegetarian</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="radio" checked={!formData.isVeg} onChange={() => setFormData({ ...formData, isVeg: false })} name="veg" className="hidden" />
                                                <div className={`w-5 h-5 border-2 flex items-center justify-center rounded transition-colors ${!formData.isVeg ? 'border-red-600 bg-red-50' : 'border-gray-300 group-hover:border-red-400'}`}>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${!formData.isVeg ? 'bg-red-600' : 'bg-transparent'}`}></div>
                                                </div>
                                                <span className={`text-sm font-bold ${!formData.isVeg ? 'text-red-700' : 'text-gray-500'}`}>Non-Vegetarian</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <DollarSign size={18} className="text-[#0c831f]" /> Pricing & Inventory
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">MRP (₹)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.mrp}
                                                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all font-mono"
                                                placeholder="100"
                                            />
                                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₹</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Selling Price (₹)</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all font-mono"
                                                placeholder="90"
                                            />
                                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₹</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Discount</label>
                                        <div className="px-4 py-2.5 bg-green-50 text-green-700 text-sm font-bold rounded-xl border border-green-100 h-[42px] flex items-center justify-center">
                                            {calculateDiscount() || 'No Discount'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Unit / Size</label>
                                        <input
                                            required
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all"
                                            placeholder="e.g. 500g, 1L, 1 Pkt"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Initial Stock</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all"
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600">Description</label>
                                <textarea
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 outline-none transition-all resize-none placeholder-gray-400"
                                    placeholder="Add product highlights, ingredients, etc."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
