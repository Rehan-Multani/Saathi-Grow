import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, AlertTriangle, Search, Filter, X, ShoppingBag, ChevronLeft, ChevronRight, Store, Truck, RefreshCw, Loader2, Package } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getInventoryReports, exportInventoryCSV } from '../../api/reportApi';
import { getBranches } from '../../api/branchApi';
import { getVendors } from '../../api/vendorApi';
import { getCategories } from '../../api/categoryApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import { downloadCSV } from '../../../../common/utils/formatUtils';

const InventoryReports = () => {
    const { t } = useTranslation('admin_reports');
    const { adminUser } = useAdminAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSource, setSelectedSource] = useState({ id: '', type: '' });
    const [stockStatus, setStockStatus] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    
    // Data States
    const [inventory, setInventory] = useState([]);
    const [summary, setSummary] = useState({ totalProducts: 0, lowStockCount: 0, outOfStockCount: 0 });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    
    // Filter Options
    const [branches, setBranches] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const fetchDropdownData = useCallback(async () => {
        if (!adminUser?.token) return;
        try {
            const [branchData, vendorData, categoryData] = await Promise.all([
                getBranches(adminUser.token),
                getVendors(adminUser.token),
                getCategories(adminUser.token, { hasProducts: true })
            ]);
            setBranches(branchData || []);
            setVendors(vendorData || []);
            const cats = Array.isArray(categoryData) ? categoryData : (categoryData.categories || []);
            setCategories(cats.map(c => typeof c === 'string' ? c : c.name) || []);
        } catch (error) {
            console.error('Failed to fetch filter options');
        }
    }, [adminUser]);

    const fetchInventory = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                category: selectedCategory,
                status: stockStatus,
                branchId: selectedSource.type === 'branch' ? selectedSource.id : '',
                vendorId: selectedSource.type === 'vendor' ? selectedSource.id : ''
            };
            const res = await getInventoryReports(adminUser.token, params);
            if (res.success) {
                setInventory(res.inventory || []);
                setSummary(res.summary || { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0 });
                setTotalPages(res.pagination?.totalPages || 1);
                setTotalItems(res.pagination?.total || 0);
            }
        } catch (error) {
            // toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    }, [adminUser, page, searchTerm, selectedCategory, selectedSource, stockStatus]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, selectedSource, stockStatus]);

    const handleExport = async () => {
        if (!adminUser?.token) return;
        setExporting(true);
        try {
            const params = {
                search: searchTerm,
                category: selectedCategory,
                status: stockStatus,
                branchId: selectedSource.type === 'branch' ? selectedSource.id : '',
                vendorId: selectedSource.type === 'vendor' ? selectedSource.id : ''
            };
            const blob = await exportInventoryCSV(adminUser.token, params);
            const fileName = `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(blob, fileName);
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedSource({ id: '', type: '' });
        setStockStatus('');
        setShowFilterMenu(false);
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('inventory.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.inventoryReports} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('inventory.subtitle')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setStockStatus(stockStatus === 'Out of Stock' ? '' : 'Out of Stock')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border shadow-sm flex items-center gap-2 mr-2 ${stockStatus === 'Out of Stock' ? 'bg-rose-600 text-white border-rose-600 shadow-rose-100' : 'bg-white text-rose-600 border-rose-100 shadow-slate-100'}`}
                    >
                        <X size={14} /> {t('inventory.low_stock_alerts')} ({summary.outOfStockCount || 0})
                    </button>
                    
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>{t('sales.download')}</span>
                    </button>
                    
                    <button
                        onClick={fetchInventory}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all shadow-sm active:scale-90"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-50 flex flex-col md:flex-row justify-between items-md-center gap-4 bg-slate-50/10">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Package size={16} className="text-blue-600" /> Stock Status Table
                    </h5>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-[11px] font-bold text-slate-700 shadow-sm"
                            />
                        </div>
                        
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all shadow-sm ${showFilterMenu || selectedCategory || selectedSource.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Filter size={18} />
                            </button>
                            
                            {showFilterMenu && (
                                <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-2">
                                        <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Global Filters</h6>
                                        <button onClick={() => setShowFilterMenu(false)} className="text-slate-400 hover:text-rose-500"><X size={18} /></button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Category</label>
                                            <select 
                                                value={selectedCategory} 
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-blue-500"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Vendor Source</label>
                                            <select 
                                                value={`${selectedSource.id}|${selectedSource.type}`}
                                                onChange={(e) => {
                                                    const [id, type] = e.target.value.split('|');
                                                    setSelectedSource({ id: id || '', type: type || '' });
                                                }}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-blue-500"
                                            >
                                                <option value="|">All Sources</option>
                                                {branches.map(b => <option key={b._id} value={`${b._id}|branch`}>🏪 {b.name}</option>)}
                                                {vendors.map(v => <option key={v._id} value={`${v._id}|vendor`}>🚚 {v.storeName}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {(selectedCategory || selectedSource.id) && (
                                        <button 
                                            onClick={clearFilters}
                                            className="w-full mt-6 pt-4 border-t border-slate-50 text-[10px] font-black text-rose-500 uppercase tracking-widest"
                                        >
                                            Clear Selection
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">Product Info</th>
                                <th className="px-6 py-5">Vendor</th>
                                <th className="px-6 py-5">Type</th>
                                <th className="px-6 py-5">Availability</th>
                                <th className="px-6 py-5 text-center">Alert Point</th>
                                <th className="px-8 py-5 text-right">State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && inventory.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                                <Package size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching stock items</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.sku}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100 uppercase whitespace-nowrap">
                                                {item.vendor}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight opacity-70">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${item.status === 'Low Stock' ? 'bg-amber-500' : item.status === 'Out of Stock' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${Math.min((item.stock / (item.reorderLevel * 2)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-slate-800">{item.stock}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{item.unitType}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                {item.reorderLevel} units
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${
                                                item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                {!loading && totalItems > 0 && totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Scanning {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} of {totalItems} items
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:border-blue-500 shadow-sm transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-slate-500 px-4">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:border-blue-500 shadow-sm transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryReports;
