import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, PieChart,
    ArrowUpRight, ArrowDownRight, Package,
    DollarSign, AlertTriangle, Download,
    Leaf, Apple, Milk, Croissant, ChevronRight,
    Loader2, ShoppingBag, BarChart3, TrendingDown,
    AlertCircle
} from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { getStrategicAnalytics } from '../../common/api/reportApi';
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
            console.error('Failed to fetch analytics:', err);
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
                <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 text-center p-6 bg-white rounded-3xl border border-slate-200 m-6">
                <AlertCircle className="mb-4 text-red-500" size={48} />
                <h3 className="text-slate-800 font-bold mb-2 text-lg">Analytics Unavailable</h3>
                <p className="text-sm font-medium mb-6 max-w-xs mx-auto text-slate-500">{error}</p>
                <button 
                    onClick={fetchData}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const stats = [
        { label: 'Inventory Value', value: data ? `₹${data.summary.inventoryValue.toLocaleString()}` : '₹0', icon: 'DollarSign', color: 'bg-emerald-500', textColor: 'text-emerald-500', trend: 8.5, path: '/store-manager/inventory' },
        { label: 'Product Range', value: data ? data.summary.totalSku.toString() : '0', icon: 'Package', color: 'bg-blue-600', textColor: 'text-blue-600', trend: 12.1, path: '/store-manager/inventory' },
        { label: 'Bestseller', value: data ? data.summary.topProduct : 'N/A', icon: 'TrendingUp', color: 'bg-violet-600', textColor: 'text-violet-600', trend: 5.4, path: '/store-manager/inventory' },
        { label: 'Active Alerts', value: data ? data.summary.alerts.toString() : '0', icon: 'AlertTriangle', color: 'bg-amber-500', textColor: 'text-amber-500', trend: -2.3, path: '/store-manager/inventory' },
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
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Review stock efficiency and sales performance trends.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">
                    <Download size={16} /> Export Report
                </button>
            </div>

            <SummaryCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Category Breakdown</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Stock Distribution</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <PieChart size={20} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {(data?.assetDistribution || []).map((cat) => {
                            const Icon = categoryIcons[cat.name] || Package;
                            const color = categoryColors[cat.name] || 'bg-slate-400';
                            return (
                                <div key={cat.name} className="space-y-2 group/item cursor-pointer" onClick={() => navigate('/store-manager/inventory')}>
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
                                                <Icon size={12} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{cat.value}%</span>
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

                {/* Top Performing Products */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Best Sellers</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top Moving Products</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(data?.topMovingAssets || []).map((product, i) => (
                            <div
                                key={i}
                                onClick={() => navigate('/store-manager/inventory')}
                                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-2xl transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:border-blue-300 transition-colors">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={18} className="opacity-30" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate uppercase">{product.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{product.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-sm font-black text-slate-900">{product.sales} Sold</p>
                                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.growth > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {Math.abs(product.growth)}%
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all shrink-0" />
                                </div>
                            </div>
                        ))}
                        {(!data?.topMovingAssets || data.topMovingAssets.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <ShoppingBag className="mb-3 opacity-20" size={40} />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Sales Recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Waste & Expiry Trends */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 relative z-10">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Waste & Expiry Trends</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider">Monthly loss reports</p>
                    </div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        <TrendingDown size={20} />
                    </div>
                </div>

                <div className="h-[240px] flex items-end justify-between gap-3 px-2 pb-4 border-b border-slate-100 relative z-10">
                    {wastageData.length > 0 ? wastageData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Bar Backshadow */}
                            <div className="w-full bg-slate-50 rounded-t-xl h-full absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Main Bar */}
                            <div
                                className="w-full max-w-[40px] bg-red-500 rounded-t-xl hover:bg-red-600 transition-all duration-300 relative z-10 shadow-sm"
                                style={{ height: `${maxValue > 0 ? (d.value / maxValue) * 100 : 0}%` }}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap font-bold z-20">
                                    ₹{d.value.toLocaleString()} Loss
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BarChart3 size={48} className="text-slate-100" />
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-6 px-1 relative z-10">
                    {wastageData.map(d => (
                        <span key={d.month} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{d.month}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsAnalytics;
