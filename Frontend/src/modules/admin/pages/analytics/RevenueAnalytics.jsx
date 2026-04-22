import React, { useState, useEffect, useCallback } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, ArrowUpRight, BarChart3, Wallet, CreditCard, RefreshCw, Loader2, IndianRupee, PieChart, Info } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getRevenueAnalytics } from '../../api/reportApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const RevenueAnalytics = () => {
    const { t } = useTranslation('admin_analytics');
    const { adminUser } = useAdminAuth();
    const [period, setPeriod] = useState('this_week');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const res = await getRevenueAnalytics(adminUser.token, { period });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            // toast.error(t('revenue.load_error', { defaultValue: 'Failed to load income data' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser, period, t]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
                <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest">Collecting Business Data...</p>
            </div>
        );
    }

    const { summary, chartData, dailyBreakdown } = data || { 
        summary: { totalNetSales: 0, salesGrowth: 0, totalRefunds: 0, vendorPayouts: 0, netProfit: 0, profitGrowth: 0 },
        chartData: [],
        dailyBreakdown: []
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('revenue.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.revenueAnalytics} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium opacity-70 uppercase tracking-tight">{t('revenue.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium text-slate-700 shadow-sm appearance-none cursor-pointer pr-10 min-w-[160px]"
                    >
                        <option value="this_week">{t('revenue.period.week', { defaultValue: 'This Week' })}</option>
                        <option value="this_month">{t('revenue.period.month', { defaultValue: 'This Month' })}</option>
                        <option value="last_month">{t('revenue.period.last_month', { defaultValue: 'Last Month' })}</option>
                        <option value="year_to_date">{t('revenue.period.ytd', { defaultValue: 'This Year' })}</option>
                    </select>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] whitespace-nowrap"
                    >
                        <Download size={16} />
                        <span>{t('sales.download', { ns: 'admin_reports' })}</span>
                    </button>
                    
                    <button
                        onClick={fetchAnalytics}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all shadow-sm active:scale-90"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t('revenue.stats.gross')}</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(summary.totalNetSales)}</h3>
                    </div>
                    <div className="relative z-10 flex items-center gap-1 text-[10px] font-bold mt-4">
                        {summary.salesGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{Math.abs(summary.salesGrowth)}%</span> Growth
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                            <CreditCard size={20} />
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Refunded Money</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(summary.totalRefunds)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                            <Wallet size={20} />
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{t('finance.earnings.paid')}</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(summary.vendorPayouts)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                            <IndianRupee size={20} />
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{t('revenue.stats.net')}</p>
                        <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.netProfit)}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold mt-2 ${summary.profitGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {summary.profitGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{Math.abs(summary.profitGrowth)}%</span>
                    </div>
                </div>
            </div>

            {/* Visual Progress Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <div>
                        <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">{t('revenue.title')} Progress</h5>
                        <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Performance tracking for current period</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-blue-600 rounded-full" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Growth Signal</span>
                    </div>
                </div>
                
                <div className="p-10">
                    <div className="w-full h-[400px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8', textTransform: 'uppercase'}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '1rem'}}
                                        labelStyle={{fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#1e293b'}}
                                        itemStyle={{fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'}}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#2563eb" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#revenueFill)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                                <BarChart3 size={64} strokeWidth={1} />
                                <p className="text-[10px] font-black uppercase tracking-widest">{t('revenue.no_data', { defaultValue: 'No business data detected' })}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">History Log</h5>
                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 italic">Verified Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">Activity Date</th>
                                <th className="px-6 py-5 text-center">Orders</th>
                                <th className="px-6 py-5">Total Sales</th>
                                <th className="px-6 py-5 text-rose-500">Returned</th>
                                <th className="px-8 py-5 text-right">Net Income</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                            {dailyBreakdown.length > 0 ? dailyBreakdown.map((day, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Calendar size={14} />
                                            </div>
                                            <span className="text-xs uppercase tracking-tight text-slate-700">{day.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600">
                                            {day.orders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-[11px] text-slate-500 uppercase">{formatCurrency(day.gross)}</td>
                                    <td className="px-6 py-5 text-[11px] text-rose-400 uppercase">{formatCurrency(day.refunds)}</td>
                                    <td className="px-8 py-5 text-right font-black text-blue-600 text-xs tracking-tight">
                                        {formatCurrency(day.net)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 text-[10px] font-black uppercase">{t('revenue.no_data')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;
