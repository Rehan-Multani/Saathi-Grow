import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, PieChart,
    ArrowUpRight, ArrowDownRight, Package,
    DollarSign, AlertTriangle, Download,
    Leaf, Apple, Milk, Croissant, ChevronRight,
    Loader2, ShoppingBag
} from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { getStrategicAnalytics } from '../admin/api/reportApi';
import Swal from 'sweetalert2';

const ReportsAnalytics = () => {
    const navigate = useNavigate();
    const { managerUser } = useStoreManagerAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!managerUser?.token) return;
        
        try {
            setLoading(true);
            setError(null);
            const res = await getStrategicAnalytics(managerUser.token);
            if (res.success) {
                setData(res);
            } else {
                setError(res.message || 'Failed to fetch analytics');
            }
        } catch (err) {
            console.error('Failed to fetch strategic analytics:', err);
            setError('Could not load branch analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [managerUser?.token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <Loader2 className="animate-spin mb-4 text-emerald-500" size={40} />
                <p className="text-xs font-black uppercase tracking-widest animate-pulse">Analyzing branch logistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 text-center p-6">
                <AlertTriangle className="mb-4 text-rose-500" size={48} />
                <h3 className="text-slate-800 font-bold mb-2">Analytics Unavailable</h3>
                <p className="text-xs mb-4 max-w-xs mx-auto">{error}</p>
                <button 
                    onClick={fetchData}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    const stats = [
        { label: 'Inventory Value', value: data ? `₹${data.summary.inventoryValue.toLocaleString()}` : '₹0', icon: 'DollarSign', color: 'bg-emerald-500', textColor: 'text-emerald-500', trend: 8.5, path: '/store-manager/inventory' },
        { label: 'Total SKU', value: data ? data.summary.totalSku.toString() : '0', icon: 'Package', color: 'bg-blue-600', textColor: 'text-blue-600', trend: 12.1, path: '/store-manager/inventory' },
        { label: 'Top Product', value: data ? data.summary.topProduct : 'N/A', icon: 'TrendingUp', color: 'bg-violet-600', textColor: 'text-violet-600', trend: 5.4, path: '/store-manager/inventory' },
        { label: 'Alerts', value: data ? data.summary.alerts.toString() : '0', icon: 'AlertTriangle', color: 'bg-amber-500', textColor: 'text-amber-500', trend: -2.3, path: '/store-manager/inventory' },
    ];

    const categoryIcons = {
        'Vegetables': Leaf,
        'Fruits': Apple,
        'Dairy': Milk,
        'Bakery': Croissant,
    };

    const categoryColors = {
        'Vegetables': 'bg-emerald-500',
        'Fruits': 'bg-orange-500',
        'Dairy': 'bg-blue-500',
        'Bakery': 'bg-amber-500',
    };

    const wastageData = data?.wastageData || [];
    const maxValue = wastageData.length > 0 ? Math.max(...wastageData.map(d => d.value)) : 1000;

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
                        {(data?.assetDistribution || []).map((cat) => {
                            const Icon = categoryIcons[cat.name] || Package;
                            const color = categoryColors[cat.name] || 'bg-slate-400';
                            return (
                                <div key={cat.name} className="space-y-1.5 group/item cursor-pointer" onClick={() => navigate('/store-manager/inventory')}>
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-2">
                                            <Icon size={12} className="text-slate-400" />
                                            <span className="text-[11px] font-semibold text-slate-600">{cat.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-800">{cat.value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${color} rounded-full transition-all duration-1000 group-hover/item:brightness-110`}
                                            style={{ width: `${cat.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
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
                        {(data?.topMovingAssets || []).map((product, i) => (
                            <div
                                key={i}
                                onClick={() => navigate('/store-manager/inventory')}
                                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-lg transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                                        0{product.image ? <img src={product.image} className="w-full h-full object-cover rounded-lg" /> : i + 1}
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
                        {(!data?.topMovingAssets || data.topMovingAssets.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <ShoppingBag className="mb-2 opacity-20" size={32} />
                                <p className="text-[10px] font-bold uppercase tracking-widest">No Sales Data Yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Leakage & Wastage Analysis - Professional Redesign */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/20">
                                <AlertTriangle size={14} />
                            </div>
                            <h3 className="font-bold text-white text-lg tracking-tight">Leakage & Wastage Analysis</h3>
                        </div>
                        <p className="text-slate-400 text-[11px]">Quantifying fiscal loss due to expiration, damage, or logistical errors.</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
                        Historical Trend
                    </div>
                </div>

                <div className="h-[200px] flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2 border-b border-slate-800/50 relative z-10">
                    {wastageData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Bar Container */}
                            <div className="w-full bg-slate-800/40 rounded-t-sm h-full absolute bottom-0"></div>

                            {/* Interactive Bar */}
                            <div
                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-50 group-hover:to-emerald-300 transition-all duration-300 rounded-t-sm relative z-10 shadow-lg"
                                style={{ height: `${maxValue > 0 ? (d.value / maxValue) * 100 : 0}%` }}
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
