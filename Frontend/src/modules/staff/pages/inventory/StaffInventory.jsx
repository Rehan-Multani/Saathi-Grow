import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, Activity, ChevronRight, Package, Search } from 'lucide-react';
import InventoryTable from '../../../store-manager/components/InventoryTable';
import SearchFilterBar from '../../../store-manager/components/SearchFilterBar';
import StockUpdateModal from '../../../store-manager/components/StockUpdateModal';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as productApi from '../../../../common/api/productApi';
import { createInventoryRequest } from '../../../store-manager/api/inventoryRequestApi';
import { toast } from 'react-toastify';

const StaffInventory = () => {
    const { staffUser } = useStaffAuth();
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

    const handleExportList = () => {
        try {
            const branchId = staffUser?.branchId?._id || staffUser?.branchId;
            const headers = ['SKU', 'Name', 'Category', 'SubCategory', 'Status', 'Stock', 'Price'];
            const csvRows = filteredProducts.map(p => {
                const stockItem = p.branchStocks?.find(bs => bs.branchId?._id === branchId || bs.branchId === branchId);
                const stock = stockItem ? stockItem.stock : 0;
                return [
                    p.sku || '',
                    `"${(p.name || '').replace(/"/g, '""')}"`,
                    `"${(p.category || '').replace(/"/g, '""')}"`,
                    `"${(p.subCategory || '').replace(/"/g, '""')}"`,
                    p.status || '',
                    stock,
                    p.price || 0
                ].join(',');
            });

            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `staff_inventory_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Inventory exported successfully!");
        } catch (error) {
            toast.error("Failed to export inventory");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 text-left">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Manage Stock</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic">
                            <Activity size={12} className="animate-pulse" /> Live Stock
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update store stock levels</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={handleExportList} className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                        <FileSpreadsheet size={18} className="text-emerald-500" /> Export List
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-6 md:p-8">
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

                <div className="mt-8 relative">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Product Catalog</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            {filteredProducts.length} of {products.length} Products
                        </div>
                    </div>
                    
                    <div className="bg-[#fcfdfe] rounded-[2rem] border border-slate-100 overflow-hidden">
                        <InventoryTable
                            products={filteredProducts}
                            onUpdateStock={openStockModal}
                            branchId={staffUser?.branchId?._id || staffUser?.branchId}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            <StockUpdateModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onUpdate={handleUpdateStock}
                product={selectedProduct}
            />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StaffInventory;
