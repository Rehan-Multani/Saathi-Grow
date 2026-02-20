import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, TrendingUp, PieChart,
    ArrowUpRight, ArrowDownRight, Package,
    DollarSign, AlertTriangle, Download,
    Leaf, Apple, Milk, Croissant, ChevronRight
} from 'lucide-react';
import SummaryCards from './components/SummaryCards';

const ReportsAnalytics = () => {
    const navigate = useNavigate();

    const stats = [
        { label: 'Inventory Value', value: '₹4,85,200', icon: 'DollarSign', color: 'bg-emerald-500', textColor: 'text-emerald-500', trend: 8.5, path: '/store-manager/inventory' },
        { label: 'Total SKU', value: '3,450', icon: 'Package', color: 'bg-blue-600', textColor: 'text-blue-600', trend: 12.1, path: '/store-manager/inventory' },
        { label: 'Top Product', value: 'Cow Milk', icon: 'TrendingUp', color: 'bg-violet-600', textColor: 'text-violet-600', trend: 5.4, path: '/store-manager/inventory' },
        { label: 'Alerts', value: '14', icon: 'AlertTriangle', color: 'bg-amber-500', textColor: 'text-amber-500', trend: -2.3, path: '/store-manager/inventory' },
    ];

    const topProducts = [
        { name: 'Cow Milk 1L', sales: 450, growth: 12, category: 'Dairy' },
        { name: 'Organic Tomatoes', sales: 320, growth: 8, category: 'Vegetables' },
        { name: 'Farm Fresh Eggs', sales: 280, growth: 15, category: 'Dairy' },
        { name: 'Whole Wheat Bread', sales: 210, growth: -3, category: 'Bakery' },
        { name: 'Greek Yogurt', sales: 150, growth: 5, category: 'Dairy' },
    ];

    const wastageData = [
        { month: 'Jan', value: 2000 },
        { month: 'Feb', value: 3500 },
        { month: 'Mar', value: 1500 },
        { month: 'Apr', value: 6000 },
        { month: 'May', value: 4000 },
        { month: 'Jun', value: 2500 },
        { month: 'Jul', value: 4500 },
        { month: 'Aug', value: 3000 },
        { month: 'Sep', value: 5000 },
        { month: 'Oct', value: 2000 },
        { month: 'Nov', value: 1000 },
        { month: 'Dec', value: 3000 },
    ];

    const maxValue = Math.max(...wastageData.map(d => d.value));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        Strategic Analytics
                    </h2>
                    <p className="text-slate-500 text-xs">High-fidelity analysis of stock logistics and financial exposure.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm uppercase tracking-wider active:scale-95">
                    <Download size={14} /> Export Report
                </button>
            </div>

            <SummaryCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Distribution */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 tracking-tight">
                            <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600">
                                <PieChart size={14} />
                            </div>
                            Asset Distribution
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">BY CATEGORY</span>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Vegetables', value: 45, color: 'bg-emerald-500', icon: Leaf },
                            { name: 'Fruits', value: 25, color: 'bg-orange-500', icon: Apple },
                            { name: 'Dairy', value: 15, color: 'bg-blue-500', icon: Milk },
                            { name: 'Bakery', value: 10, color: 'bg-amber-500', icon: Croissant },
                            { name: 'Others', value: 5, color: 'bg-slate-400', icon: Package },
                        ].map((cat) => (
                            <div key={cat.name} className="space-y-1.5 group/item cursor-pointer" onClick={() => navigate('/store-manager/inventory')}>
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <cat.icon size={12} className="text-slate-400" />
                                        <span className="text-[11px] font-semibold text-slate-600">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-800">{cat.value}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${cat.color} rounded-full transition-all duration-1000 group-hover/item:brightness-110`}
                                        style={{ width: `${cat.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High Velocity Assets */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 tracking-tight">
                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                <TrendingUp size={14} />
                            </div>
                            Top Moving Assets
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">REAL-TIME</span>
                    </div>

                    <div className="space-y-2">
                        {topProducts.map((product, i) => (
                            <div
                                key={i}
                                onClick={() => navigate('/store-manager/inventory')}
                                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-lg transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-800">{product.name}</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-medium">{product.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-slate-800">{product.sales} Units</p>
                                        <div className={`flex items-center justify-end gap-0.5 text-[9px] font-bold ${product.growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {product.growth > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {Math.abs(product.growth)}%
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leakage & Wastage Analysis - Professional Redesign */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/20">
                                <AlertTriangle size={14} />
                            </div>
                            <h3 className="font-bold text-white text-lg tracking-tight">Leakage & Wastage Analysis</h3>
                        </div>
                        <p className="text-slate-400 text-[11px]">Quantifying fiscal loss due to expiration, damage, or logistical errors.</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-blue-500/20">
                        Efficiency Optimized: 92%
                    </div>
                </div>

                <div className="h-[200px] flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2 border-b border-slate-800/50 relative z-10">
                    {wastageData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Bar Container */}
                            <div className="w-full bg-slate-800/40 rounded-t-sm h-full absolute bottom-0"></div>

                            {/* Interactive Bar */}
                            <div
                                className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all duration-300 rounded-t-sm relative z-10 shadow-lg"
                                style={{ height: `${(d.value / maxValue) * 100}%` }}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[9px] py-1 px-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap font-bold z-20">
                                    ₹{d.value.toLocaleString()} Loss
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4 px-1 relative z-10">
                    {wastageData.map(d => (
                        <span key={d.month} className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{d.month}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsAnalytics;
