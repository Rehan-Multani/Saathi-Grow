import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, Filter, Save, RefreshCw, Plus, Minus, Layers, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../../../common/utils/formatUtils';

const StockManagement = () => {
    const { products, updateProductStock, fetchProducts, setLoading } = useVendor();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, low, out
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust to show right amount of lines

    // Local state for stock changes before saving
    const [stockUpdates, setStockUpdates] = useState({});

    // Reset page to 1 on search or filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const stock = stockUpdates[product._id] ?? product.stock;
        const matchesFilter =
            filterStatus === 'all' ? true :
                filterStatus === 'low' ? stock <= (product.lowStockThreshold || 10) && stock > 0 :
                    filterStatus === 'out' ? stock === 0 : true;
        return matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Stats Calculations
    const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // Calculate Total Inventory Value (considering local updates)
    const totalValue = products.reduce((sum, product) => {
        const currentStock = stockUpdates[product._id] ?? product.stock;
        return sum + ((product.basePrice || 0) * currentStock);
    }, 0);

    const handleStockChange = (id, delta) => {
        const product = products.find(p => p._id === id);
        if (!product) return;
        const currentStock = stockUpdates[id] ?? product.stock;
        const newStock = Math.max(0, currentStock + delta);
        setStockUpdates({ ...stockUpdates, [id]: newStock });
    };

    const handleSaveStock = async (id) => {
        const newStock = stockUpdates[id];
        if (newStock !== undefined) {
            const success = await updateProductStock(id, { stock: newStock });
            if (success) {
                // Clear update state for this item
                const newUpdates = { ...stockUpdates };
                delete newUpdates[id];
                setStockUpdates(newUpdates);
            }
        }
    };

    const handleSaveAll = async () => {
        setLoading?.(true); // From context if available, otherwise manual
        try {
            const updates = Object.entries(stockUpdates);
            for (const [id, stock] of updates) {
                await updateProductStock(id, { stock });
            }
            setStockUpdates({});
        } finally {
            setLoading?.(false);
        }
    };

    const handleResetAll = () => {
        setStockUpdates({});
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await fetchProducts();
        setIsSyncing(false);
    };

    const getStockValue = (product) => {
        return stockUpdates[product._id] ?? product.stock;
    };

    const hasUnsavedChanges = (id) => {
        const product = products.find(p => p._id === id);
        return product && stockUpdates[id] !== undefined && stockUpdates[id] !== product.stock;
    };

    const hasAnyChanges = Object.keys(stockUpdates).length > 0;

    return (
        <div className="space-y-4 lg:space-y-4 pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-2">
                <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Stock Management</h1>
                    <p className="text-xs text-gray-500 font-medium">Track and update your inventory levels</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {hasAnyChanges && (
                        <>
                            <button
                                onClick={handleResetAll}
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <RotateCcw size={14} /> Reset
                            </button>
                            <button
                                onClick={handleSaveAll}
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#0c831f] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0a6b19] shadow-sm transition-colors animate-in fade-in slide-in-from-right-2"
                            >
                                <Save size={14} /> Save All Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Items</p>
                        <p className="text-lg font-extrabold text-gray-900">{products.length}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Layers size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Stock Value</p>
                        <p className="text-lg font-extrabold text-gray-900">{formatCurrency(totalValue)}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Low Stock</p>
                        <p className="text-lg font-extrabold text-gray-900">{lowStockCount}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <Filter size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Out of Stock</p>
                        <p className="text-lg font-extrabold text-gray-900">{outOfStockCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 sticky top-16 z-20 md:static">
                <div className="flex items-center gap-2 flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#0c831f] transition-colors">
                    <Search className="text-gray-400 shrink-0" size={15} />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-plain flex-1 min-w-0 text-xs text-gray-700 placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2 text-xs font-bold overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap border transition-colors ${filterStatus === 'all' ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setFilterStatus('low')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap border transition-colors ${filterStatus === 'low' ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        Low Stock
                    </button>
                    <button
                        onClick={() => setFilterStatus('out')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap border transition-colors ${filterStatus === 'out' ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        Out of Stock
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit Value</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Stock</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 lg:py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentProducts.map((product) => {
                                const currentStock = getStockValue(product);
                                const isUnsaved = hasUnsavedChanges(product._id);
                                return (
                                    <tr key={product._id} className={`transition-colors ${isUnsaved ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 py-3 lg:py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5 text-xs font-bold text-gray-600">
                                            {formatCurrency(product.basePrice)}
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleStockChange(product._id, -1)} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                    <Minus size={12} />
                                                </button>
                                                <span className={`w-10 text-center font-bold text-sm ${currentStock === 0 ? 'text-red-500' : isUnsaved ? 'text-[#0c831f]' : 'text-gray-900'}`}>
                                                    {currentStock}
                                                </span>
                                                <button onClick={() => handleStockChange(product._id, 1)} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentStock === 0 ? 'bg-red-50 text-red-600 border-red-100' :
                                                currentStock <= (product.lowStockThreshold || 10) ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {currentStock === 0 ? 'Out of Stock' : currentStock <= (product.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5 text-right">
                                            <button
                                                disabled={!isUnsaved}
                                                onClick={() => handleSaveStock(product._id)}
                                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg flex items-center gap-1 ml-auto transition-all ${isUnsaved
                                                    ? 'bg-[#0c831f] text-white hover:bg-[#0a6b19] shadow-sm active:scale-95'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Save size={12} /> Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {currentProducts.map((product) => {
                    const currentStock = getStockValue(product);
                    const isUnsaved = hasUnsavedChanges(product._id);
                    return (
                        <div key={product._id} className={`bg-white p-3 rounded-xl shadow-sm border transition-colors ${isUnsaved ? 'border-[#0c831f] bg-green-50/10' : 'border-gray-100'}`}>
                            <div className="flex gap-3">
                                <div className="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-medium">{product.category} · {formatCurrency(product.basePrice)}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${currentStock === 0 ? 'bg-red-50 text-red-600 border-red-100' :
                                            currentStock <= (product.lowStockThreshold || 10) ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {currentStock === 0 ? 'Out' : currentStock <= (product.lowStockThreshold || 10) ? 'Low' : 'Stock'}
                                        </span>
                                    </div>

                                    <div className="flex items-end justify-between mt-2">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button onClick={() => handleStockChange(product._id, -1)} className="p-1 rounded bg-white text-gray-600 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                <Minus size={12} />
                                            </button>
                                            <span className={`w-8 text-center font-bold text-xs ${currentStock === 0 ? 'text-red-500' : isUnsaved ? 'text-[#0c831f]' : 'text-gray-900'}`}>
                                                {currentStock}
                                            </span>
                                            <button onClick={() => handleStockChange(product._id, 1)} className="p-1 rounded bg-white text-gray-600 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <button
                                            disabled={!isUnsaved}
                                            onClick={() => handleSaveStock(product._id)}
                                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all ${isUnsaved
                                                ? 'bg-[#0c831f] text-white hover:bg-[#0a6b19]'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <Save size={12} /> Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {true && (
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 gap-3 mt-4">
                    <span className="text-xs text-gray-500 font-medium">
                        Showing {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-hide">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg border transition-all ${currentPage === 1 ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages || 1 }).map((_, i) => {
                                const pageNumber = i + 1;
                                // Condense rendering logic to show ends and neighborhood of current page
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === (totalPages || 1) ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === pageNumber
                                                ? 'bg-[#0c831f] text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                } else if (
                                    pageNumber === currentPage - 2 ||
                                    pageNumber === currentPage + 2
                                ) {
                                    return <span key={pageNumber} className="text-gray-400 text-xs px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-1.5 rounded-lg border transition-all ${currentPage === totalPages || totalPages === 0 ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockManagement;
