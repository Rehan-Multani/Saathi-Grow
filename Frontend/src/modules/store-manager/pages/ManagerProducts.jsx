import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, QrCode, Upload, Download, Filter, PackagePlus, History as HistoryIcon, Store, Package, Sparkles, ChevronLeft, ChevronRight, Activity, Box, Tag, Layers, BarChart3, X, Zap } from 'lucide-react';
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
            prev.set('page', '1'); // Reset to page 1 on filter change
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
                updateParams({ search: localSearch });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [localSearch, searchTerm, updateParams]);

    const getTotalStock = (p) => {
        if (p.vendor) return p.stock || 0;
        if (!p.branchStocks || p.branchStocks.length === 0) return 0;
        if (managerUser?.branchId) {
            const myStock = p.branchStocks.find(bs => (bs.branchId?._id || bs.branchId) === (managerUser.branchId?._id || managerUser.branchId));
            return myStock ? myStock.stock : 0;
        }
        return p.branchStocks.reduce((sum, bs) => sum + bs.stock, 0);
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation('Remove SKU?', `Are you sure you want to permanently remove ${name}?`);
        if (result.isConfirmed) {
            try {
                await deleteProduct(managerUser.token, id);
                setProducts(products.filter(p => p._id !== id));
                showSuccessAlert('Removed', 'Product removed from list.');
            } catch (error) {
                showErrorAlert('Failed', error.message || 'Operation failed');
            }
        }
    };

    const handleLogsOpen = (p) => {
        navigate(`/store-manager/products/${p._id}/inventory-logs`);
    };

    const handleRestockOpen = (p) => {
        if (p.vendor) {
            toast.info('Stock managed by Vendor Node');
            return;
        }
        setSelectedProduct(p);
        setShowRestockModal(true);
    };

    const handleEdit = (p) => {
        if (p.vendor) {
            toast.info('Profile managed by Vendor');
            return;
        }
        setSelectedProduct(p);
        setShowEditModal(true);
    };

    const handleSave = async (updatedProductData) => {
        try {
            const updated = await updateProduct(managerUser.token, selectedProduct._id, updatedProductData);
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            toast.success('Product updated');
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Update failed');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">All Products</h1>
                        <PageInfoTooltip data={pageInfoData.allProducts} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">
                            <Activity size={12} className="animate-pulse" /> Real-time Stock
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{totalProducts} items available</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link
                        to="/store-manager/products/add"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add Product
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-4 flex flex-col lg:flex-row items-center gap-4 shadow-sm">
                <div className="w-full lg:flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search product name or SKU..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all placeholder:text-slate-300 shadow-inner"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${showFilterMenu || (selectedCategory || selectedBrand) ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} /> Filters
                            {(selectedCategory || selectedBrand) && <span className="w-2 h-2 bg-white rounded-full"></span>}
                        </button>

                        {showFilterMenu && (
                            <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Filter Options</h3>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Category</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                            value={selectedCategory}
                                            onChange={(e) => updateParams({ category: e.target.value })}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Brand</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                            value={selectedBrand}
                                            onChange={(e) => updateParams({ brand: e.target.value })}
                                        >
                                            <option value="">All Brands</option>
                                            {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            onClick={() => { updateParams({ category: '', brand: '' }); setShowFilterMenu(false); }}
                                            className="w-full py-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                         <thead className="bg-[#fcfdfe] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Stock</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6">
                                            <div className="h-16 bg-slate-50 rounded-2xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? (
                                products.map((p) => {
                                    const stock = getTotalStock(p);
                                    return (
                                        <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform relative">
                                                        {p.image ? (
                                                            <img src={p.image} alt="" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Box size={24} className="text-slate-200" />
                                                        )}
                                                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${p.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} title={p.isVeg ? 'Veg' : 'Non-Veg'}></div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate max-w-[180px]">{p.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] font-black text-slate-400 font-mono tracking-wider bg-slate-100 px-2 py-0.5 rounded uppercase">{p.sku?.slice(-10)}</span>
                                                            {p.isSaathiGrow && <span className="bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1"><Sparkles size={10} /> Premium</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase truncate max-w-[120px]">
                                                        <Tag size={12} className="text-blue-400 shrink-0" /> {p.category}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase truncate max-w-[120px]">
                                                        <Layers size={12} className="text-slate-300 shrink-0" /> {p.brandName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-0.5">
                                                    <div className="text-base font-black text-slate-900 tracking-tight italic">₹{p.basePrice?.toLocaleString()}</div>
                                                    {p.mrp > p.basePrice && (
                                                        <div className="text-[10px] text-slate-300 font-black line-through italic">₹{p.mrp.toLocaleString()} MRP</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-2xl font-black transition-all border ${stock <= 5 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    <span className="text-lg leading-none">{stock}</span>
                                                    <span className="text-[7px] uppercase tracking-tighter">Stock</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right relative">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setShowQR(showQR === p._id ? null : p._id)}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${showQR === p._id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-400'}`}
                                                        title="QR Code"
                                                    >
                                                        <QrCode size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleLogsOpen(p)}
                                                        className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-400 flex items-center justify-center transition-all"
                                                        title="Stock History"
                                                    >
                                                        <BarChart3 size={18} />
                                                    </button>
                                                    {!p.vendor && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRestockOpen(p)}
                                                                className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-emerald-600 hover:border-emerald-400 transition-all flex items-center justify-center"
                                                                title="Add Stock"
                                                            >
                                                                <PackagePlus size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(p)}
                                                                className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center transition-all"
                                                                title="Edit Product"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(p._id, p.name)}
                                                        className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-400 flex items-center justify-center transition-all"
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                {showQR === p._id && (
                                                    <div className="absolute right-8 top-full mt-2 w-56 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU Identity</span>
                                                            <button onClick={() => setShowQR(null)} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex justify-center mb-4">
                                                            {p.qrCode ? <img src={p.qrCode} alt="" className="w-32 h-32" /> : <QRCodeSVG value={p.sku} size={128} level="H" />}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-900 font-mono tracking-widest uppercase bg-slate-50 py-2 rounded-lg text-center border-slate-200 mb-4">{p.sku?.slice(-12)}</div>
                                                        <button className="w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                                            <Download size={14} /> Download Image
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-200">
                                            <Package size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            Showing products <span className="text-slate-900">{(page-1)*limit + 1}-{Math.min(page*limit, totalProducts)}</span> of {totalProducts}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                disabled={page === 1}
                                className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black text-slate-900 px-3 py-1 bg-white border border-slate-200 rounded-lg">{page} / {totalPages}</span>
                            <button
                                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                disabled={page === totalPages}
                                className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={16} />
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default ManagerProducts;
