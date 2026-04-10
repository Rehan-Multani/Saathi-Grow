import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, QrCode, Filter, Store, Package, Sparkles, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ProductEditModal from '../../../../common/components/products/ProductEditModal';
import RestockModal from '../../../../common/components/products/RestockModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getProducts, deleteProduct, updateProduct } from '../../../../common/api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const ProductStatusBadge = ({ status }) => {
    const { t } = useTranslation('admin_products');
    const variants = {
        Active: 'bg-green-100 text-green-700 border-green-200',
        'Low Stock': 'bg-red-100 text-red-700 border-red-200',
        'Out of Stock': 'bg-gray-100 text-gray-500 border-gray-200',
        Draft: 'bg-blue-100 text-blue-700 border-blue-200',
        'Pending Approval': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    
    const statusKey = status?.toLowerCase().replace(/\s+/g, '_');
    const translatedStatus = t(`status.${statusKey}`, { defaultValue: status });

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${variants[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {translatedStatus}
        </span>
    );
};

const AllProducts = () => {
    const { t } = useTranslation('admin_products');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

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
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const params = {
                page, limit, search: searchTerm, category: selectedCategory, brand: selectedBrand,
                source: sourceFilter === 'all' ? '' : sourceFilter
            };
            const [productsData, categoriesData, brandsData] = await Promise.all([
                getProducts(adminUser.token, params),
                getCategories(adminUser.token, { status: 'Active' }),
                getBrands(adminUser.token)
            ]);
            setProducts(productsData.products || []);
            setTotalPages(productsData.pages || 1);
            setTotalProducts(productsData.total || 0);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            toast.error(t('messages.load_failed'));
        } finally {
            setLoading(false);
        }
    }, [adminUser?.token, page, limit, searchTerm, selectedCategory, selectedBrand, sourceFilter, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localSearch !== searchTerm) updateParams({ search: localSearch, page: 1 });
        }, 500);
        return () => clearTimeout(timeout);
    }, [localSearch, searchTerm, updateParams]);

    const getTotalStock = (p) => {
        if (p.vendor) return p.stock || 0;
        if (!p.branchStocks || p.branchStocks.length === 0) return 0;
        return p.branchStocks.reduce((sum, bs) => sum + bs.stock, 0);
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(t('messages.delete_confirm_title'), t('messages.delete_confirm_text', { name }));
        if (result.isConfirmed) {
            try {
                await deleteProduct(adminUser.token, id);
                setProducts(products.filter(p => p._id !== id));
                showSuccessAlert(t('messages.delete_success'));
            } catch (error) {
                showErrorAlert('Error', error.message);
            }
        }
    };

    const handleSave = async (data) => {
        try {
            await updateProduct(adminUser.token, selectedProduct._id, data);
            toast.success(t('messages.save_success'));
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const activeFiltersCount = [selectedCategory, selectedBrand].filter(Boolean).length;

    return (
        <div className="container-fluid py-8 bg-slate-50/30 min-h-screen">
            {/* Simple Card Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                             <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                             <PageInfoTooltip data={pageInfoData.allProducts} />
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{t('meta.sku_count', { count: totalProducts })}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`px-5 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${showFilterMenu || activeFiltersCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Filter size={18} />
                                {t('filter_btn')}
                                {activeFiltersCount > 0 && <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                                    <h6 className="font-bold text-slate-900 mb-4 text-sm">{t('filters.options')}</h6>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">{t('table.category')}</label>
                                            <select className="w-full text-sm py-2" value={selectedCategory} onChange={(e) => updateParams({ category: e.target.value, page: 1 })}>
                                                <option value="">{t('filters.all_categories')}</option>
                                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">{t('table.brand')}</label>
                                            <select className="w-full text-sm py-2" value={selectedBrand} onChange={(e) => updateParams({ brand: e.target.value, page: 1 })}>
                                                <option value="">{t('filters.all_brands')}</option>
                                                {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        {activeFiltersCount > 0 && (
                                            <button onClick={() => { updateParams({ category: '', brand: '', page: 1 }); setShowFilterMenu(false); }} className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold mt-2 hover:bg-red-100 transition-all">
                                                {t('filters.clear')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {adminUser?.role === 'Admin' && (
                            <Link to="/admin/products/add" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                                <Plus size={20} /> {t('add_product')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Simple Table Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('table.product')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('table.category')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('table.price')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('table.stock')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="saathi-spinner mx-auto mb-4"></div>
                                        <p className="text-slate-400 text-sm">{t('meta.syncing')}</p>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center p-1 border">
                                                    {p.image ? <img src={p.image} className="w-full h-full object-contain" /> : <Package size={20} className="text-slate-300" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 font-mono mt-0.5 uppercase tracking-tight">{p.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs text-slate-600 font-medium">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm font-bold text-slate-900">₹{p.basePrice?.toFixed(0)}</div>
                                            {p.mrp > p.basePrice && <div className="text-[10px] text-slate-300 line-through">₹{p.mrp.toFixed(0)}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs font-bold ${getTotalStock(p) <= 10 ? 'text-red-600' : 'text-slate-600'}`}>{getTotalStock(p)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ProductStatusBadge status={p.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setShowQR(showQR === p._id ? null : p._id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View QR"><QrCode size={18} /></button>
                                                <button onClick={() => navigate(`/admin/products/${p._id}/inventory-logs`)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Logs"><History size={18} /></button>
                                                {!p.vendor && (
                                                    <>
                                                        <button onClick={() => { setSelectedProduct(p); setShowRestockModal(true); }} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Restock"><Plus size={18} /></button>
                                                        <button onClick={() => { setSelectedProduct(p); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit size={18} /></button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                                            </div>
                                            {showQR === p._id && (
                                                <div className="absolute right-12 z-50 bg-white shadow-2xl p-4 rounded-xl border border-slate-200 mt-2 flex flex-col items-center animate-in fade-in duration-200">
                                                    <QRCodeSVG value={p.sku} size={100} />
                                                    <span className="text-[9px] font-bold mt-2 text-slate-400 uppercase tracking-tighter">{p.sku}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <p className="text-slate-400 text-sm font-medium">{t('meta.no_products')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Simple Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">{t('meta.page_of', { current: page, total: totalPages })}</span>
                        <div className="flex gap-2">
                            <button onClick={() => updateParams({ page: page - 1 })} disabled={page === 1} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30"><ChevronLeft size={18} /></button>
                            <button onClick={() => updateParams({ page: page + 1 })} disabled={page === totalPages} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            <ProductEditModal show={showEditModal} onHide={() => setShowEditModal(false)} product={selectedProduct} onSave={handleSave} />
            <RestockModal show={showRestockModal} onHide={() => setShowRestockModal(false)} product={selectedProduct} onRestockSuccess={fetchData} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .saathi-spinner {
                    width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                input, select { outline: none !important; }
            `}} />
        </div>
    );
};

export default AllProducts;
