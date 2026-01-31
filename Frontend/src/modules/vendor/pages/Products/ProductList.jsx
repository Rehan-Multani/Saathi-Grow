import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../utils/formatDate';

const ProductList = () => {
    const { products } = useVendor();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 relative pb-20 md:pb-0">
            {/* Nested Routes (Modal) */}
            <Outlet />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">Manage your product inventory</p>
                </div>
                <button
                    onClick={() => navigate('/vendor/products/add')}
                    className="w-full sm:w-auto px-4 py-2 bg-[#0c831f] text-white font-bold rounded-lg hover:bg-[#0a6b19] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 sticky top-16 z-20 md:static">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(product.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock < 20
                                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                                    : 'bg-green-50 text-green-700 border border-green-100'
                                                }`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`edit/${product.id}`)}
                                                    className="p-2 text-gray-400 hover:text-[#0c831f] hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`delete/${product.id}`)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={24} className="text-gray-300" />
                                            <p>No products found matching "{searchQuery}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            {/* Image */}
                            <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.category}</p>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.stock < 20
                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                            : 'bg-green-50 text-green-700 border border-green-100'
                                        }`}>
                                        {product.stock} units
                                    </span>
                                </div>

                                {/* Mobile Actions */}
                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                                    <button
                                        onClick={() => navigate(`edit/${product.id}`)}
                                        className="flex-1 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`delete/${product.id}`)}
                                        className="flex-1 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <Search size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
