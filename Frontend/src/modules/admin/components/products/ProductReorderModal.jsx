import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    X, ArrowUpDown, ArrowUp, ArrowDown, GripVertical, Check, 
    RotateCcw, Sparkles, Search, Layers, Loader2, Save, ArrowUpToLine, ArrowDownToLine, Plus, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, bulkReorderProducts } from '../../api/productApi';
import { toast } from 'react-toastify';

const ProductReorderModal = ({ show, onHide, token, onSuccess, categories = [] }) => {
    const { t } = useTranslation('admin_products');

    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState([]);
    const [draggedId, setDraggedId] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Safely retrieve complete category dataset across all pages
    const fetchProductsForReorder = useCallback(async (catName) => {
        if (!token) return;
        setLoading(true);
        try {
            let allFetched = [];
            let currentPage = 1;
            let totalPages = 1;
            const pageSize = 100;

            do {
                const params = {
                    limit: pageSize,
                    page: currentPage,
                    category: catName || undefined
                };
                const response = await getProducts(token, params);
                const rawProducts = response?.products || response?.data?.products || (Array.isArray(response) ? response : []);
                totalPages = Number(response?.pages) || 1;
                allFetched = allFetched.concat(rawProducts);
                currentPage++;
            } while (currentPage <= totalPages && totalPages > 1);
            
            // Format products with displayOrder: number | null
            const formatted = allFetched.map((p) => ({
                ...p,
                displayOrder: (p.displayOrder !== undefined && p.displayOrder !== null && p.displayOrder >= 0)
                    ? Number(p.displayOrder)
                    : null
            }));

            setItems(formatted);
            setHasUnsavedChanges(false);
        } catch (error) {
            toast.error(error.message || 'Failed to load products for reordering');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (show) {
            fetchProductsForReorder(selectedCategory);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [show, selectedCategory, fetchProductsForReorder]);

    // Separate into assigned and unassigned products
    const assignedItems = useMemo(() => {
        return items
            .filter(it => it.displayOrder !== null && it.displayOrder !== undefined)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [items]);

    const unassignedItems = useMemo(() => {
        return items.filter(it => it.displayOrder === null || it.displayOrder === undefined);
    }, [items]);

    // Filtered assigned and unassigned items for search
    const filteredAssigned = useMemo(() => {
        if (!searchTerm.trim()) return assignedItems;
        const term = searchTerm.toLowerCase();
        return assignedItems.filter(it => 
            it.name?.toLowerCase().includes(term) || it.sku?.toLowerCase().includes(term)
        );
    }, [assignedItems, searchTerm]);

    const filteredUnassigned = useMemo(() => {
        if (!searchTerm.trim()) return unassignedItems;
        const term = searchTerm.toLowerCase();
        return unassignedItems.filter(it => 
            it.name?.toLowerCase().includes(term) || it.sku?.toLowerCase().includes(term)
        );
    }, [unassignedItems, searchTerm]);

    // Move item using productId to prevent search filter index mismatches
    const moveItem = (productId, targetAction) => {
        const currentIndex = assignedItems.findIndex(it => it._id === productId);
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        if (targetAction === 'top') newIndex = 0;
        else if (targetAction === 'bottom') newIndex = assignedItems.length - 1;
        else if (targetAction === 'up') newIndex = Math.max(0, currentIndex - 1);
        else if (targetAction === 'down') newIndex = Math.min(assignedItems.length - 1, currentIndex + 1);
        else if (typeof targetAction === 'number') newIndex = targetAction;

        if (newIndex === currentIndex) return;

        const newAssigned = [...assignedItems];
        const [moved] = newAssigned.splice(currentIndex, 1);
        newAssigned.splice(newIndex, 0, moved);

        // Re-index displayOrder sequentially 1..N
        const reIndexed = newAssigned.map((it, idx) => ({
            ...it,
            displayOrder: idx + 1
        }));

        setItems([...reIndexed, ...unassignedItems]);
        setHasUnsavedChanges(true);
    };

    const handleDragStart = (e, productId) => {
        setDraggedId(productId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', productId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetProductId) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetProductId) {
            setDraggedId(null);
            return;
        }

        const fromIndex = assignedItems.findIndex(it => it._id === draggedId);
        const toIndex = assignedItems.findIndex(it => it._id === targetProductId);

        if (fromIndex !== -1 && toIndex !== -1) {
            const newAssigned = [...assignedItems];
            const [moved] = newAssigned.splice(fromIndex, 1);
            newAssigned.splice(toIndex, 0, moved);

            const reIndexed = newAssigned.map((it, idx) => ({
                ...it,
                displayOrder: idx + 1
            }));

            setItems([...reIndexed, ...unassignedItems]);
            setHasUnsavedChanges(true);
        }
        setDraggedId(null);
    };

    const handleAssign = (product) => {
        const nextOrder = assignedItems.length > 0
            ? Math.max(...assignedItems.map(it => it.displayOrder || 0)) + 1
            : 1;

        const updatedAssigned = [...assignedItems, { ...product, displayOrder: nextOrder }];
        const updatedUnassigned = unassignedItems.filter(it => it._id !== product._id);

        setItems([...updatedAssigned, ...updatedUnassigned]);
        setHasUnsavedChanges(true);
    };

    const handleUnassign = (product) => {
        const remainingAssigned = assignedItems
            .filter(it => it._id !== product._id)
            .map((it, idx) => ({ ...it, displayOrder: idx + 1 }));

        const unassignedProduct = { ...product, displayOrder: null };
        const updatedUnassigned = [unassignedProduct, ...unassignedItems.filter(it => it._id !== product._id)];

        setItems([...remainingAssigned, ...updatedUnassigned]);
        setHasUnsavedChanges(true);
    };

    const handleAutoSequenceAll = () => {
        const reIndexed = assignedItems.map((it, idx) => ({
            ...it,
            displayOrder: idx + 1
        }));
        setItems([...reIndexed, ...unassignedItems]);
        setHasUnsavedChanges(true);
        toast.info('Assigned products re-indexed sequentially (1..N)');
    };

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const payloadItems = items.map(it => ({
                id: it._id,
                displayOrder: it.displayOrder ?? null
            }));

            await bulkReorderProducts(token, payloadItems);
            toast.success('Product display order updated successfully!');
            setHasUnsavedChanges(false);
            if (onSuccess) onSuccess();
            onHide();
        } catch (error) {
            toast.error(error.message || 'Failed to save product ordering');
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1070] flex items-center justify-center p-3 sm:p-4 md:p-6 font-sans">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            {/* Modal Dialog */}
            <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in zoom-in duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                            <ArrowUpDown size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Product Display Sequence Manager</h3>
                            <p className="text-xs text-slate-500 font-medium">Arrange the display order of items shown on the storefront and customer catalog</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                        {hasUnsavedChanges && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                                <AlertCircle size={13} /> Unsaved Changes
                            </span>
                        )}
                        <button 
                            onClick={onHide}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters & Actions Bar */}
                <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Category Dropdown */}
                        <div className="w-full sm:w-56">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">All Categories (Global)</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Filter products by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={handleAutoSequenceAll}
                            disabled={assignedItems.length === 0}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Renumber all assigned products 1, 2, 3... in current order"
                        >
                            <Sparkles size={14} className="text-blue-600" />
                            <span>Auto-Sequence (1..N)</span>
                        </button>

                        <button
                            onClick={() => fetchProductsForReorder(selectedCategory)}
                            disabled={loading}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                            title="Reload from server"
                        >
                            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Main Content List */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/40">
                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                            <p className="text-slate-400 text-xs font-medium">Loading catalog sequence...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-20 text-center text-slate-400">
                            <Layers size={40} className="mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-slate-600">No products found in this category.</p>
                        </div>
                    ) : (
                        <>
                            {/* Assigned Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/60 to-white border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                            Assigned Priority Products ({assignedItems.length})
                                        </h4>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">Appear first in catalog in exact order</span>
                                </div>

                                {filteredAssigned.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs italic">
                                        {assignedItems.length === 0 
                                            ? 'No products currently have an assigned priority position. Click "Assign Position" on items below to set priority.'
                                            : 'No assigned products match the search filter.'}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredAssigned.map((product) => {
                                            const actualIndex = assignedItems.findIndex(it => it._id === product._id);
                                            const isFirst = actualIndex === 0;
                                            const isLast = actualIndex === assignedItems.length - 1;

                                            return (
                                                <div
                                                    key={product._id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, product._id)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, product._id)}
                                                    className={`p-3.5 flex items-center justify-between gap-4 transition-all hover:bg-slate-50 ${draggedId === product._id ? 'opacity-40 bg-blue-50/50' : 'bg-white'}`}
                                                >
                                                    {/* Left: Drag Handle & Rank Badge & Thumbnail */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <button 
                                                            type="button"
                                                            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-1"
                                                            title="Drag to reorder"
                                                        >
                                                            <GripVertical size={18} />
                                                        </button>

                                                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                                                            #{product.displayOrder}
                                                        </span>

                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                                                            {product.image ? (
                                                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                                                            ) : (
                                                                <Layers size={16} className="text-slate-300" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                                                                {product.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-mono">
                                                                {product.sku} • ₹{product.basePrice} {product.category ? `• ${product.category}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Reorder Controls & Unassign */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => moveItem(product._id, 'top')}
                                                            disabled={isFirst}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Move to Top"
                                                        >
                                                            <ArrowUpToLine size={15} />
                                                        </button>

                                                        <button
                                                            onClick={() => moveItem(product._id, 'up')}
                                                            disabled={isFirst}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp size={15} />
                                                        </button>

                                                        <button
                                                            onClick={() => moveItem(product._id, 'down')}
                                                            disabled={isLast}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown size={15} />
                                                        </button>

                                                        <button
                                                            onClick={() => moveItem(product._id, 'bottom')}
                                                            disabled={isLast}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Move to Bottom"
                                                        >
                                                            <ArrowDownToLine size={15} />
                                                        </button>

                                                        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>

                                                        <button
                                                            onClick={() => handleUnassign(product)}
                                                            className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                                                            title="Remove from priority order"
                                                        >
                                                            <X size={14} />
                                                            <span>Unassign</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Unassigned Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Unassigned Products ({unassignedItems.length})
                                        </h4>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">Sorted by default date / creation order</span>
                                </div>

                                {filteredUnassigned.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs italic">
                                        {unassignedItems.length === 0 
                                            ? 'All products currently have assigned positions.'
                                            : 'No unassigned products match the search filter.'}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                                        {filteredUnassigned.map((product) => (
                                            <div
                                                key={product._id}
                                                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                                                        —
                                                    </span>

                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                                                        {product.image ? (
                                                            <img src={product.image} alt="" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Layers size={16} className="text-slate-300" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="text-xs font-semibold text-slate-800 truncate" title={product.name}>
                                                            {product.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            {product.sku} • ₹{product.basePrice} {product.category ? `• ${product.category}` : ''}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleAssign(product)}
                                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                                                >
                                                    <Plus size={14} />
                                                    <span>Assign Position</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0">
                    <div className="text-xs text-slate-500 font-medium">
                        {assignedItems.length} priority items • {unassignedItems.length} unassigned items
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onHide}
                            disabled={saving}
                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !hasUnsavedChanges}
                            className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-md ${saving || !hasUnsavedChanges ? 'bg-blue-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95'}`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={15} />
                                    <span>Saving Sequence...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={15} />
                                    <span>Save Sequence</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReorderModal;
