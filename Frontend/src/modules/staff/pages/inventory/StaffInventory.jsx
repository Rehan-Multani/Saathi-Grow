import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet } from 'lucide-react';
import InventoryTable from '../../../store-manager/components/InventoryTable';
import SearchFilterBar from '../../../store-manager/components/SearchFilterBar';
import StockUpdateModal from '../../../store-manager/components/StockUpdateModal';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as productApi from '../../../admin/api/productApi';
import { createInventoryRequest } from '../../../store-manager/api/inventoryRequestApi';
import { toast } from 'react-toastify';

const StaffInventory = () => {
    const { staffUser } = useStaffAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [subCategoryFilter, setSubCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals State
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const categories = [...new Set(products.map(p => p.category))];
    const subCategories = categoryFilter === 'All' 
        ? [] 
        : [...new Set(products.filter(p => p.category === categoryFilter).map(p => p.subCategory).filter(Boolean))];

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await productApi.getProducts(staffUser.token);
            setProducts(data.products || []);
        } catch (error) {
            toast.error(error.message || 'Failed to sync inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (staffUser?.token) {
            fetchInventory();
        }
    }, [staffUser?.token]);

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
            await createInventoryRequest(staffUser.token, {
                productId: requestData.productId,
                currentStock: selectedProduct?.branchStocks?.find(bs => bs.branchId?._id === staffUser?.branchId || bs.branchId === staffUser?.branchId)?.stock || 0,
                adjustment: requestData.adjustment,
                type: requestData.type,
                notes: requestData.notes
            });
            toast.success("Inventory update requested successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to submit request");
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
                </div>
            </div>

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

            <div className="relative">
                <div className="absolute -top-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pointer-events-none">
                    Showing {filteredProducts.length} of {products.length} Assets
                </div>
                <InventoryTable
                    products={filteredProducts}
                    onUpdateStock={openStockModal}
                    branchId={staffUser?.branchId?._id || staffUser?.branchId}
                />
            </div>

            <StockUpdateModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onUpdate={handleUpdateStock}
                product={selectedProduct}
            />
        </div>
    );
};

export default StaffInventory;
