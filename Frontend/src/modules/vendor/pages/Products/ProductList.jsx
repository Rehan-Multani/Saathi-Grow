import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../utils/formatDate';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

const ProductList = () => {
    const { products } = useVendor();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const categories = ['all', ...new Set(products.map(p => typeof p.category === 'object' ? p.category.name : p.category))];

    const filteredProducts = products.map(p => ({
        ...p,
        totalStock: p.stock || 0
    })).filter(product => {
        const categoryName = typeof product.category === 'object' ? product.category.name : (product.category || '');
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = categoryFilter === 'all' || categoryName === categoryFilter;

        const matchesStock = stockFilter === 'all' ? true :
            stockFilter === 'low' ? product.totalStock < (product.lowStockThreshold || 10) :
                stockFilter === 'instock' ? product.totalStock >= (product.lowStockThreshold || 10) :
                    stockFilter === 'outofstock' ? product.totalStock === 0 : true;

        const matchesStatus = statusFilter === 'all' ? true : (product.status || 'Active') === statusFilter;

        return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending Approval':
                return <Badge bg="warning" className="text-dark d-flex align-items-center gap-1 py-1.5 px-2.5 font-bold text-[9px]"><Clock size={10} /> PENDING</Badge>;
            case 'Active':
                return <Badge bg="success" className="d-flex align-items-center gap-1 py-1.5 px-2.5 font-bold text-[9px]"><CheckCircle size={10} /> ACTIVE</Badge>;
            case 'Rejected':
                return <Badge bg="danger" className="d-flex align-items-center gap-1 py-1.5 px-2.5 font-bold text-[9px]"><XCircle size={10} /> REJECTED</Badge>;
            case 'Inactive':
                return <Badge bg="secondary" className="d-flex align-items-center gap-1 py-1.5 px-2.5 font-bold text-[9px]"><AlertCircle size={10} /> INACTIVE</Badge>;
            default:
                return <Badge bg="info" className="d-flex align-items-center gap-1 py-1.5 px-2.5 font-bold text-[9px]">ACTIVE</Badge>;
        }
    };

    return (
        <div className="space-y-4 lg:space-y-6 relative pb-20 md:pb-0 p-3 bg-white min-vh-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h4 className="fw-bold mb-1">My Products</h4>
                    <p className="text-xs text-muted mb-0">Total listing: <strong>{products.length}</strong> products</p>
                </div>
                <button
                    onClick={() => navigate('/vendor/products/add')}
                    className="px-6 py-2 bg-[#0c831f] text-white text-xs font-bold rounded-lg hover:bg-[#0a6b19] flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={16} /> Add New Product
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-light p-3 rounded-xl border border-gray-100 sticky top-0 z-20">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, category or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-xs shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white outline-none focus:border-[#0c831f]"
                        >
                            <option value="all">All Categories</option>
                            {categories.filter(c => c !== 'all').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white outline-none focus:border-[#0c831f]"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending Approval">Pending</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] border-b">
                        <tr>
                            <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Product Info</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Pricing</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-center">Stock</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-center">Status</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 p-1 shadow-sm flex-shrink-0">
                                            <img src={product.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-dark truncate max-w-[200px] mb-0.5">{product.name}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge bg="light" className="text-muted border font-semibold text-[8px] uppercase">{typeof product.category === 'object' ? product.category.name : product.category}</Badge>
                                                <span className="text-[9px] text-gray-400 font-mono italic">{product.sku}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-xs font-bold text-dark">{formatCurrency(product.basePrice)}</div>
                                    {product.mrp > product.basePrice && <div className="text-[10px] text-muted line-through">{formatCurrency(product.mrp)}</div>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${product.totalStock < (product.lowStockThreshold || 10) ? 'bg-red-50 text-red-600' : 'bg-[#e7f6ec] text-[#0c831f]'}`}>
                                        {product.totalStock} {product.unitType || 'pcs'}
                                    </div>
                                    <div className="text-[8px] text-muted mt-0.5 font-bold uppercase tracking-tight">Current Inventory</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        {getStatusBadge(product.status || 'Active')}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-end">
                                    <div className="flex items-center justify-end gap-2">
                                        <OverlayTrigger overlay={<Tooltip>Edit Details</Tooltip>}>
                                            <button onClick={() => navigate(`edit/${product._id}`)} className="p-2 text-gray-400 hover:text-success hover:bg-success-light rounded-lg transition-colors border border-gray-100">
                                                <Edit2 size={14} />
                                            </button>
                                        </OverlayTrigger>
                                        <OverlayTrigger overlay={<Tooltip>Delete Product</Tooltip>}>
                                            <button onClick={() => { if (window.confirm('Delete this product permanently?')) navigate(`delete/${product._id}`) }} className="p-2 text-gray-400 hover:text-danger hover:bg-danger-light rounded-lg transition-colors border border-gray-100">
                                                <Trash2 size={14} />
                                            </button>
                                        </OverlayTrigger>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                        <div className="w-20 h-20 bg-white rounded-lg border border-gray-100 p-1 flex-shrink-0">
                            <img src={product.image} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h6 className="text-xs font-bold text-dark truncate mb-0 tracking-tight">{product.name}</h6>
                                    {getStatusBadge(product.status || 'Active')}
                                </div>
                                <span className="text-[10px] text-muted font-bold uppercase">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-sm font-bold text-[#0c831f]">{formatCurrency(product.basePrice)}</div>
                                <div className={`text-[10px] font-bold ${product.totalStock < (product.lowStockThreshold || 10) ? 'text-red-500' : 'text-gray-400'}`}>
                                    Stock: {product.totalStock}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => navigate(`edit/${product._id}`)} className="flex-1 py-1.5 bg-light border text-dark text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
                                    <Edit2 size={12} /> EDIT
                                </button>
                                <button onClick={() => navigate(`delete/${product._id}`)} className="flex-1 py-1.5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
                                    <Trash2 size={12} /> DELETE
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-light rounded-3xl border border-dashed border-gray-300 mx-3">
                    <Search size={40} className="mx-auto text-gray-300 mb-3" />
                    <h6 className="text-muted fw-bold">No Products Found</h6>
                    <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;
