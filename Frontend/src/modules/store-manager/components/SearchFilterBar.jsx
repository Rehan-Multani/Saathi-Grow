import React from 'react';
import { Search, Filter, X, SlidersHorizontal, RefreshCw, ChevronDown } from 'lucide-react';

const SearchFilterBar = ({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    subCategoryFilter,
    setSubCategoryFilter,
    statusFilter,
    setStatusFilter,
    categories = [],
    subCategories = []
}) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[280px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Search</label>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search by name, SKU..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.replace(/\s/g, ''))}
                    />
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full sm:w-auto min-w-[180px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                <div className="relative">
                    <select
                        className="appearance-none w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-400 transition-all outline-none cursor-pointer pr-10"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="w-full sm:w-auto min-w-[180px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Subcategory</label>
                <div className="relative">
                    <select
                        className="appearance-none w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-400 transition-all outline-none cursor-pointer pr-10 disabled:opacity-50"
                        value={subCategoryFilter}
                        onChange={(e) => setSubCategoryFilter(e.target.value)}
                        disabled={categoryFilter === 'All'}
                    >
                        <option value="All">All</option>
                        {subCategories.map(sc => (
                            <option key={sc} value={sc}>{sc}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="w-full sm:w-auto min-w-[180px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Status</label>
                <div className="relative">
                    <select
                        className="appearance-none w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-400 transition-all outline-none cursor-pointer pr-10"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All</option>
                        <option value="In Stock">Available</option>
                        <option value="Low Stock">Low stock</option>
                        <option value="Out of Stock">Out of stock</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <button
                onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('All');
                    setSubCategoryFilter('All');
                    setStatusFilter('All');
                }}
                className="h-[42px] px-4 text-xs font-bold text-slate-400 hover:text-red-600 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
                <RefreshCw size={14} />
                Reset
            </button>
        </div>
    );
};

export default SearchFilterBar;
