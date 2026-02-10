import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../utils/formatDate';

const ProductList = () => {
    const { products } = useVendor();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [priceRange, setPriceRange] = useState('all');

    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

        // Stock filter
        const matchesStock =
            stockFilter === 'all' ? true :
                stockFilter === 'low' ? product.stock < 20 :
                    stockFilter === 'instock' ? product.stock >= 20 :
                        stockFilter === 'outofstock' ? product.stock === 0 : true;

        // Price filter
        const matchesPrice =
            priceRange === 'all' ? true :
                priceRange === 'under50' ? product.price < 50 :
                    priceRange === '50-100' ? product.price >= 50 && product.price <= 100 :
                        priceRange === 'over100' ? product.price > 100 : true;

        return matchesSearch && matchesCategory && matchesStock && matchesPrice;
    });

    const clearFilters = () => {
        setCategoryFilter('all');
        setStockFilter('all');
        setPriceRange('all');
    };

    const activeFilterCount = [categoryFilter, stockFilter, priceRange].filter(f => f !== 'all').length;

    return (
        <div className="space-y-4 lg:space-y-5 relative pb-20 md:pb-0">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-base lg:text-xl font-bold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-[10px] lg:text-xs text-gray-500 font-medium">Manage your product inventory</p>
                </div>
                <button
                    onClick={() => navigate('/vendor/products/add')}
                    className="w-full sm:w-auto px-4 py-1.5 bg-[#0c831f] text-white text-xs font-bold rounded-lg hover:bg-[#0a6b19] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={16} />
                    Add product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-100 sticky top-0 z-20 transition-shadow">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#0c831f] focus:outline-none text-xs"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold transition-colors ${showFilters || activeFilterCount > 0
                            ? 'bg-[#0c831f] text-white border-[#0c831f]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={14} />
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Category Filter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-600 uppercase mb-1.5 block">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] focus:outline-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Filter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-600 uppercase mb-1.5 block">Stock Status</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] focus:outline-none"
                            >
                                <option value="all">All Stock</option>
                                <option value="instock">In Stock (≥20)</option>
                                <option value="low">Low Stock (&lt;20)</option>
                                <option value="outofstock">Out of Stock</option>
                            </select>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-600 uppercase mb-1.5 block">Price Range</label>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-[#0c831f] focus:outline-none"
                            >
                                <option value="all">All Prices</option>
                                <option value="under50">Under ₹50</option>
                                <option value="50-100">₹50 - ₹100</option>
                                <option value="over100">Over ₹100</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {activeFilterCount > 0 && (
                            <div className="md:col-span-3">
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-2.5 lg:py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-2.5 lg:py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-2.5 lg:py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-2.5 lg:py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-2.5 lg:py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-2 lg:py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded bg-white border border-gray-100 p-0.5 flex-shrink-0">
                                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-800 tracking-tight">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 lg:py-2 text-[11px] text-gray-500 font-medium">{product.category}</td>
                                        <td className="px-4 py-2 lg:py-2 text-xs font-bold text-gray-900">{formatCurrency(product.price)}</td>
                                        <td className="px-4 py-2 lg:py-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.stock < 20
                                                ? 'bg-red-50 text-red-600 border border-red-100/50'
                                                : 'bg-green-50 text-green-700 border border-green-100/50'
                                                }`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 lg:py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`edit/${product.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                                                    title="Edit product"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`delete/${product.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={20} className="text-gray-300" />
                                            <p className="text-xs font-medium">No products found matching "{searchQuery}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: Cards replaced with List */}
            <div className="md:hidden divide-y divide-gray-100 bg-white rounded-lg border border-gray-100">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="p-3 flex gap-3 hover:bg-gray-50 transition-colors">
                            {/* Image */}
                            <div className="w-16 h-16 bg-white rounded border border-gray-100 p-0.5 flex-shrink-0">
                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-800 truncate tracking-tight">{product.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold">{product.category}</p>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs font-bold text-gray-900">{formatCurrency(product.price)}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${product.stock < 20
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-green-50 text-green-700'
                                        }`}>
                                        {product.stock} units
                                    </span>
                                </div>

                                {/* Mobile Actions */}
                                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-50/50">
                                    <button
                                        onClick={() => navigate(`edit/${product.id}`)}
                                        className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded hover:bg-gray-100 flex items-center gap-1"
                                    >
                                        <Edit2 size={10} /> Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`delete/${product.id}`)}
                                        className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-bold rounded hover:bg-red-100 flex items-center gap-1"
                                    >
                                        <Trash2 size={10} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <Search size={20} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-[11px] font-bold text-gray-400 tracking-tight">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
