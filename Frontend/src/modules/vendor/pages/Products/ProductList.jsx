import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, Clock, XCircle, AlertCircle, ChevronLeft, ChevronRight, Package, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../../../common/utils/formatUtils';

const ProductList = () => {
    const { products } = useVendor();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const categories = ['all', ...new Set(products.map(p => typeof p.category === 'object' ? p.category.name : p.category))];

    const filteredProducts = products.map(p => ({
        ...p,
        totalStock: p.stock || 0
    })).filter(product => {
        const categoryName = typeof product.category === 'object' ? product.category.name : (product.category || '');
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(query) ||
            categoryName.toLowerCase().includes(query) ||
            (product.sku && product.sku.toLowerCase().includes(query));

        const matchesCategory = categoryFilter === 'all' || categoryName === categoryFilter;
        const matchesStatus = statusFilter === 'all' ? true : (product.status || 'Active') === statusFilter;
        const stock = product.totalStock;
        const matchesStock =
            stockFilter === 'all' ? true :
            stockFilter === 'low' ? stock <= (product.lowStockThreshold || 10) && stock > 0 :
            stockFilter === 'out' ? stock === 0 : true;

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });

    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const StatusBadge = ({ status }) => {
        const variants = {
            'Pending Approval': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Active': 'bg-green-50 text-green-700 border-green-200',
            'Rejected': 'bg-red-50 text-red-700 border-red-200',
            'Inactive': 'bg-gray-100 text-gray-600 border-gray-200'
        };
        const config = {
            'Pending Approval': { icon: <Clock size={12} />, label: 'PENDING' },
            'Active': { icon: <CheckCircle size={12} />, label: 'ACTIVE' },
            'Rejected': { icon: <XCircle size={12} />, label: 'REJECTED' },
            'Inactive': { icon: <AlertCircle size={12} />, label: 'INACTIVE' }
        };
        const current = config[status] || { icon: <CheckCircle size={12} />, label: 'ACTIVE' };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[status] || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {current.icon} {current.label}
            </span>
        );
    };

    const PaginationUI = () => (
        totalItems > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
                <span className="text-xs font-medium text-gray-500">
                    Showing <strong className="text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</strong> of <strong className="text-gray-900">{totalItems}</strong> products
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold shadow-sm"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => {
                            const p = i + 1;
                            if (totalPages > 5) {
                                if (p !== 1 && p !== totalPages && Math.abs(currentPage - p) > 1) {
                                    if (p === 2 && currentPage > 3) return <span key="dots1" className="text-gray-400 px-1">...</span>;
                                    if (p === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" className="text-gray-400 px-1">...</span>;
                                    return null;
                                }
                            }
                            return (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentPage === p ? 'bg-[#0c831f] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold shadow-sm"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your complete product catalog.</p>
                </div>
                <button
                    onClick={() => navigate('/vendor/products/add')}
                    className="w-full md:w-auto bg-[#0c831f] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0a6b19] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] transition-all outline-none"
                        />
                    </div>

                    {/* Filter Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterPanel(p => !p)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                (categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all')
                                    ? 'bg-[#0c831f] text-white border-[#0c831f] shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <SlidersHorizontal size={15} />
                            Filter
                            {(categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all') && (
                                <span className="ml-1 bg-white text-[#0c831f] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                    {[categoryFilter, statusFilter, stockFilter].filter(f => f !== 'all').length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilterPanel && (
                    <div className="px-4 pb-4 pt-0 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex flex-wrap gap-6 pt-3">
                            {/* Category */}
                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#0c831f] transition-all"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.filter(c => c !== 'all').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1.5 min-w-[130px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#0c831f] transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Pending Approval">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Stock */}
                            <div className="flex flex-col gap-1.5 min-w-[130px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => handleFilterChange(setStockFilter, e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#0c831f] transition-all"
                                >
                                    <option value="all">All Stock</option>
                                    <option value="low">Low Stock</option>
                                    <option value="out">Out of Stock</option>
                                </select>
                            </div>

                            {/* Reset */}
                            {(categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all') && (
                                <div className="flex flex-col justify-end">
                                    <button
                                        onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setStockFilter('all'); setCurrentPage(1); }}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <X size={12} /> Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pricing</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0">
                                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 font-medium">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono font-medium">{product.sku}</span>
                                                    {product.isSaathigro && <Sparkles size={12} className="text-yellow-500" />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-bold text-gray-900">₹{product.basePrice?.toLocaleString()}</div>
                                        {product.mrp > product.basePrice && <div className="text-xs text-gray-400 line-through font-medium">₹{product.mrp?.toLocaleString()}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${product.totalStock < (product.lowStockThreshold || 10) ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                            {product.totalStock} {product.unitType || 'pcs'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <StatusBadge status={product.status || 'Active'} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`edit/${product._id}`)}
                                                className="p-1.5 text-gray-400 hover:text-[#0c831f] hover:bg-green-50 rounded-md transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => { if (window.confirm('Are you sure you want to delete this product?')) navigate(`delete/${product._id}`) }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationUI />
            </div>

            {totalItems === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 mt-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <Package size={28} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No products found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;
