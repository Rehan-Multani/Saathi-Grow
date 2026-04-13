import React, { useState, useEffect } from 'react';
import { Plus, Download, Database, FileSpreadsheet, RefreshCcw, Activity, Layers, Activity as ActivityIcon, Loader2, Package } from 'lucide-react';
import InventoryTable from './components/InventoryTable';
import SearchFilterBar from './components/SearchFilterBar';
import StockUpdateModal from './components/StockUpdateModal';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import * as productApi from '../../common/api/productApi';
import { createInventoryRequest } from './api/inventoryRequestApi';
import { toast } from 'react-toastify';

const InventoryManagement = () => {
    const { managerUser } = useStoreManagerAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [subCategoryFilter, setSubCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const categories = [...new Set(products.map(p => p.category))];
    const subCategories = categoryFilter === 'All' 
        ? [] 
        : [...new Set(products.filter(p => p.category === categoryFilter).map(p => p.subCategory).filter(Boolean))];

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await productApi.getProducts(managerUser.token);
            setProducts(data.products || []);
        } catch (error) {
            toast.error(error.message || 'Failed to sync inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (managerUser?.token) {
            fetchInventory();
        }
    }, [managerUser?.token]);

    useEffect(() => {
        let result = products;

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'All') {
            result = result.filter(p => p.category === categoryFilter);
        }

        if (subCategoryFilter !== 'All') {
            result = result.filter(p => p.subCategory === subCategoryFilter);
        }

        if (statusFilter !== 'All') {
            if (statusFilter === 'In Stock') result = result.filter(p => p.status === 'Active');
            if (statusFilter === 'Low Stock') result = result.filter(p => p.status === 'Low Stock');
            if (statusFilter === 'Out of Stock') result = result.filter(p => p.status === 'Out of Stock');
        }

        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, subCategoryFilter, statusFilter, products]);

    const handleUpdateStock = async (requestData) => {
        try {
            setLoading(true);
            const currentStock = selectedProduct?.branchStocks?.find(bs => bs.branchId?._id === managerUser?.branchId || bs.branchId === managerUser?.branchId)?.stock || 0;
            await createInventoryRequest(managerUser.token, {
                productId: requestData.productId,
                currentStock,
                adjustment: requestData.adjustment,
                type: requestData.type,
                notes: requestData.notes
            });
            toast.success("Inventory update request submitted.");
            fetchInventory();
        } catch (error) {
            toast.error(error.message || "Failed to submit request.");
        } finally {
            setLoading(false);
            setIsStockModalOpen(false);
        }
    };

    const openStockModal = (product) => {
        setSelectedProduct(product);
        setIsStockModalOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Stock</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track stock levels for your store.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={fetchInventory}
                        disabled={loading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} 
                        Refresh Stock
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm">
                        <FileSpreadsheet size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                            <p className="text-2xl font-black text-slate-900">{products.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Stock</p>
                            <p className="text-2xl font-black text-slate-900">{products.filter(p => p.status === 'Active').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-red-600">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low/Out of Stock</p>
                            <p className="text-2xl font-black text-slate-900">{products.filter(p => p.status !== 'Active').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
                <SearchFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    subCategoryFilter={subCategoryFilter}
                    setSubCategoryFilter={setSubCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    categories={categories}
                    subCategories={subCategories}
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Showing {filteredProducts.length} Products
                    </span>
                </div>
                <InventoryTable
                    products={filteredProducts}
                    onUpdateStock={openStockModal}
                    branchId={managerUser?.branchId?._id || managerUser?.branchId}
                    loading={loading}
                />
            </div>

            <StockUpdateModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onUpdate={handleUpdateStock}
                product={selectedProduct}
                loading={loading}
            />
        </div>
    );
};

export default InventoryManagement;
