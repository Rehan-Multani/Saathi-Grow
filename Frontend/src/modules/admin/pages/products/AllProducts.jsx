import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, QrCode, Upload, Download, Filter, PackagePlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Spinner } from 'react-bootstrap';
import ProductEditModal from '../../components/products/ProductEditModal';
import RestockModal from '../../components/products/RestockModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getProducts, deleteProduct, updateProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';

const ProductStatusBadge = ({ status }) => {
    const variants = {
        Active: 'bg-green-100 text-green-700',
        'Low Stock': 'bg-amber-100 text-amber-700',
        'Out of Stock': 'bg-red-100 text-red-700',
        Draft: 'bg-gray-100 text-gray-700'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
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

    const handleRestockSave = async (productId, amount) => {
        try {
            const product = products.find(p => p._id === productId);
            const newStock = product.stockQuantity + parseInt(amount);

            const data = new FormData();
            data.append('stockQuantity', newStock);
            if (newStock > 10) data.append('status', 'Active');

            const updated = await updateProduct(adminUser.token, productId, data);
            setProducts(products.map(p => p._id === updated._id ? updated : p));
            showSuccessAlert('Inventory Updated!', `${amount} units have been added.`);
        } catch (error) {
            showErrorAlert('Error', error.message || 'Failed to update stock');
        }
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
                    {loading ? (
                        <div className="text-center py-10">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading products...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4 text-center">Brand</th>
                                    <th className="px-6 py-4 text-center">Category</th>
                                    <th className="px-6 py-4 text-center">Price</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold overflow-hidden border">
                                                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : p.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{p.name}</span>
                                                    <span className="text-xs text-gray-400 font-mono">{p.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-center">{p.brandName}</td>
                                        <td className="px-6 py-4 text-gray-500 text-center">{p.category}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800 text-center">₹{p.basePrice?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-medium ${p.stockQuantity === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {p.stockQuantity}
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
                                                    className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
                                                    title="Restock"
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
                                                    <div className="absolute right-10 top-12 bg-white shadow-xl p-3 rounded-xl border border-gray-100 z-[10] text-center animate-in fade-in zoom-in-95 duration-200">
                                                        <QRCodeSVG value={p.sku} size={100} />
                                                        <div className="text-xs mt-2 text-gray-500 font-bold">{p.sku}</div>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-400">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
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
                onRestock={handleRestockSave}
            />
        </div>
    );
};

export default AllProducts;
