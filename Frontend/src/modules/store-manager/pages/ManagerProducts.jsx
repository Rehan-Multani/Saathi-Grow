import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, QrCode, Upload, Download, Filter, PackagePlus, History as HistoryIcon, Store, Package, Sparkles, ChevronLeft, ChevronRight, Activity, Box, Tag, Layers, BarChart3 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ProductEditModal from '../../../common/components/products/ProductEditModal';
import RestockModal from '../../../common/components/products/RestockModal';
import { useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import { getProducts, deleteProduct, updateProduct } from '../../../common/api/productApi';
import { getCategories } from '../../../common/api/categoryApi';
import { getBrands } from '../../../common/api/brandApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../common/data/pageInfoData';

const ManagerProducts = () => {
    const navigate = useNavigate();
    const { managerUser } = useStoreManagerAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || '';
    const selectedBrand = searchParams.get('brand') || '';
    const sourceFilter = searchParams.get('source') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;

    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [localSearch, setLocalSearch] = useState(searchTerm);

    const [showQR, setShowQR] = useState(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const updateParams = useCallback((newParams) => {
        setSearchParams(prev => {
            Object.entries(newParams).forEach(([key, value]) => {
                if (value && value !== 'all') prev.set(key, value);
                else prev.delete(key);
            });
            return prev;
        });
    }, [setSearchParams]);

    const fetchData = useCallback(async () => {
        if (!managerUser?.token) return;
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                category: selectedCategory,
                brand: selectedBrand,
                source: sourceFilter === 'all' ? '' : sourceFilter
            };
            const [productsData, categoriesData, brandsData] = await Promise.all([
                getProducts(managerUser.token, params),
                getCategories(managerUser.token, { status: 'Active' }),
                getBrands(managerUser.token)
            ]);
            setProducts(productsData.products || []);
            setTotalPages(productsData.pages || 1);
            setTotalProducts(productsData.total || 0);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [managerUser?.token, page, limit, searchTerm, selectedCategory, selectedBrand, sourceFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localSearch !== searchTerm) {
                updateParams({ search: localSearch, page: 1 });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [localSearch, searchTerm, updateParams]);

    const getTotalStock = (p) => {
        if (p.vendor) return p.stock || 0;
        if (!p.branchStocks || p.branchStocks.length === 0) return 0;
        if (managerUser?.branchId) {
            const myStock = p.branchStocks.find(bs => (bs.branchId?._id || bs.branchId) === managerUser.branchId);
            return myStock ? myStock.stock : 0;
        }
        return p.branchStocks.reduce((sum, bs) => sum + bs.stock, 0);
    };

    const handleDelete = async (id, name) => {
        if (managerUser?.role !== 'Admin' && !managerUser?.permissions?.includes('MANAGE_PRODUCTS')) {
            toast.error("Unauthorized: Escalation required for deletion.");
            return;
        }

        const result = await showDeleteConfirmation('Wipe SKU?', `Are you sure you want to permanently remove ${name}?`);
        if (result.isConfirmed) {
            try {
                await deleteProduct(managerUser.token, id);
                setProducts(products.filter(p => p._id !== id));
                showSuccessAlert('SKU Terminated', 'Product identity removed from node.');
            } catch (error) {
                showErrorAlert('Operation Failed', error.message || 'Failed to delete');
            }
        }
    };

    const handleLogsOpen = (p) => {
        navigate(`/store-manager/products/${p._id}/inventory-logs`);
    };

    const handleRestockOpen = (p) => {
        if (p.vendor) {
            toast.info('Inventory Managed by External Vendor Node');
            return;
        }
        setSelectedProduct(p);
        setShowRestockModal(true);
    };

    const handleEdit = (p) => {
        if (p.vendor) {
            toast.info('Profile Managed by External Vendor Node');
            return;
        }
        setSelectedProduct(p);
        setShowEditModal(true);
    };

    const handleSave = async (updatedProductData) => {
        try {
            const updated = await updateProduct(managerUser.token, selectedProduct._id, updatedProductData);
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            toast.success('SKU Profile Synchronized');
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update SKU');
        }
    };

    const activeFiltersCount = [selectedCategory, selectedBrand].filter(Boolean).length;

    return (
        <div className="manager-products-page p-6 md:p-10">
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="header-content">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
                        <Activity size={12} className="animate-pulse" />
                        <span>Inventory Pulse: Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SKU <span className="text-blue-600 italic">Inventory</span></h1>
                        <PageInfoTooltip data={pageInfoData.allProducts} />
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{totalProducts} Classified Active Stock Units</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {managerUser?.permissions?.includes('MANAGE_PRODUCTS') && (
                        <Link
                            to="/store-manager/products/add"
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95"
                        >
                            <Plus size={18} /> Enroll New SKU
                        </Link>
                    )}
                </div>
            </div>

            {/* Action & Filter Toolbar */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 mb-8 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row items-center gap-4">
                <div className="w-full lg:flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Scan or type SKU, Name, or Category..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border ${showFilterMenu || activeFiltersCount > 0 ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 shadow-sm'}`}
                        >
                            <Filter size={18} /> Logic Filter
                            {activeFiltersCount > 0 && <span className="w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center text-[10px]">{activeFiltersCount}</span>}
                        </button>

                        {showFilterMenu && (
                            <div className="filter-dropdown">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Select Parameters</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 ml-1">Market Category</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                            value={selectedCategory}
                                            onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 ml-1">Brand Identity</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                            value={selectedBrand}
                                            onChange={(e) => updateParams({ brand: e.target.value, page: 1 })}
                                        >
                                            <option value="">All Brands</option>
                                            {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="h-px bg-slate-50 my-2"></div>
                                    <button 
                                        onClick={() => { updateParams({ category: '', brand: '', page: 1 }); setShowFilterMenu(false); }}
                                        className="w-full py-2.5 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        Clear Intelligence
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory Data Registry */}
            <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-6">SKU Protocol</th>
                                <th className="px-8 py-6">Classification</th>
                                <th className="px-8 py-6">Pricing Node</th>
                                <th className="px-8 py-6 text-center">Current Stock</th>
                                <th className="px-8 py-6 text-center">Status</th>
                                <th className="px-8 py-6 text-right">Operational Port</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6">
                                            <div className="h-14 bg-slate-50 rounded-2xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? (
                                products.map((p) => (
                                    <tr key={p._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center p-1 relative shadow-sm group-hover:shadow-md transition-all">
                                                    {p.image ? (
                                                        <img src={p.image} alt="" className="w-full h-full object-contain filter drop-shadow-sm" />
                                                    ) : (
                                                        <Box size={24} className="text-slate-200" />
                                                    )}
                                                    <div className={`diet-indicator ${p.isVeg ? 'veg' : 'non-veg'}`} title={p.isVeg ? 'Veg' : 'Non-Veg'}></div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 mb-1">{p.name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg">{p.sku}</span>
                                                        {p.isSaathiGrow && <span className="premium-label"><Sparkles size={8} /> Premium</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tight">
                                                    <Tag size={12} className="text-blue-500" /> {p.category}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-tight">
                                                    <Layers size={12} className="text-indigo-400" /> {p.brandName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-base font-black text-slate-900 italic">₹{p.basePrice?.toFixed(2)}</div>
                                                {p.mrp && p.mrp > p.basePrice && (
                                                    <div className="text-[10px] text-slate-400 font-bold line-through">₹{p.mrp.toFixed(2)} MRP</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`inline-flex flex-col items-center justify-center w-14 h-14 rounded-2xl font-black transition-all ${getTotalStock(p) === 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                <span className="text-lg">{getTotalStock(p)}</span>
                                                <span className="text-[7px] uppercase -mt-1 tracking-tighter">Units</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`status-pill ${p.status}`}>
                                                <div className="dot"></div>
                                                <span>{p.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2.5">
                                                <button
                                                    onClick={() => setShowQR(showQR === p._id ? null : p._id)}
                                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all border ${showQR === p._id ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-blue-50 hover:text-blue-500'}`}
                                                >
                                                    <QrCode size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleLogsOpen(p)}
                                                    className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 flex items-center justify-center transition-all border border-slate-100"
                                                >
                                                    <BarChart3 size={18} />
                                                </button>
                                                {!p.vendor && managerUser?.permissions?.includes('MANAGE_INVENTORY') && (
                                                    <button
                                                        onClick={() => handleRestockOpen(p)}
                                                        className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all border border-slate-100 flex items-center justify-center"
                                                    >
                                                        <PackagePlus size={18} />
                                                    </button>
                                                )}
                                                {!p.vendor && managerUser?.permissions?.includes('MANAGE_PRODUCTS') && (
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-all"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {managerUser?.permissions?.includes('DELETE_PRODUCTS') && (
                                                    <button
                                                        onClick={() => handleDelete(p._id, p.name)}
                                                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                {p.vendor && (
                                                    <div className="px-4 py-2 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-purple-100 flex items-center gap-2">
                                                        <Store size={14} /> Vendor Linked
                                                    </div>
                                                )}
                                            </div>

                                            {showQR === p._id && (
                                                <div className="qr-portal scale-in-center">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Identification</span>
                                                        <button onClick={() => setShowQR(null)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={16} /></button>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 mb-6 flex justify-center">
                                                        {p.qrCode ? <img src={p.qrCode} alt="" className="w-32 h-32" /> : <QRCodeSVG value={p.sku} size={128} level="H" />}
                                                    </div>
                                                    <div className="text-[11px] font-black text-slate-900 font-mono bg-white border border-slate-100 py-3 rounded-xl mb-6 tracking-wider uppercase">{p.sku}</div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); /* Download logic */ }}
                                                        className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <Download size={14} /> Download Asset
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30 grayscale saturate-0 scale-75">
                                            <Package size={100} strokeWidth={1} />
                                            <p className="mt-6 text-sm font-black text-slate-900 uppercase tracking-[0.3em]">No SKUs Detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && totalPages > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900">{products.length}</span> of <span className="text-slate-900">{totalProducts}</span> SKU deployments
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                disabled={page === 1}
                                className="nav-btn"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <div className="flex items-center gap-1.5">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pNum = i + 1;
                                    return (
                                        <button
                                            key={pNum}
                                            onClick={() => updateParams({ page: pNum })}
                                            className={`page-btn ${page === pNum ? 'active' : ''}`}
                                        >
                                            {pNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                disabled={page === totalPages}
                                className="nav-btn"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProductEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                product={selectedProduct}
                onSave={handleSave}
            />

            <RestockModal
                show={showRestockModal}
                onHide={() => setShowRestockModal(false)}
                product={selectedProduct}
                onRestockSuccess={fetchData}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .manager-products-page { background: #fdfdff; min-height: 100vh; position: relative; }
                .filter-dropdown { position: absolute; top: 110%; right: 0; width: 300px; background: #fff; border: 1px solid #f1f5f9; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); padding: 24px; z-index: 100; animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .qr-portal { position: absolute; right: 80px; top: 0; width: 240px; background: #fff; border: 1px solid #f1f5f9; border-radius: 2.5rem; box-shadow: 0 40px 60px -12px rgba(0,0,0,0.2); padding: 24px; z-index: 50; }
                
                .diet-indicator { position: absolute; bottom: 8px; right: 8px; width: 10px; height: 10px; border-radius: 2px; border: 1px solid; display: flex; align-items: center; justify-content: center; transform: scale(0.8); }
                .diet-indicator::after { content: ''; width: 50%; height: 50%; border-radius: 50%; }
                .diet-indicator.veg { border-color: #10b981; }
                .diet-indicator.veg::after { background: #10b981; }
                .diet-indicator.non-veg { border-color: #ef4444; }
                .diet-indicator.non-veg::after { background: #ef4444; }
                
                .premium-label { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; font-size: 8px; font-weight: 900; text-transform: uppercase; tracking: 0.1em; padding: 2px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
                
                .status-pill { display: flex; align-items: center; gap: 8px; width: fit-content; padding: 6px 14px; border-radius: 10rem; font-size: 9px; font-weight: 900; text-transform: uppercase; border: 1px solid transparent; margin: 0 auto; }
                .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
                .status-pill.Active { background: #ecfdf5; color: #065f46; border-color: #d1fae5; }
                .status-pill.Active .dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
                .status-pill.Low-Stock { background: #fffbeb; color: #92400e; border-color: #fef3c7; animation: pulse-yellow 2s infinite; }
                .status-pill.Low-Stock .dot { background: #f59e0b; }
                .status-pill.Out-of-Stock { background: #f8fafc; color: #64748b; border-color: #e2e8f0; }
                .status-pill.Out-of-Stock .dot { background: #94a3b8; }

                .nav-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 1.25rem; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .nav-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
                .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                
                .page-btn { width: 44px; height: 44px; border-radius: 1.25rem; background: transparent; color: #94a3b8; font-size: 11px; font-weight: 900; transition: all 0.2s; }
                .page-btn:hover { background: #f1f5f9; color: #475569; }
                .page-btn.active { background: #3b82f6; color: #fff; box-shadow: 0 10px 20px -5px rgba(59,130,246,0.3); }

                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes pulse-yellow { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
            `}} />
        </div>
    );
};

export default ManagerProducts;
