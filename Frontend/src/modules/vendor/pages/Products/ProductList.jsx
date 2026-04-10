import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, AlertCircle, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../../../common/utils/formatUtils';

const ProductList = () => {
    const { products } = useVendor();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
        const matchesStatus = statusFilter === 'all' ? true : (product.status || 'Active') === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
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
            'Pending Approval': 'bg-amber-50 text-amber-600 border-amber-100',
            'Active': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'Rejected': 'bg-rose-50 text-rose-600 border-rose-100',
            'Inactive': 'bg-slate-100 text-slate-400 border-slate-200'
        };
        const config = {
            'Pending Approval': { icon: <Clock size={10} />, label: 'PENDING' },
            'Active': { icon: <CheckCircle size={10} />, label: 'ACTIVE' },
            'Rejected': { icon: <XCircle size={10} />, label: 'REJECTED' },
            'Inactive': { icon: <AlertCircle size={10} />, label: 'INACTIVE' }
        };
        const current = config[status] || { icon: <CheckCircle size={10} />, label: 'ACTIVE' };
        
        return (
            <span className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all ${variants[status] || 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {current.icon} {current.label}
            </span>
        );
    };

    const PaginationUI = () => (
        totalItems > 0 && (
            <div className="border-t border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Catalog Exposure: <strong className="text-slate-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</strong> / <strong className="text-slate-900">{totalItems}</strong> SKU's
                </span>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => {
                            const p = i + 1;
                            if (totalPages > 5) {
                                if (p !== 1 && p !== totalPages && Math.abs(currentPage - p) > 1) {
                                    if (p === 2 && currentPage > 3) return <span key="dots1" className="text-slate-300">...</span>;
                                    if (p === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" className="text-slate-300">...</span>;
                                    return null;
                                }
                            }
                            return (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )
    );

    return (
        <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1.5 uppercase tracking-widest">Inventory Catalog</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Deployment Index: <span className="text-slate-900 font-black">{products.length} Units</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
                        <div className="flex-1 max-w-md relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Query resource SKU/Identity..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 transition-all outline-none shadow-sm"
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-blue-500/50 transition-all shadow-sm"
                            >
                                <option value="all">System Categories</option>
                                {categories.filter(c => c !== 'all').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-blue-500/50 transition-all shadow-sm"
                            >
                                <option value="all">Audit Status</option>
                                <option value="Active">Operational</option>
                                <option value="Pending Approval">Buffering</option>
                                <option value="Rejected">Flagged</option>
                                <option value="Inactive">Offline</option>
                            </select>
                        </div>

                        <button
                            onClick={() => navigate('/vendor/products/add')}
                            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} /> Propose SKU
                        </button>
                    </div>
                </div>
            </div>

            {/* Catalog Table */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Unit Valuation</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inventory Depth</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Terminal Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-2 shadow-sm transition-transform group-hover:scale-110 duration-500">
                                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1 truncate max-w-[240px]">{product.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[9px] font-black uppercase tracking-widest">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                                                    <span className="text-[9px] text-slate-300 font-mono font-bold uppercase tracking-widest">{product.sku}</span>
                                                    {product.isSaathiGrow && <Sparkles size={10} className="text-blue-500" />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="text-sm font-black text-slate-900 tracking-tighter">₹{product.basePrice?.toLocaleString()}</div>
                                        {product.mrp > product.basePrice && <div className="text-[10px] text-slate-300 line-through font-bold">₹{product.mrp?.toLocaleString()}</div>}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${product.totalStock < (product.lowStockThreshold || 10) ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                            {product.totalStock} {product.unitType || 'PCS'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <StatusBadge status={product.status || 'Active'} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2.5">
                                            <button 
                                                onClick={() => navigate(`edit/${product._id}`)} 
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all border border-slate-100 shadow-sm active:scale-90"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => { if (window.confirm('Initiate permanent resource deletion?')) navigate(`delete/${product._id}`) }} 
                                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all border border-slate-100 shadow-sm active:scale-90"
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
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-xl border border-slate-100 mb-6">
                        <Package size={32} strokeWidth={1} />
                    </div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No Resources Identified</h3>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest opacity-60">Adjust query parameters to expand scan range</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;
