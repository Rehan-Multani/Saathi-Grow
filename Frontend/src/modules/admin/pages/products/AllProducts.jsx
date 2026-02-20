import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, QrCode, Upload, Download, Filter, PackagePlus, History as HistoryIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Spinner } from 'react-bootstrap';
import ProductEditModal from '../../components/products/ProductEditModal';
import RestockModal from '../../components/products/RestockModal';
import InventoryLogsModal from '../../components/products/InventoryLogsModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getProducts, deleteProduct, updateProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';

const ProductStatusBadge = ({ status }) => {
    const variants = {
        Active: 'bg-green-100 text-green-700',
        'Low Stock': 'bg-red-100 text-red-700 border border-red-200 animate-pulse',
        'Out of Stock': 'bg-gray-100 text-gray-500 border border-gray-200',
        Draft: 'bg-blue-50 text-blue-600',
        'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200'
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const AllProducts = () => {
    const { adminUser } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData, brandsData] = await Promise.all([
                getProducts(adminUser.token),
                getCategories(adminUser.token),
                getBrands(adminUser.token)
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getTotalStock = (p) => {
        if (!p.branchStocks || p.branchStocks.length === 0) return 0;
        return p.branchStocks.reduce((sum, bs) => sum + bs.stock, 0);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brandName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchesBrand = selectedBrand ? p.brandName === selectedBrand : true;

        return matchesSearch && matchesCategory && matchesBrand;
    });

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation('Delete Product?', `Are you sure you want to remove "${name}"?`);
        if (result.isConfirmed) {
            try {
                await deleteProduct(adminUser.token, id);
                setProducts(products.filter(p => p._id !== id));
                showSuccessAlert('Deleted!', 'Product has been removed.');
            } catch (error) {
                showErrorAlert('Error', error.message || 'Failed to delete product');
            }
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleRestockOpen = (product) => {
        setSelectedProduct(product);
        setShowRestockModal(true);
    };

    const handleLogsOpen = (product) => {
        setSelectedProduct(product);
        setShowLogsModal(true);
    };

    const handleSave = async (updatedProductData) => {
        try {
            const updated = await updateProduct(adminUser.token, selectedProduct._id, updatedProductData);
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            toast.success('Product updated successfully');
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update product');
        }
    };

    const handleRestockSuccess = (updatedProduct) => {
        setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    };

    return (
        <div className="p-4 p-md-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <h5 className="mb-0 font-bold text-gray-800 text-lg text-nowrap">Product Inventory</h5>

                    <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1 relative">
                        <div className="w-full md:max-w-xs">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                <div className="pl-3 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Name, SKU..."
                                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center justify-center gap-2 px-3 py-2 bg-white border ${showFilterMenu || selectedCategory || selectedBrand ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap`}
                            >
                                <Filter size={18} />
                                <span>Filter</span>
                                {(selectedCategory || selectedBrand) && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                                )}
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-12 left-0 z-20 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <h6 className="font-bold text-gray-800 mb-3 text-sm">Filter Options</h6>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Brand</label>
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                value={selectedBrand}
                                                onChange={(e) => setSelectedBrand(e.target.value)}
                                            >
                                                <option value="">All Brands</option>
                                                {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        {(selectedCategory || selectedBrand) && (
                                            <button
                                                onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setShowFilterMenu(false); }}
                                                className="text-xs text-red-600 font-medium hover:text-red-700 mt-2 w-full text-center"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full xl:w-auto">
                        <button className="flex items-center justify-center gap-2 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-sm">
                            <Upload size={20} />
                            <span className="hidden sm:inline">Import</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm">
                            <Download size={20} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <Link
                            to="/admin/products/add"
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Add Product</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4 text-center">Brand</th>
                                <th className="px-6 py-4 text-center">Category</th>
                                <th className="px-6 py-4 text-center">Branches</th>
                                <th className="px-6 py-4 text-center">Price</th>
                                <th className="px-6 py-4 text-center">Total Stock</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted text-sm">Loading products...</p>
                                    </td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded border border-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden flex-shrink-0 relative">
                                                    {p.image
                                                        ? <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" />
                                                        : <span className="text-sm font-bold text-gray-400">{p.name.charAt(0)}</span>
                                                    }
                                                    <div
                                                        className={`position-absolute bottom-0 right-0 p-1 border rounded-sm ${p.isVeg ? 'bg-white' : 'bg-white'}`}
                                                        style={{ width: '12px', height: '12px', margin: '2px', border: p.isVeg ? '1.5px solid #198754' : '1.5px solid #dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title={p.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                                                    >
                                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: p.isVeg ? '#198754' : '#dc3545' }}></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{p.name}</span>
                                                    <span className="text-xs text-gray-400 font-mono">{p.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-center">{p.brandName}</td>
                                        <td className="px-6 py-4 text-gray-500 text-center">{p.category}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {p.branchStocks && p.branchStocks.length > 0 ? (
                                                    p.branchStocks.map((bs, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] whitespace-nowrap">
                                                            {bs.branchId?.name || 'Main'}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Branch</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">₹{p.basePrice?.toFixed(2)}</span>
                                                {p.mrp && p.mrp > p.basePrice && (
                                                    <span className="text-[10px] text-gray-400 text-decoration-line-through">₹{p.mrp.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-medium ${getTotalStock(p) === 0 ? 'text-red-600' : 'text-gray-700'}`}>
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
                                                <button
                                                    className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
                                                    title="Adjust Inventory"
                                                    onClick={() => handleRestockOpen(p)}
                                                >
                                                    <PackagePlus size={16} />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                                                    title="Edit"
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                                                    title="Delete"
                                                    onClick={() => handleDelete(p._id, p.name)}
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {showQR === p._id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-[5] bg-transparent"
                                                        onClick={() => setShowQR(null)}
                                                    ></div>
                                                    <div className="absolute right-10 top-12 bg-white shadow-xl p-4 rounded-xl border border-gray-100 z-[10] text-center animate-in fade-in zoom-in-95 duration-200" style={{ width: '180px' }}>
                                                        <h6 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Product QR Code</h6>
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
                                                                link.href = p.qrCode || ''; // Usually stored as data URL or Cloudinary URL
                                                                link.download = `QR-${p.sku}.png`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Download size={12} />
                                                            DOWNLOAD QR
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-400">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                onRestockSuccess={handleRestockSuccess}
            />

            <InventoryLogsModal
                show={showLogsModal}
                onHide={() => setShowLogsModal(false)}
                product={selectedProduct}
            />
        </div >
    );
};

export default AllProducts;
