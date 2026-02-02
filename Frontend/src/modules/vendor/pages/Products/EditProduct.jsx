import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';

const EditProduct = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { products, updateProduct } = useVendor();

    const existingProduct = products.find(p => p.id === parseInt(productId)) || {
        name: '',
        category: '',
        price: 0,
        stock: 0,
        description: '',
        image: ''
    };

    const [form, setForm] = useState(existingProduct);

    const categories = ['Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Staples', 'Munchies'];

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProduct(form);
        navigate('/vendor/products');
    };

    if (!existingProduct.name) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => navigate('/vendor/products')}>
            <div
                className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-none md:border border-gray-100 animate-in zoom-in-95 duration-300 relative z-10 flex flex-col h-full md:h-auto md:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
                    <button onClick={() => navigate('/vendor/products')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Preview Area - Highlighting the product visually */}
                        <div className="flex justify-center mb-2">
                            <div className="w-32 h-32 bg-white rounded-xl shadow-md border border-gray-100 p-2 flex items-center justify-center relative group">
                                {form.image ? (
                                    <img src={form.image} alt={form.name} className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <span className="text-gray-400 text-xs">No Image</span>
                                )}
                                <div className="absolute -bottom-2 bg-white px-3 py-1 rounded-full shadow-sm text-[10px] font-bold text-gray-500 border border-gray-100">
                                    {form.category}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Product Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all placeholder:text-gray-400"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Category</label>
                                <select
                                    required
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 focus:outline-none bg-white transition-all"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Stock Quantity</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all"
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Description</label>
                            <textarea
                                rows="3"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 focus:outline-none resize-none transition-all"
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Enter product description..."
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-4">
                            <button type="button" onClick={() => navigate('/vendor/products')} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19] flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20 active:scale-95">
                                <Save size={18} />
                                Update Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
