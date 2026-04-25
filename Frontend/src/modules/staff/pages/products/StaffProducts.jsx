import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Edit, QrCode, Download, Filter, PackagePlus, Store, Package, Sparkles, ChevronLeft, ChevronRight, Activity, Box, Tag, Layers, BarChart3, X, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ProductEditModal from '../../../../common/components/products/ProductEditModal';
import RestockModal from '../../../../common/components/products/RestockModal';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { getProducts, updateProduct } from '../../../../common/api/productApi';
import { getCategories } from '../../../../common/api/categoryApi';
import { getBrands } from '../../../../common/api/brandApi';
import { toast } from 'react-toastify';

const StaffProducts = () => {
    const navigate = useNavigate();
    const { staffUser } = useStaffAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || '';
    const selectedBrand = searchParams.get('brand') || '';
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
        if (!staffUser?.token) return;
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                category: selectedCategory,
                brand: selectedBrand
            };
            const [productsData, categoriesData, brandsData] = await Promise.all([
                getProducts(staffUser.token, params),
                getCategories(staffUser.token, { status: 'Active' }),
                getBrands(staffUser.token)
            ]);
            setProducts(productsData.products || []);
            setTotalPages(productsData.pages || 1);
            setTotalProducts(productsData.total || 0);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [staffUser?.token, page, limit, searchTerm, selectedCategory, selectedBrand]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localSearch !== searchTerm) updateParams({ search: localSearch, page: 1 });
        }, 500);
        return () => clearTimeout(timeout);
    }, [localSearch, searchTerm, updateParams]);

    const getTotalStock = (p) => {
        if (p.vendor) return p.stock || 0;
        if (!p.branchStocks || p.branchStocks.length === 0) return 0;
        if (staffUser?.branchId) {
            const myStock = p.branchStocks.find(bs => (bs.branchId?._id || bs.branchId) === staffUser.branchId);
            return myStock ? myStock.stock : 0;
        }
        return p.branchStocks.reduce((sum, bs) => sum + bs.stock, 0);
    };

    const handleRestockOpen = (p) => {
        if (p.vendor) return toast.info('Managed by Vendor');
        setSelectedProduct(p);
        setShowRestockModal(true);
    };

    const handleEdit = (p) => {
        if (p.vendor) return toast.info('Managed by Vendor');
        setSelectedProduct(p);
        setShowEditModal(true);
    };

    const handleSave = async (updatedProductData) => {
        try {
            const updated = await updateProduct(staffUser.token, selectedProduct._id, updatedProductData);
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            toast.success('Updated');
            setShowEditModal(false);
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const activeFiltersCount = [selectedCategory, selectedBrand].filter(Boolean).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic font-black leading-none text-left">Product List</h1>
                    <div className="flex items-center gap-3 font-black text-left">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic font-black text-left">
                            <Activity size={12} className="animate-pulse" /> System Live
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left">{totalProducts} Products found</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                     <button onClick={fetchData} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 font-black">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative group flex-1 md:w-80 text-left">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name or SKU..."
                            className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm font-black lowercase tracking-widest text-left"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-sm shrink-0 font-black ${activeFiltersCount > 0 ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} />
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-6 z-[60] animate-in zoom-in-95 duration-200 text-left">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest italic leading-none font-black text-left">Filters</h3>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 ml-2 uppercase italic leading-none font-black text-left">Category</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-700 outline-none focus:border-blue-500 uppercase italic shadow-sm font-black"
                                            value={selectedCategory}
                                            onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 ml-2 uppercase italic leading-none font-black text-left">Brand</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-700 outline-none focus:border-blue-500 uppercase italic shadow-sm font-black"
                                            value={selectedBrand}
                                            onChange={(e) => updateParams({ brand: e.target.value, page: 1 })}
                                        >
                                            <option value="">All Brands</option>
                                            {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            onClick={() => { updateParams({ category: '', brand: '', page: 1 }); setShowFilterMenu(false); }}
                                            className="w-full py-4 bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all italic leading-none font-black"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col group p-4 lg:p-6 text-left">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">Area</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">Price</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Units</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 border-0">
                            {loading && products.length === 0 ? (
                                Array(8).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6"><div className="h-14 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? (
                                products.map((p) => (
                                    <tr key={p._id} className="group/row hover:bg-blue-50/20 transition-all duration-300">
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center p-2 relative shadow-sm group-hover/row:shadow-lg transition-all shrink-0">
                                                    {p.image ? (
                                                        <img src={p.image} className="w-full h-full object-contain drop-shadow-md group-hover/row:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <Box size={24} className="text-slate-100" />
                                                    )}
                                                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${p.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                </div>
                                                <div className="text-left font-black">
                                                    <div className="text-sm font-black text-slate-900 mb-1.5 uppercase italic leading-none font-black text-left">{p.name}</div>
                                                    <div className="flex items-center gap-2 font-black leading-none text-left">
                                                        <span className="text-[9px] font-black text-slate-400 font-mono tracking-widest bg-slate-50 px-2 py-1 rounded-lg italic font-black">#{p.sku}</span>
                                                        {p.isSaathigro && <span className="bg-blue-600 text-white text-[7px] font-black rounded-lg px-2 py-1 uppercase tracking-widest shadow-lg shadow-blue-500/20 italic"><Sparkles size={8} className="inline mr-1" /> Premium</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="space-y-2 text-left font-black">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 italic leading-none text-left">
                                                    <Tag size={12} className="text-blue-500 shrink-0" /> {p.category}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 italic leading-none text-left">
                                                    <Layers size={12} className="text-slate-300 shrink-0" /> {p.brandName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="text-base font-black text-slate-900 italic font-black leading-none text-left">₹{p.basePrice?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-8 py-5 text-center border-0">
                                            <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-xl font-black shadow-sm border ${getTotalStock(p) === 0 ? 'bg-red-50 text-red-600 border-red-100 shadow-red-500/5' : 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5'}`}>
                                                <span className="text-sm font-black italic font-black">{getTotalStock(p)}</span>
                                                <span className="text-[7px] font-black uppercase -mt-0.5 tracking-tighter">Units</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center border-0">
                                             <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm inline-block italic ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.status === 'Low-Stock' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-200 grayscale'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right border-0 relative">
                                            <div className="flex justify-end gap-2.5">
                                                <button
                                                    onClick={() => setShowQR(showQR === p._id ? null : p._id)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm shrink-0 font-black ${showQR === p._id ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10' : 'bg-white text-slate-400 border-slate-200 hover:text-blue-600'}`}
                                                >
                                                    <QrCode size={18} />
                                                </button>
                                                {!p.vendor && (
                                                    <button
                                                        onClick={() => handleRestockOpen(p)}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all shadow-sm flex items-center justify-center shrink-0 font-black"
                                                    >
                                                        <PackagePlus size={18} />
                                                    </button>
                                                )}
                                                {!p.vendor && (
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center shrink-0 font-black"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {p.vendor && (
                                                    <div className="px-4 py-2 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-xl border border-slate-100 flex items-center gap-2 italic leading-none shrink-0 shadow-sm font-black">
                                                       <Store size={14} className="shrink-0" /> Vendor Arc
                                                    </div>
                                                )}
                                            </div>

                                            {showQR === p._id && (
                                                <div className="absolute right-8 top-full mt-4 w-72 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl p-8 z-50 animate-in zoom-in-95 duration-200 text-left cursor-default">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-black italic leading-none text-left">Code Access</h4>
                                                        <button onClick={() => setShowQR(null)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                                                    </div>
                                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-6 flex justify-center shadow-inner">
                                                        {p.qrCode ? <img src={p.qrCode} className="w-40 h-40 drop-shadow-xl" alt="qr" /> : <QRCodeSVG value={p.sku} size={160} level="H" className="drop-shadow-xl" />}
                                                    </div>
                                                    <div className="text-[11px] font-black text-slate-900 font-mono bg-blue-50 border border-blue-100 py-4 rounded-xl mb-6 tracking-widest uppercase italic text-center text-blue-600 font-black">{p.sku}</div>
                                                    <button 
                                                        className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-3xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-3 italic font-black"
                                                    >
                                                        <Download size={16} /> Download
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center border-0">
                                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                                            <div className="w-24 h-24 bg-slate-50 text-slate-100 rounded-[3rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                                                <Package size={40} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic font-black">No Products Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-8 py-8 border-t border-slate-50 bg-slate-50/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap italic font-black text-left">
                            Showing <span className="text-slate-900 font-black">{products.length}</span> of <span className="text-slate-900 font-black">{totalProducts}</span> deployments
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                            <button 
                                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                disabled={page === 1}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1.5 mx-2 shrink-0">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => updateParams({ page: i + 1 })}
                                        className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all shadow-sm font-black ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-200'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                disabled={page === totalPages}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Next
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

export default StaffProducts;
