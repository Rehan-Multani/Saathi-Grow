import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Upload, Edit, Trash2, QrCode, Filter, Store, Package, Sparkles, ChevronLeft, ChevronRight, History, X, Download, FileText } from 'lucide-react';
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
import * as XLSX from 'xlsx';

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
        <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold border ${variants[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    const downloadExcelTemplate = () => {
        const headers = [
            'name', 'category', 'subCategory', 'brandName', 'basePrice', 'mrp',
            'unitType', 'unitValue', 'description', 'tags', 'sku', 'stock', 'status'
        ];
        const example = [
            'Amul Butter 100g', 'Dairy Bread & Eggs', '', 'Amul', 52, 55,
            'g', 100, 'Fresh Amul butter 100g pack', 'dairy,butter,amul', 'DAI-AMU-XXXXX', 50, 'Active'
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, 'Saathigro_bulk_product_template.xlsx');
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return toast.warning('Please select an Excel file first');
        setBulkLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', bulkFile);
            const axios = (await import('axios')).default;
            const { API_BASE_URL } = await import('../../../../config/apiConfig');
            const { data } = await axios.post(
                `${API_BASE_URL}/admin/products/bulk-upload`,
                formData,
                { headers: { Authorization: `Bearer ${adminUser.token}`, 'Content-Type': 'multipart/form-data' } }
            );
            const msg = `✅ ${data.created || 0} created, ${data.updated || 0} updated${data.skipped > 0 ? `, ${data.skipped} skipped` : ''}`;
            toast.success(msg, { autoClose: 5000 });
            if (data.errors?.length > 0) {
                data.errors.forEach(e => toast.warning(e, { autoClose: 8000 }));
            }
            setShowBulkModal(false);
            setBulkFile(null);
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Bulk upload failed. Check your Excel format.');
        } finally {
            setBulkLoading(false);
        }
    };

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

            // Robust extraction logic to handle various response structures
            const extractData = (payload, key) => {
                if (Array.isArray(payload)) return payload;
                if (payload && typeof payload === 'object') {
                    if (Array.isArray(payload[key])) return payload[key];
                    if (Array.isArray(payload.data)) return payload.data;
                    if (payload.data && Array.isArray(payload.data[key])) return payload.data[key];
                }
                return [];
            };

            setProducts(productsData?.products || productsData?.data?.products || productsData || []);
            setTotalPages(productsData?.pages || productsData?.data?.pages || 1);
            setTotalProducts(productsData?.total || productsData?.data?.total || 0);
            
            setCategories(extractData(categoriesData, 'categories'));
            setBrands(extractData(brandsData, 'brands'));
        } catch (error) {
            console.error('Failed to fetch products or master data:', error);
            // toast.error(t('messages.load_failed'));
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
                             <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-[0.05em]">{t('title')}</h1>
                             <PageInfoTooltip data={pageInfoData.allProducts} />
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 font-semibold uppercase tracking-wider">{t('meta.sku_count', { count: totalProducts })}</p>
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
                            <>
                                <button
                                    onClick={() => setShowBulkModal(true)}
                                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <Upload size={18} /> Bulk Upload
                                </button>
                                <Link to="/admin/products/add" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                                    <Plus size={20} /> {t('add_product')}
                                </Link>
                            </>
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
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Location</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="saathi-spinner mx-auto mb-4"></div>
                                        <p className="text-slate-400 text-sm">{t('meta.syncing')}</p>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/products/${p._id}`} className="flex items-center gap-4 group/item">
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center p-1 border group-hover/item:border-blue-400 transition-all shadow-sm">
                                                    {p.image ? <img src={p.image} className="w-full h-full object-contain group-hover/item:scale-110 transition-transform" /> : <Package size={20} className="text-slate-300" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900 truncate group-hover/item:text-blue-600 transition-colors">{p.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 font-mono mt-0.5 uppercase tracking-tight">{p.sku}</div>
                                                </div>
                                            </Link>
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
                                            {p.physicalLocation ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-[10px] font-semibold uppercase tracking-wide">
                                                    <Store size={11} /> {p.physicalLocation}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-medium">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ProductStatusBadge status={p.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setShowQR(showQR === p._id ? null : p._id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View QR"><QrCode size={18} /></button>
                                                <button onClick={() => navigate(`/admin/products/${p._id}/inventory-logs`)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Logs"><History size={18} /></button>
                                                {!p.vendor && (
                                                    <button onClick={() => { setSelectedProduct(p); setShowRestockModal(true); }} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Restock"><Plus size={18} /></button>
                                                )}
                                                <button onClick={() => { setSelectedProduct(p); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                                            </div>
                                            {showQR === p._id && (
                                                <div className="absolute right-12 z-50 bg-white shadow-2xl p-6 w-64 rounded-xl border border-slate-200 mt-2 flex flex-col animate-in fade-in duration-200">
                                                    <div className="flex justify-between items-center mb-4 w-full">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Details QR</span>
                                                        <button onClick={() => setShowQR(null)} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-center mb-4 w-full">
                                                        <QRCodeSVG 
                                                            id={`qr-admin-${p._id}`}
                                                            value={`${window.location.origin}/product/${p._id}`} 
                                                            size={140} 
                                                            level="M" 
                                                        />
                                                    </div>
                                                    <div className="space-y-1 w-full text-center mb-4">
                                                        <div className="text-xs font-black text-slate-900 truncate" title={p.name}>{p.name}</div>
                                                        <div className="text-[9px] text-slate-500 font-bold uppercase">{p.category} | ₹{p.basePrice}</div>
                                                        <div className="text-[10px] font-black text-slate-900 font-mono tracking-widest uppercase bg-slate-50 py-2 rounded-lg border border-slate-200 mt-2">{p.sku?.slice(-12)}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const svg = document.getElementById(`qr-admin-${p._id}`);
                                                            const svgData = new XMLSerializer().serializeToString(svg);
                                                            const canvas = document.createElement('canvas');
                                                            const ctx = canvas.getContext('2d');
                                                            const img = new Image();
                                                            img.onload = () => {
                                                                canvas.width = img.width;
                                                                canvas.height = img.height;
                                                                ctx.drawImage(img, 0, 0);
                                                                const pngFile = canvas.toDataURL('image/png');
                                                                const downloadLink = document.createElement('a');
                                                                downloadLink.download = `${p.sku}_qr.png`;
                                                                downloadLink.href = `${pngFile}`;
                                                                downloadLink.click();
                                                            };
                                                            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                                        }}
                                                        className="w-full py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <Download size={14} /> Download QR
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
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

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[88vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Bulk Product Upload</h2>
                                    <p className="text-xs text-slate-400 font-medium">Upload an Excel file to add multiple products at once</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowBulkModal(false); setBulkFile(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body - scrollable */}
                        <div className="p-4 space-y-4 overflow-y-auto flex-1">
                            {/* Step 1: Download Template */}
                            <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">Step 1: Download Template</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Fill in this Excel file with your products</p>
                                </div>
                                <button
                                    onClick={downloadExcelTemplate}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-sm"
                                >
                                    <Download size={14} /> Download Excel
                                </button>
                            </div>

                            {/* Required Columns Info */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Required Excel Columns</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['name*', 'category*', 'basePrice*', 'mrp*', 'unitType', 'unitValue', 'brandName', 'description', 'tags', 'sku', 'stock', 'status'].map(col => (
                                        <span key={col} className={`text-[10px] px-2 py-1 rounded-lg font-bold text-center ${col.includes('*') ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                            {col}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-rose-500 font-semibold mt-2">* Required fields</p>
                            </div>

                            {/* Step 2: Upload File */}
                            <div>
                                <p className="text-sm font-bold text-slate-800 mb-2">Step 2: Upload Your Excel</p>
                                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${bulkFile ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        {bulkFile ? (
                                            <>
                                                <FileText size={24} className="text-green-500" />
                                                <p className="text-sm font-bold text-green-700">{bulkFile.name}</p>
                                                <p className="text-xs text-slate-400">Click to change file</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-slate-400" />
                                                <p className="text-sm font-bold text-slate-600">Click to select Excel file</p>
                                                <p className="text-xs text-slate-400">Only .xlsx and .xls files supported</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        className="hidden"
                                        onChange={(e) => setBulkFile(e.target.files[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-slate-100">
                            <button onClick={() => { setShowBulkModal(false); setBulkFile(null); }} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUpload}
                                disabled={!bulkFile || bulkLoading}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                            >
                                {bulkLoading ? <><span className="saathi-spinner !w-4 !h-4 !border-2"></span> Uploading...</> : <><Upload size={16} /> Upload Products</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
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
