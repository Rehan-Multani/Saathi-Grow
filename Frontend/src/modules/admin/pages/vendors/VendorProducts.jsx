import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, Filter, LayoutGrid, List, ArrowUpRight, TrendingUp, Star, MoreVertical, RefreshCw, Store, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../api/productApi';
import { getVendors } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const VendorProducts = () => {
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const vendorIdFromQuery = searchParams.get('vendorId');
    
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(vendorIdFromQuery || 'All');

    const fetchData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            
            const productParams = selectedVendor !== 'All' 
                ? { storeId: selectedVendor, storeType: 'vendor', hardFilter: 'true' } 
                : { source: 'vendor' };

            const [pData, vData] = await Promise.all([
                getProducts(adminUser.token, productParams),
                getVendors(adminUser.token)
            ]);
            
            setProducts(Array.isArray(pData) ? pData : (pData.products || []));
            setVendors(Array.isArray(vData) ? vData : (vData.vendors || []));
        } catch (error) {
            // toast.error('Failed to load product data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token) fetchData();
    }, [adminUser.token, selectedVendor]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleVendorChange = (vId) => {
        setSelectedVendor(vId);
        if (vId === 'All') {
            searchParams.delete('vendorId');
        } else {
            searchParams.set('vendorId', vId);
        }
        setSearchParams(searchParams);
    };

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('products.title')}</h1>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic">{t('products.subtitle')}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('products.search')}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        value={selectedVendor}
                        onChange={(e) => handleVendorChange(e.target.value)}
                        className="w-full md:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="All">{t('products.filter_all')}</option>
                        {vendors.map(v => (
                            <option key={v._id} value={v._id}>{v.storeName}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">{t('products.table.item')}</th>
                                <th className="px-6 py-5">{t('products.table.store')}</th>
                                <th className="px-6 py-5 text-center">{t('products.table.category')}</th>
                                <th className="px-6 py-5 text-center">{t('products.table.price')}</th>
                                <th className="px-6 py-5 text-center">{t('products.table.stock')}</th>
                                <th className="px-8 py-5 text-right">{t('all_vendors.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                                    {(p.image || p.images?.[0]) ? <img src={p.image || p.images[0]} className="w-full h-full object-cover" /> : <Package size={22} className="text-slate-200" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 leading-none uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{p.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter leading-none opacity-60">ID: {p._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-slate-600 text-xs uppercase tracking-tight">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                                    {p.vendor?.logo ? <img src={p.vendor.logo} className="w-full h-full object-cover" /> : <Store size={14} className="text-slate-300" />}
                                                </div>
                                                {p.vendor?.storeName || t('products.filter_all')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                                                {p.category || t('all_vendors.no_data')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="text-sm font-bold text-slate-900 tracking-tight leading-none italic">
                                                ₹{p.basePrice || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-bold leading-none tracking-tight ${p.stock < 10 ? 'text-rose-500' : 'text-slate-800'}`}>
                                                    {p.stock || 0}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60 italic">{t('products.table.status')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => navigate('/admin/products')}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                                <Package size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-none">{t('all_vendors.no_data')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorProducts;
