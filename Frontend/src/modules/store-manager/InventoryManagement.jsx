import React, { useState, useEffect } from 'react';
import { Plus, Download, Database, FileSpreadsheet, RefreshCcw, Activity, Layers, Activity as ActivityIcon } from 'lucide-react';
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
            toast.error(error.message || 'Failed to sync inventory intelligence');
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
            await createInventoryRequest(managerUser.token, {
                productId: requestData.productId,
                currentStock: selectedProduct?.branchStocks?.find(bs => bs.branchId?._id === managerUser?.branchId || bs.branchId === managerUser?.branchId)?.stock || 0,
                adjustment: requestData.adjustment,
                type: requestData.type,
                notes: requestData.notes
            });
            toast.success("Inventory re-calibration request transmitted.");
        } catch (error) {
            toast.error(error.message || "Protocol failure: Request rejected.");
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
        <div className="inventory-command-portal p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
                <div className="portal-header-text">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="badge-pill bg-blue-50 text-blue-600 border border-blue-100">
                            <Activity size={12} className="animate-pulse" />
                            <span>System Status: Optimal</span>
                        </div>
                        <div className="badge-pill bg-slate-50 text-slate-500 border border-slate-100">
                            <Layers size={12} />
                            <span>Data Nodes: {products.length}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-1 hover-scale bg-blue-600 rounded-full"></div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase tracking-widest leading-none">Command <span className="text-blue-600">Assets</span></h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Universal Asset Registry & Ledger Operations</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button 
                        onClick={fetchInventory}
                        disabled={loading}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Sync Intelligence
                    </button>
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95">
                        <FileSpreadsheet size={16} /> Export Ledger
                    </button>
                </div>
            </div>

            {/* Filter Hub Component */}
            <div className="filter-hub-wrapper mb-8">
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

            {/* Data Visualization Layer */}
            <div className="data-layer relative">
                <div className="absolute top-[-2.5rem] right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                    Showing {filteredProducts.length} Classified SKU's
                </div>
                
                <div className="inventory-table-container">
                    <InventoryTable
                        products={filteredProducts}
                        onUpdateStock={openStockModal}
                        branchId={managerUser?.branchId?._id || managerUser?.branchId}
                    />
                </div>
            </div>

            <StockUpdateModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onUpdate={handleUpdateStock}
                product={selectedProduct}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .inventory-command-portal { background: #fdfdff; min-height: 100vh; position: relative; overflow-x: hidden; }
                
                .badge-pill { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10rem; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
                .hover-scale { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .inventory-command-portal:hover .hover-scale { transform: scaleY(1.2); }
                
                .inventory-table-container { background: #fff; border: 1px solid #f1f5f9; border-radius: 3rem; box-shadow: 0 40px 60px -15px rgba(0,0,0,0.05); overflow: hidden; }
                
                /* Override possible global SearchFilterBar / InventoryTable styles */
                .filter-hub-wrapper { background: #fff; border: 1px solid #f1f5f9; border-radius: 2.5rem; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10rem; }
            `}} />
        </div>
    );
};

export default InventoryManagement;
