import React from 'react';
import { Search, Filter, X, SlidersHorizontal, RefreshCw } from 'lucide-react';

const SearchFilterBar = ({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    categories = []
}) => {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 mb-8 flex flex-wrap gap-6 items-end relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <SlidersHorizontal size={80} />
            </div>

            <div className="flex-1 min-w-[300px] relative z-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Search Catalog</label>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search by name, SKU or keywords..."
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full sm:w-auto min-w-[200px] relative z-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Category Classification</label>
                <div className="relative">
                    <select
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none cursor-pointer"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">Global Catalog</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Filter size={14} />
                    </div>
                </div>
            </div>

            <div className="w-full sm:w-auto min-w-[200px] relative z-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Inventory State</label>
                <div className="relative">
                    <select
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="In Stock">In Stock (Healthy)</option>
                        <option value="Low Stock">Critical Levels</option>
                        <option value="Out of Stock">Depleted</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <SlidersHorizontal size={14} />
                    </div>
                </div>
            </div>

            <button
                onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('All');
                    setStatusFilter('All');
                }}
                className="h-[52px] px-6 text-xs font-black text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2 border border-transparent hover:border-red-100 uppercase tracking-widest relative z-10"
            >
                <RefreshCw size={14} />
                Reset
            </button>
        </div>
    );
};

export default SearchFilterBar;
