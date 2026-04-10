import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Package, AlertTriangle, Activity, RefreshCw, MapPin, AlertCircle, ChevronRight, LayoutGrid, Loader2, ArrowRight, Wallet, Store, TrendingUp, CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getInventoryStats } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const StockOverview = () => {
    const { t } = useTranslation('admin_stock');
    const { adminUser } = useAdminAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [data, setData] = useState({
        stats: { totalStock: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 },
        categoryDistribution: [],
        branchHealth: [],
        criticalItems: []
    });

    const isAdmin = adminUser.role === 'Admin';

    const fetchOverviewData = useCallback(async (isRefresh = false) => {
        if (!adminUser?.token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [statsData, branchData] = await Promise.all([
                getInventoryStats(adminUser.token, selectedBranch === 'all' ? null : selectedBranch),
                isAdmin ? getBranches(adminUser.token) : Promise.resolve([])
            ]);

            setData(statsData);
            if (isAdmin) setBranches(branchData);
        } catch (error) {
            toast.error(t('overview.error_sync'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [adminUser.token, selectedBranch, isAdmin, t]);

    useEffect(() => {
        fetchOverviewData();
    }, [fetchOverviewData]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(val);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-sm font-medium">{t('overview.loading_msg')}</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('overview.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.stockOverview} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('overview.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isAdmin && (
                        <div className="relative flex-1 md:w-60 group">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <select
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-xs font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                <option value="all">{t('branch.all_branches')}</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => fetchOverviewData(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group cursor-pointer" onClick={() => navigate('/admin/stock/branches')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Package size={20} />
                        </div>
                        <TrendingUp size={20} className="text-slate-200" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('overview.stats.total')}</div>
                    <div className="text-2xl font-bold text-slate-900">{data.stats.totalStock?.toLocaleString()}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('overview.stats.inventory_value')}</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.stats.inventoryValue || 0)}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-200 transition-all group cursor-pointer" onClick={() => navigate('/admin/stock/alerts')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-lg uppercase">{t('overview.stats.urgent')}</div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('overview.stats.low')}</div>
                    <div className="text-2xl font-bold text-amber-600">{data.stats.lowStockCount}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-200 transition-all group cursor-pointer" onClick={() => navigate('/admin/stock/alerts')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <AlertCircle size={20} />
                        </div>
                        <div className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg uppercase">{t('overview.stats.critical')}</div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('overview.stats.out')}</div>
                    <div className="text-2xl font-bold text-rose-600">{data.stats.outOfStockCount}</div>
                </div>
            </div>

            {/* Branch Health Grid */}
            {isAdmin && selectedBranch === 'all' && (
                <div className="mb-8 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 ml-1">
                        <LayoutGrid size={18} className="text-blue-500" />
                        {t('overview.branch_health.title')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.branchHealth.map((branch, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate('/admin/stock/branches')}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{branch.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">{branch.code}</div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${branch.healthScore > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {Math.round(branch.healthScore)}%
                                    </div>
                                </div>
                                <div className="space-y-3 mt-6">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <span>{t('overview.branch_health.items')}</span>
                                        <span className="text-slate-900 text-xs">{branch.totalProducts}</span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100/50">
                                        <div className={`h-full transition-all duration-1000 ${branch.healthScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${branch.healthScore}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Urgent Restock Table */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900">{t('overview.urgent_restock.title')}</h3>
                            <button onClick={() => navigate('/admin/stock/alerts')} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group">
                                {t('overview.urgent_restock.view_full_log')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('overview.table.product')}</th>
                                        <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('alerts.table.current')}</th>
                                        <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('overview.table.status')}</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.criticalItems.length > 0 ? data.criticalItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                 <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300">
                                                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" /> : <Package size={18} />}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight">{item.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-semibold">{item.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className={`text-xs font-bold ${item.stock <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>{item.stock}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${item.stock <= 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {item.stock <= 0 ? t('overview.urgent_restock.out_of_stock') : t('overview.urgent_restock.low_stock')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate('/admin/stock/adjustments/add', { state: { productId: item._id, sku: item.sku, branchId: item.branchId } })}
                                                    disabled={item.isVendor}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    title={t('overview.urgent_restock.quick_adjust')}
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-300">
                                                    <CheckCircle size={32} />
                                                    <p className="text-xs font-semibold">{t('overview.urgent_restock.well_stocked')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full">
                        <div className="flex items-center gap-2 mb-6 ml-1">
                            <LayoutGrid size={18} className="text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('overview.distribution.title')}</h3>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.categoryDistribution} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={14}>
                                        {data.categoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#94a3b8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StockOverview;
