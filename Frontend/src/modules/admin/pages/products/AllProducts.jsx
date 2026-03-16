import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, QrCode, Upload, Download, Filter, PackagePlus, History as HistoryIcon, Store, Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Spinner } from 'react-bootstrap';
import ProductEditModal from '../../components/products/ProductEditModal';
import RestockModal from '../../components/products/RestockModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { getProducts, deleteProduct, updateProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';

const ProductStatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const variants = {
        Active: 'bg-green-100 text-green-700',
        'Low Stock': 'bg-red-100 text-red-700 border border-red-200 animate-pulse',
        'Out of Stock': 'bg-gray-100 text-gray-500 border border-gray-200',
        Draft: 'bg-blue-50 text-blue-600',
        'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200'
    };
    
    const statusKey = status?.toLowerCase().replace(/\s+/g, '_');
    const translatedStatus = t(`products.status.${statusKey}`, { defaultValue: status });

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
            {translatedStatus}
        </span>
    );
};

const SourceBadge = ({ vendor }) => {
    const { t } = useTranslation();
    if (vendor) {
        return (
            <div className="flex flex-col items-center gap-0.5">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                    <Store size={9} /> {t('products.source.vendor')}
                </span>
                <span className="text-[10px] text-gray-500 truncate max-w-[90px]">{vendor.storeName}</span>
            </div>
        );
    }
    return (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Package size={9} /> {t('products.source.branch')}
        </span>
    );
};

const AllProducts = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();

    const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
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
            console.error('Error fetching data:', error);
            toast.error(t('products.loading_failed', { defaultValue: 'Failed to load products' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, limit, searchTerm, selectedCategory, selectedBrand, sourceFilter, t]);

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
        // If it's a vendor product, return the direct stock field
        if (p.vendor) return p.stock || 0;
        
        // If not vendor and no branch stocks, it's truly empty
        if (!p.branchStocks || p.branchStocks.length === 0) return 0;
        
        if (adminUser?.role !== 'Admin' && adminUser?.branchId) {
            const myStock = p.branchStocks.find(bs => (bs.branchId?._id || bs.branchId) === adminUser.branchId);
            return myStock ? myStock.stock : 0;
        }
        return p.branchStocks.reduce((sum, bs) => sum + bs.stock, 0);
    };

    // Source counts for tab badges
    const branchCount = products.filter(p => !p.vendor).length;
    const vendorCount = products.filter(p => !!p.vendor).length;

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(t('dashboard.delete_confirm_title'), t('dashboard.delete_confirm_text', { name }));
        if (result.isConfirmed) {
            try {
                await deleteProduct(adminUser.token, id);
                setProducts(products.filter(p => p._id !== id));
                showSuccessAlert(t('dashboard.deleted_title'), t('dashboard.deleted_text'));
            } catch (error) {
                showErrorAlert(t('dashboard.error_title'), error.message || t('dashboard.failed_to_delete'));
            }
        }
    };

    const handleLogsOpen = (p) => {
        navigate(`/admin/products/${p._id}/inventory-logs`);
    };

    const handleRestockOpen = (p) => {
        if (p.vendor && adminUser?.role === 'Admin') {
            toast.info(t('products.managed_by_vendor'));
            return;
        }
        setSelectedProduct(p);
        setShowRestockModal(true);
    };

    const handleEdit = (p) => {
        if (p.vendor && adminUser?.role === 'Admin') {
            toast.info(t('products.managed_by_vendor'));
            return;
        }
        setSelectedProduct(p);
        setShowEditModal(true);
    };

    const handleSave = async (updatedProductData) => {
        try {
            const updated = await updateProduct(adminUser.token, selectedProduct._id, updatedProductData);
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            toast.success(t('dashboard.status_updated_success'));
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || t('dashboard.status_update_failed', { defaultValue: 'Failed to update product' }));
        }
    };

    const activeFiltersCount = [selectedCategory, selectedBrand].filter(Boolean).length;

    return (
        <div className="p-4 p-md-6">
            {/* Header Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h5 className="mb-0 font-bold text-gray-800 text-lg text-nowrap">{t('products.title')}</h5>
                        <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-full">
                            {t('products.count', { count: totalProducts })}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1 relative">
                        <div className="w-full md:max-w-xs">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                <div className="pl-3 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('products.search_placeholder')}
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center justify-center gap-2 px-3 py-2 bg-white border ${showFilterMenu || activeFiltersCount > 0 ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span>{t('products.filter_btn')}</span>
                                {activeFiltersCount > 0 && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">{activeFiltersCount}</span>
                                )}
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-12 left-0 z-20 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <h6 className="font-bold text-gray-800 mb-3 text-sm">{t('products.filter_options')}</h6>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('products.table.category')}</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                value={selectedCategory}
                                                onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                                            >
                                                <option value="">{t('products.all_categories')}</option>
                                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('products.table.brand')}</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                value={selectedBrand}
                                                onChange={(e) => updateParams({ brand: e.target.value, page: 1 })}
                                            >
                                                <option value="">{t('products.all_brands')}</option>
                                                {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        {activeFiltersCount > 0 && (
                                            <button
                                                onClick={() => { updateParams({ category: '', brand: '', page: 1 }); setShowFilterMenu(false); }}
                                                className="text-xs text-red-600 font-medium hover:text-red-700 mt-2 w-full text-center"
                                            >
                                                {t('products.clear_filters')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 w-full xl:w-auto">
                        {adminUser?.role === 'Admin' && (
                            <Link
                                to="/admin/products/add"
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">{t('products.add_product')}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Source Filter Tabs */}
            {adminUser?.role === 'Admin' && (
                <div className="flex gap-2 mb-4">
                    {[
                        { key: 'all', label: t('products.all_products'), count: products.length },
                        { key: 'branch', label: t('products.branch_products'), count: branchCount, color: 'blue' },
                        { key: 'vendor', label: t('products.vendor_products'), count: vendorCount, color: 'purple' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => updateParams({ source: tab.key, page: 1 })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${sourceFilter === tab.key
                                ? tab.color === 'purple'
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                    : tab.color === 'blue'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-gray-800 text-white border-gray-800 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab.key === 'vendor' ? <Store size={14} /> : <Package size={14} />}
                            {tab.label}
                            {sourceFilter === tab.key && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white`}>
                                    {totalProducts}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('products.table.product')}</th>
                                <th className="px-6 py-4 text-center">{t('products.table.brand')}</th>
                                <th className="px-6 py-4 text-center">{t('products.table.category')}</th>
                                {adminUser?.role === 'Admin' && (
                                    <th className="px-6 py-4 text-center">{t('products.table.source')}</th>
                                )}
                                <th className="px-6 py-4 text-center">{adminUser?.role === 'Admin' ? t('products.table.branches_store') : t('products.table.assigned_branch')}</th>
                                <th className="px-6 py-4 text-center">{t('products.table.price')}</th>
                                <th className="px-6 py-4 text-center">{adminUser?.role === 'Admin' ? t('products.table.total_stock') : t('products.table.branch_stock')}</th>
                                <th className="px-6 py-4 text-center">{t('products.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('products.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-10">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted text-sm">{t('products.loading')}</p>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((p) => (
                                    <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${p.vendor ? 'bg-purple-50/20' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded border border-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden flex-shrink-0 relative">
                                                    {p.image
                                                        ? <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" />
                                                        : <span className="text-sm font-bold text-gray-400">{p.name.charAt(0)}</span>
                                                    }
                                                    <div
                                                        className="position-absolute bottom-0 right-0 p-1 border rounded-sm bg-white"
                                                        style={{ width: '12px', height: '12px', margin: '2px', border: p.isVeg ? '1.5px solid #198754' : '1.5px solid #dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title={p.isVeg ? t('products.dietary.veg') : t('products.dietary.non_veg')}
                                                    >
                                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: p.isVeg ? '#198754' : '#dc3545' }}></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{p.name}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs text-gray-400 font-mono">{p.sku}</span>
                                                        {p.isSaathiGrow && (
                                                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase d-flex align-items-center gap-0.5 border border-blue-100">
                                                                <Sparkles size={8} /> {t('products.edit_modal.priority_label').split(' ').slice(0, 2).join(' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-center text-sm">{p.brandName}</td>
                                        <td className="px-6 py-4 text-gray-500 text-center text-sm">{p.category}</td>

                                        {/* Source Column — Admin only */}
                                        {adminUser?.role === 'Admin' && (
                                            <td className="px-6 py-4 text-center">
                                                <SourceBadge vendor={p.vendor} />
                                            </td>
                                        )}

                                        {/* Branch / Store Column */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {adminUser?.role === 'Admin' ? (
                                                    p.vendor ? (
                                                        // Vendor product — show vendor store name
                                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold flex items-center gap-1">
                                                            <Store size={9} /> {p.vendor.storeName}
                                                        </span>
                                                    ) : p.branchStocks && p.branchStocks.length > 0 ? (
                                                        p.branchStocks.slice(0, 3).map((bs, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] whitespace-nowrap">
                                                                {bs.branchId?.name || t('common.main')}
                                                            </span>
                                                        ))
                                                    ).concat(p.branchStocks.length > 3 ? [
                                                        <span key="more" className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">+{p.branchStocks.length - 3} more</span>
                                                    ] : []) : (
                                                        <span className="text-gray-400 text-xs">{t('dashboard.no_address', { defaultValue: 'No Branch' })}</span>
                                                    )
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold">
                                                        {p.branchStocks?.find(bs => (bs.branchId?._id || bs.branchId) === adminUser.branchId)?.branchId?.name || t('common.current_branch')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-gray-800">₹{p.basePrice?.toFixed(2)}</span>
                                                {p.mrp && p.mrp > p.basePrice && (
                                                    <span className="text-[10px] text-gray-400 line-through">₹{p.mrp.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold text-sm ${getTotalStock(p) === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {getTotalStock(p)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center"><ProductStatusBadge status={p.status} /></td>
                                        <td className="px-6 py-4 text-right relative">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className={`p-1.5 rounded-lg bg-gray-50 hover:bg-gray-200 transition-colors border ${showQR === p._id ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-500 border-gray-100'}`}
                                                    title="View QR"
                                                    onClick={() => setShowQR(showQR === p._id ? null : p._id)}
                                                >
                                                    <QrCode size={16} />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                    title="View History"
                                                    onClick={() => handleLogsOpen(p)}
                                                >
                                                    <HistoryIcon size={16} />
                                                </button>
                                                {adminUser?.role === 'Admin' && !p.vendor && (
                                                    <button
                                                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
                                                        title="Adjust Inventory"
                                                        onClick={() => handleRestockOpen(p)}
                                                    >
                                                        <PackagePlus size={16} />
                                                    </button>
                                                )}
                                                {!p.vendor && ((adminUser?.role === 'Admin') || (adminUser?.role === 'Staff' && adminUser?.permissions && adminUser.permissions.includes('MANAGE_PRODUCTS'))) && (
                                                    <button
                                                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                                                        title="Edit"
                                                        onClick={() => handleEdit(p)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                )}
                                                {adminUser?.role === 'Admin' && (
                                                    <button
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                                                        title={t('common.delete')}
                                                        onClick={() => handleDelete(p._id, p.name)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                {p.vendor && (
                                                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded border border-purple-100">
                                                        {t('products.managed_by_vendor')}
                                                    </span>
                                                )}
                                            </div>
                                            {showQR === p._id && (
                                                <>
                                                    <div className="fixed inset-0 z-[5] bg-transparent" onClick={() => setShowQR(null)}></div>
                                                    <div className="absolute right-10 top-12 bg-white shadow-xl p-4 rounded-xl border border-gray-100 z-[10] text-center animate-in fade-in zoom-in-95 duration-200" style={{ width: '180px' }}>
                                                        <h6 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">{t('products.qr.title')}</h6>
                                                        <div className="bg-gray-50 p-2 rounded-lg mb-3">
                                                            {p.qrCode ? (
                                                                <img src={p.qrCode} alt="Product QR" className="w-full h-auto" />
                                                            ) : (
                                                                <QRCodeSVG value={p.sku} size={140} level="H" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs mb-3 text-gray-800 font-mono font-bold bg-gray-100 py-1 rounded">{p.sku}</div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const link = document.createElement('a');
                                                                link.href = p.qrCode || '';
                                                                link.download = `QR-${p.sku}.png`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Download size={12} />
                                                            {t('products.qr.download')}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-12">
                                        <Package size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-400 font-medium">{t('products.no_products')}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {sourceFilter !== 'all'
                                                ? t('products.no_products_msg')
                                                : t('products.no_products_msg')}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {!loading && totalPages > 0 && (
                    <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4">
                        <span className="text-sm text-gray-500">
                            {t('products.pagination.showing')} <strong className="text-gray-900">{products.length}</strong> {t('products.pagination.of')} <strong className="text-gray-900">{totalProducts}</strong> {t('products.title').toLowerCase()}
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm"
                            >
                                <ChevronLeft size={16} /> {t('products.pagination.previous')}
                            </button>

                            <div className="flex items-center px-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show pages around current page
                                    let pageNum = page > 3 ? (totalPages - page < 2 ? totalPages - 4 + i : page - 2 + i) : i + 1;
                                    pageNum = Math.max(1, Math.min(totalPages, pageNum));

                                    // Only show unique tabs (fixes issue when totalPages < 5)
                                    if (i > 0 && pageNum <= (page > 3 ? (totalPages - page < 2 ? totalPages - 4 + i - 1 : page - 2 + i - 1) : i)) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => updateParams({ page: pageNum })}
                                            className={`w-8 h-8 mx-0.5 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${page === pageNum ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm"
                            >
                                {t('products.pagination.next')} <ChevronRight size={16} />
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
        </div>
    );
};

export default AllProducts;
