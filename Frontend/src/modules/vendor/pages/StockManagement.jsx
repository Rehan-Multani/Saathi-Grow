import React, { useState } from 'react';
import { Package, AlertTriangle, Search, Filter, Save, RefreshCw, Plus, Minus, Layers, RotateCcw, Check } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../utils/formatDate';

const StockManagement = () => {
    const { products, updateProduct } = useVendor();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, low, out
    const [isSyncing, setIsSyncing] = useState(false);

    // Local state for stock changes before saving
    const [stockUpdates, setStockUpdates] = useState({});

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' ? true :
                filterStatus === 'low' ? product.stock < 20 && product.stock > 0 :
                    filterStatus === 'out' ? product.stock === 0 : true;
        return matchesSearch && matchesFilter;
    });

    // Stats Calculations
    const lowStockCount = products.filter(p => p.stock < 20 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // Calculate Total Inventory Value (considering local updates)
    const totalValue = products.reduce((sum, product) => {
        const currentStock = stockUpdates[product.id] ?? product.stock;
        return sum + (product.price * currentStock);
    }, 0);

    const handleStockChange = (id, delta) => {
        const currentStock = stockUpdates[id] ?? products.find(p => p.id === id).stock;
        const newStock = Math.max(0, currentStock + delta);
        setStockUpdates({ ...stockUpdates, [id]: newStock });
    };

    const handleSaveStock = (id) => {
        const newStock = stockUpdates[id];
        if (newStock !== undefined) {
            const product = products.find(p => p.id === id);
            updateProduct({ ...product, stock: newStock });

            // Clear update state for this item
            const newUpdates = { ...stockUpdates };
            delete newUpdates[id];
            setStockUpdates(newUpdates);
        }
    };

    const handleSaveAll = () => {
        Object.keys(stockUpdates).forEach(id => {
            const product = products.find(p => p.id === Number(id));
            if (product) {
                updateProduct({ ...product, stock: stockUpdates[id] });
            }
        });
        setStockUpdates({});
    };

    const handleResetAll = () => {
        setStockUpdates({});
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            // In a real app, this would fetch from backend
        }, 1500);
    };

    const getStockValue = (product) => {
        return stockUpdates[product.id] ?? product.stock;
    };

    const hasUnsavedChanges = (id) => {
        return stockUpdates[id] !== undefined && stockUpdates[id] !== products.find(p => p.id === id).stock;
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
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? 'Syncing...' : 'Sync Data'}
                    </button>

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
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-xs"
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
                            {filteredProducts.map((product) => {
                                const currentStock = getStockValue(product);
                                const isUnsaved = hasUnsavedChanges(product.id);
                                return (
                                    <tr key={product.id} className={`transition-colors ${isUnsaved ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
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
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleStockChange(product.id, -1)} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                    <Minus size={12} />
                                                </button>
                                                <span className={`w-10 text-center font-bold text-sm ${currentStock === 0 ? 'text-red-500' : isUnsaved ? 'text-[#0c831f]' : 'text-gray-900'}`}>
                                                    {currentStock}
                                                </span>
                                                <button onClick={() => handleStockChange(product.id, 1)} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentStock === 0 ? 'bg-red-50 text-red-600 border-red-100' :
                                                currentStock < 20 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {currentStock === 0 ? 'Out of Stock' : currentStock < 20 ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 lg:py-2.5 text-right">
                                            <button
                                                disabled={!isUnsaved}
                                                onClick={() => handleSaveStock(product.id)}
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
                {filteredProducts.map((product) => {
                    const currentStock = getStockValue(product);
                    const isUnsaved = hasUnsavedChanges(product.id);
                    return (
                        <div key={product.id} className={`bg-white p-3 rounded-xl shadow-sm border transition-colors ${isUnsaved ? 'border-[#0c831f] bg-green-50/10' : 'border-gray-100'}`}>
                            <div className="flex gap-3">
                                <div className="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-medium">{product.category} • {formatCurrency(product.price)}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${currentStock === 0 ? 'bg-red-50 text-red-600 border-red-100' :
                                            currentStock < 20 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {currentStock === 0 ? 'Out' : currentStock < 20 ? 'Low' : 'Stock'}
                                        </span>
                                    </div>

                                    <div className="flex items-end justify-between mt-2">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button onClick={() => handleStockChange(product.id, -1)} className="p-1 rounded bg-white text-gray-600 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                <Minus size={12} />
                                            </button>
                                            <span className={`w-8 text-center font-bold text-xs ${currentStock === 0 ? 'text-red-500' : isUnsaved ? 'text-[#0c831f]' : 'text-gray-900'}`}>
                                                {currentStock}
                                            </span>
                                            <button onClick={() => handleStockChange(product.id, 1)} className="p-1 rounded bg-white text-gray-600 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <button
                                            disabled={!isUnsaved}
                                            onClick={() => handleSaveStock(product.id)}
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
        </div>
    );
};

export default StockManagement;
