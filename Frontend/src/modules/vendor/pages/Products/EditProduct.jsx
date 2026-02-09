import React, { useState } from 'react';
import { Save, X, ArrowLeft, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';

const EditProduct = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { products, updateProduct } = useVendor();

    const existingProduct = products.find(p => p.id === parseInt(productId)) || null;

    const [form, setForm] = useState(existingProduct || {
        name: '',
        category: '',
        price: 0,
        stock: 0,
        description: '',
        image: ''
    });

    const categories = ['Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Staples', 'Munchies'];

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProduct(form);
        navigate('/vendor/products');
    };

    if (!existingProduct) {
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/vendor/products')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-sm text-gray-500">Update product information</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="premium-card p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Image Preview */}
                    <div className="flex justify-center">
                        <div className="w-32 h-32 bg-gray-50 rounded-lg border-2 border-gray-200 p-2 flex items-center justify-center">
                            {form.image ? (
                                <img src={form.image} alt={form.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center">
                                    <Package size={32} className="text-gray-300 mx-auto mb-2" />
                                    <span className="text-xs text-gray-400 font-medium">No image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none transition-colors"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter product name"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none transition-colors"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none transition-colors"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">
                                Stock Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none transition-colors"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Description</label>
                        <textarea
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none resize-none transition-colors"
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Enter product description..."
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Image URL</label>
                        <input
                            type="url"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none transition-colors"
                            value={form.image || ''}
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/vendor/products')}
                            className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19] flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Save size={16} />
                            Update Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
