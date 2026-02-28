import React, { useState, useEffect } from 'react';
import { Plus, Download, Database, FileSpreadsheet, RefreshCcw } from 'lucide-react';
import InventoryTable from './components/InventoryTable';
import SearchFilterBar from './components/SearchFilterBar';
import AddProductModal from './components/AddProductModal';
import StockUpdateModal from './components/StockUpdateModal';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import * as productApi from '../admin/api/productApi';
import { toast } from 'react-toastify';

const InventoryManagement = () => {
    const { managerUser } = useStoreManagerAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const categories = [...new Set(products.map(p => p.category))];

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await productApi.getProducts(managerUser.token);
            setProducts(data);
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

        if (statusFilter !== 'All') {
            if (statusFilter === 'In Stock') result = result.filter(p => p.status === 'Active');
            if (statusFilter === 'Low Stock') result = result.filter(p => p.status === 'Low Stock');
            if (statusFilter === 'Out of Stock') result = result.filter(p => p.status === 'Out of Stock');
        }

        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, statusFilter, products]);

    const handleAddProduct = (newProduct) => {
        fetchInventory();
        setEditingProduct(null);
        setIsAddModalOpen(false);
    };

    const handleUpdateStock = async (productId, newStock) => {
        // This will be called from Modal which hits API directly
        fetchInventory();
        setIsStockModalOpen(false);
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== productId));
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsAddModalOpen(true);
    };

    const openStockModal = (product) => {
        setSelectedProduct(product);
        setIsStockModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <Database size={24} />
                        </div>
                        Inventory Command Center
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1 ml-16">Real-time oversight of warehouse SKU availability, valuation, and life-cycle management.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest active:translate-y-0.5">
                        <FileSpreadsheet size={16} className="text-emerald-500" /> Catalog Export
                    </button>
                    <button
                        onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}
                        className="flex items-center gap-2 px-8 py-3.5 text-xs font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={18} /> New Asset
                    </button>
                </div>
            </div>

            <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categories={categories}
            />

            <div className="relative">
                <div className="absolute -top-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pointer-events-none">
                    Showing {filteredProducts.length} of {products.length} Assets
                </div>
                <InventoryTable
                    products={filteredProducts}
                    onEdit={openEditModal}
                    onUpdateStock={openStockModal}
                    onDelete={handleDeleteProduct}
                    branchId={managerUser?.branchId?._id || managerUser?.branchId}
                />
            </div>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddProduct}
                editingProduct={editingProduct}
            />

            <StockUpdateModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onUpdate={handleUpdateStock}
                product={selectedProduct}
            />
        </div>
    );
};

export default InventoryManagement;
