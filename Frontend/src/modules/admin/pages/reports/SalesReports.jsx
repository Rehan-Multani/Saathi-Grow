import React, { useState, useEffect, useCallback } from 'react';
import { Download, Calendar, IndianRupee, TrendingUp, ShoppingBag, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getSalesReports, exportSalesCSV } from '../../api/reportApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import { downloadCSV } from '../../../../common/utils/formatUtils';

const SalesReports = () => {
    const { t } = useTranslation('admin_reports');
    const { adminUser } = useAdminAuth();
    const [page, setPage] = useState(1);
    const [period, setPeriod] = useState('last_30_days');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState({
        stats: {
            totalRevenue: 0,
            revenueGrowth: 0,
            totalOrders: 0,
            ordersGrowth: 0,
            avgOrderValue: 0,
            periodSales: 0
        },
        orders: [],
        pagination: {
            total: 0,
            totalPages: 1
        }
    });

    const limit = 10;

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSalesReports(adminUser.token, {
                page,
                limit,
                period
            });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            // toast.error(error.message || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, period]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
        setPage(1);
    };

    const handleExport = async () => {
        if (!adminUser?.token) return;
        setExporting(true);
        try {
            const blob = await exportSalesCSV(adminUser.token, { period });
            const fileName = `Sales_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(blob, fileName);
            toast.success(t('sales.download_success', { defaultValue: 'Report downloaded' }));
        } catch (error) {
            toast.error(t('common.error', { ns: 'common' }));
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('sales.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.salesReports} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('sales.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={period}
                        onChange={handlePeriodChange}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-slate-700 shadow-sm appearance-none cursor-pointer pr-10 mr-2"
                    >
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_year">This Year</option>
                    </select>

                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>{t('sales.download')}</span>
                    </button>
                    
                    <button
                        onClick={fetchReports}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all shadow-sm active:scale-90"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                            <IndianRupee size={20} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${data.stats.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {data.stats.revenueGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(data.stats.revenueGrowth)}%
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('sales.total_revenue')}</p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(data.stats.totalRevenue)}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                            <ShoppingBag size={20} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${data.stats.ordersGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {data.stats.ordersGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(data.stats.ordersGrowth)}%
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('sales.total_orders')}</p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">{data.stats.totalOrders}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('sales.average_value')}</p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(data.stats.avgOrderValue)}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period Sales</p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(data.stats.periodSales)}</h3>
                </div>
            </div>

            {/* List Toolbar */}
            <div className="bg-white px-8 py-4 border border-slate-200 rounded-t-[2rem] border-b-0 flex items-center justify-between">
                <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{t('sales.title')} Table</h5>
                {!loading && (
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Total {data.pagination.total} orders detected
                    </div>
                )}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-b-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-4">{t('sales.table.order_id')}</th>
                                <th className="px-6 py-4">{t('sales.table.date')}</th>
                                <th className="px-6 py-4">{t('sales.table.customer')}</th>
                                <th className="px-6 py-4 text-center">{t('sales.table.status')}</th>
                                <th className="px-8 py-4 text-right uppercase">{t('sales.table.amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && data.orders.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data.orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <AlertCircle size={40} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-slate-900 font-black text-xs uppercase tracking-tight">{t('sales.no_data')}</h3>
                                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">Adjustment of period flags required.</p>
                                    </td>
                                </tr>
                            ) : (
                                data.orders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-black text-blue-600 uppercase tracking-tighter">#{order.id}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[11px] font-bold text-slate-500 uppercase opacity-70">{order.date}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-bold text-slate-800 uppercase truncate max-w-[180px]">{order.customer}</div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{order.items} items — {order.payment}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm whitespace-nowrap ${
                                                    order.status === 'Delivered' || order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50' : 
                                                    order.status === 'Refunded' || order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 shadow-rose-100/50' : 
                                                    'bg-blue-50 text-blue-600 shadow-blue-100/50'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900 text-xs">
                                            {formatCurrency(order.total)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                {!loading && data.pagination.total > 0 && data.pagination.totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Dispensing <span className="text-slate-900">{((page - 1) * limit) + 1} - {Math.min(page * limit, data.pagination.total)}</span> of {data.pagination.total} records
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-xl transition-all border shadow-sm ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:border-blue-500 shadow-blue-100'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex gap-1.5">
                                {[...Array(data.pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all flex items-center justify-center shadow-sm ${page === i + 1 ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-white border hover:border-blue-500'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page === data.pagination.totalPages}
                                className={`p-2 rounded-xl transition-all border shadow-sm ${page === data.pagination.totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:border-blue-500 shadow-blue-100'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesReports;
