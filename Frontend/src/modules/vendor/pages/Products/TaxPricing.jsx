import React, { useState } from 'react';
import { TrendingUp, Save, Search, ChevronDown, Check, X, Filter } from 'lucide-react';

const TaxPricing = () => {
    const [products, setProducts] = useState([
        { id: 'GR-102', name: 'Aashirvaad Shudh Chakki Atta 5kg', price: 245.00, tax: 5 },
        { id: 'DY-045', name: 'Amul Gold Milk 500ml', price: 33.00, tax: 0 },
        { id: 'RI-892', name: 'Fortune Biryani Special Rice 1kg', price: 125.00, tax: 5 },
        { id: 'SP-331', name: 'Tata Salt Compressed 1kg', price: 28.00, tax: 0 },
        { id: 'CO-562', name: 'Maggi 2-Minute Noodles 420g', price: 84.00, tax: 12 },
        { id: 'BE-119', name: 'Red Label Tea 250g', price: 145.00, tax: 5 },
        { id: 'VG-201', name: 'Fresh Carrot 500g', price: 40.00, tax: 0 },
        { id: 'SN-445', name: 'Lays Chips 100g', price: 20.00, tax: 12 },
    ]);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [taxFilter, setTaxFilter] = useState('all');
    const [bulkUpdateType, setBulkUpdateType] = useState('percentage');
    const [bulkUpdateValue, setBulkUpdateValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Filter products based on search and tax filter
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTax = taxFilter === 'all' || product.tax === parseInt(taxFilter);
        return matchesSearch && matchesTax;
    });

    const calculatePriceWithTax = (price, tax) => {
        return (price + (price * tax / 100)).toFixed(2);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProducts(filteredProducts.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id)
                ? prev.filter(pid => pid !== id)
                : [...prev, id]
        );
    };

    const handleTaxChange = (id, newTax) => {
        setProducts(products.map(p => p.id === id ? { ...p, tax: parseFloat(newTax) || 0 } : p));
        setHasUnsavedChanges(true);
    };

    const handlePriceChange = (id, newPrice) => {
        setProducts(products.map(p => p.id === id ? { ...p, price: parseFloat(newPrice) || 0 } : p));
        setHasUnsavedChanges(true);
    };

    const handleBulkUpdate = () => {
        if (!bulkUpdateValue || selectedProducts.length === 0) return;

        const value = parseFloat(bulkUpdateValue);
        setProducts(products.map(product => {
            if (selectedProducts.includes(product.id)) {
                let newPrice = product.price;
                if (bulkUpdateType === 'percentage') {
                    newPrice = product.price + (product.price * value / 100);
                } else {
                    newPrice = product.price + value;
                }
                return { ...product, price: Math.max(0, newPrice) };
            }
            return product;
        }));
        setHasUnsavedChanges(true);
        setBulkUpdateValue('');
        setSelectedProducts([]);
    };

    const handleSave = () => {
        // In real app, send to backend
        setHasUnsavedChanges(false);
        alert('Changes saved successfully!');
    };

    const getTaxBadgeColor = (tax) => {
        if (tax === 0) return 'bg-green-50 text-green-700 border-green-200';
        if (tax === 5) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (tax === 12) return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-purple-50 text-purple-700 border-purple-200';
    };

    const allSelected = filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length;

    return (
        <div className="space-y-4 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-base font-bold text-gray-900">Tax & Pricing Strategy</h1>
                    <p className="text-[10px] text-gray-500 font-medium">Configure profit margins and tax compliance</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                        <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className="px-4 py-1.5 bg-[#0c831f] text-white rounded-lg text-xs font-bold hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                    >
                        <Save size={14} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="premium-card p-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search products by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#0c831f] focus:outline-none text-xs"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        <select
                            value={taxFilter}
                            onChange={(e) => setTaxFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-8 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0c831f] cursor-pointer"
                        >
                            <option value="all">All Tax Rates</option>
                            <option value="0">0% GST</option>
                            <option value="5">5% GST</option>
                            <option value="12">12% GST</option>
                            <option value="18">18% GST</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Bulk Price Update */}
            <div className="premium-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-[#0c831f]" />
                    <h2 className="text-sm font-bold text-gray-900">Bulk Price Update</h2>
                    {selectedProducts.length > 0 && (
                        <span className="text-xs bg-[#0c831f] text-white px-2 py-0.5 rounded-full font-bold">
                            {selectedProducts.length} selected
                        </span>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                        <select
                            value={bulkUpdateType}
                            onChange={(e) => setBulkUpdateType(e.target.value)}
                            className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-lg px-3 pr-8 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0c831f] cursor-pointer"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat Amount (₹)</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                        type="number"
                        placeholder="Enter value"
                        value={bulkUpdateValue}
                        onChange={(e) => setBulkUpdateValue(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#0c831f]"
                    />
                    <button
                        onClick={handleBulkUpdate}
                        disabled={!bulkUpdateValue || selectedProducts.length === 0}
                        className="px-6 py-1.5 bg-[#a380f9] text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Update Selected
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="premium-card overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-4 py-2 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-[#0c831f] border-gray-300 rounded focus:ring-[#0c831f] cursor-pointer"
                            />
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Product</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase text-center">Price (₹)</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase text-center">Tax Rate</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase text-right">Final Price</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-green-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                        className="w-4 h-4 text-[#0c831f] border-gray-300 rounded focus:ring-[#0c831f] cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">ID: {product.id}</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={product.price.toFixed(2)}
                                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                        className="w-24 h-8 bg-white border border-gray-200 rounded px-2 text-xs font-bold text-gray-900 text-center focus:outline-none focus:border-[#0c831f] transition-colors"
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="number"
                                        value={product.tax}
                                        onChange={(e) => handleTaxChange(product.id, e.target.value)}
                                        className="w-16 h-8 bg-white border border-gray-200 rounded px-2 text-xs font-bold text-gray-900 text-center focus:outline-none focus:border-[#0c831f] transition-colors"
                                    />
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTaxBadgeColor(product.tax)}`}>
                                        {product.tax}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-end">
                                    <p className="text-sm font-bold text-[#0c831f]">
                                        ₹{calculatePriceWithTax(product.price, product.tax)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`p-4 space-y-3 ${selectedProducts.includes(product.id) ? 'bg-green-50/50' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleSelectProduct(product.id)}
                                    className="w-4 h-4 text-[#0c831f] border-gray-300 rounded focus:ring-[#0c831f] cursor-pointer mt-1"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 mb-1">{product.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">ID: {product.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Price</label>
                                    <input
                                        type="number"
                                        value={product.price.toFixed(2)}
                                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                        className="w-full h-8 bg-white border border-gray-200 rounded px-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0c831f]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Tax Rate</label>
                                    <input
                                        type="number"
                                        value={product.tax}
                                        onChange={(e) => handleTaxChange(product.id, e.target.value)}
                                        className="w-full h-8 bg-white border border-gray-200 rounded px-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0c831f]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getTaxBadgeColor(product.tax)}`}>
                                    GST {product.tax}%
                                </span>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold mb-0.5">Final Price</p>
                                    <p className="text-sm font-bold text-[#0c831f]">
                                        ₹{calculatePriceWithTax(product.price, product.tax)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="p-12 text-center">
                        <Search size={32} className="text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-900">No products found</h3>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxPricing;
