import React, { useEffect, useState, useMemo } from 'react';
import { 
    Package, 
    ShoppingBag, 
    Clock, 
    Wallet, 
    TrendingUp, 
    AlertTriangle, 
    ChevronRight, 
    Zap,
    LayoutGrid,
    ArrowRight,
    Monitor,
    Activity,
    ShieldCheck,
    Store,
    Plus,
    ArrowUpRight,
    DollarSign,
    Headphones
} from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryCard = ({ label, value, icon: Icon, color, trend, path, onClick }) => {
    const navigate = useNavigate();
    const hasTrend = typeof trend === 'number' && !isNaN(trend) && trend !== 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => path ? navigate(path) : onClick?.()}
            className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group ${ (path || onClick) ? 'cursor-pointer hover:border-[#0c831f]/30' : 'cursor-default'}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-slate-200 group-hover:scale-110 shadow-sm border border-slate-200/50">
                    <Icon size={20} className="text-slate-600 group-hover:text-slate-900 transition-colors" />
                </div>
                
                {hasTrend && (
                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { 
        vendor, 
        dashboardData, 
        fetchDashboardStats, 
        refreshProfile
    } = useVendor();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            await fetchDashboardStats();
            setLoading(false);
        };
        initDashboard();
    }, []);

    const { stats, analytics, recentOrders, inventoryAlerts } = dashboardData || {};

    const authorizedStats = useMemo(() => {
        if (!stats) return [];
        return [
            {
                label: 'Total Earnings',
                value: formatCurrency(stats.totalEarnings),
                icon: Wallet,
                path: '/vendor/earnings'
            },
            {
                label: 'Wallet Balance',
                value: formatCurrency(stats.balance),
                icon: DollarSign,
                path: '/vendor/earnings'
            },
            {
                label: 'Total Orders',
                value: stats.totalOrders?.toLocaleString() || '0',
                icon: ShoppingBag,
                path: '/vendor/orders'
            },
            {
                label: 'Active Products',
                value: stats.totalProducts?.toLocaleString() || '0',
                icon: Package,
                path: '/vendor/products'
            },
            {
                label: 'Pending Orders',
                value: stats.pendingOrders?.toLocaleString() || '0',
                icon: Clock,
                path: '/vendor/orders?status=pending'
            },
            {
                label: 'Pending Returns',
                value: stats.pendingReturns?.toLocaleString() || '0',
                icon: Activity,
                path: '/vendor/return-requests'
            },
            {
                label: 'Support Tickets',
                value: stats.pendingTickets?.toLocaleString() || '0',
                icon: Headphones,
                path: '/vendor/support-tickets'
            }
        ];
    }, [stats]);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-[#0c831f] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Store size={24} className="text-[#0c831f] animate-pulse" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest animate-pulse">Syncing Portal</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Authenticating Vendor Stream</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#0c831f] rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-200">
                            <Store size={18} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {vendor?.shopName || 'Vendor Console'}
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        Management Hub <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                        {vendor?.ownerName || 'Direct Account'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/vendor/products/add')}
                        className="bg-[#0c831f] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0a6b19] transition-all shadow-xl shadow-green-900/10 active:scale-95"
                    >
                        <Plus size={16} />
                        Launch Product
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {authorizedStats.map((stat, i) => (
                    <SummaryCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Sales Performance Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <div className="p-1.5 bg-green-50 text-[#0c831f] rounded-lg">
                                        <TrendingUp size={14} />
                                    </div>
                                    Sales Velocity (Last 7 Days)
                                </h3>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Order Volume & Revenue</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#0c831f]"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Revenue</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics || []}>
                                    <defs>
                                        <linearGradient id="vendorColorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0c831f" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#0c831f" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                                        labelStyle={{fontWeight: 900, marginBottom: '4px', fontSize: '10px', color: '#64748b'}}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#0c831f" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#vendorColorRevenue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Critical Transactions */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                    <Zap size={14} />
                                </div>
                                Recent Order Activity
                            </h3>
                            <button onClick={() => navigate('/vendor/orders')} className="text-[#0c831f] text-[10px] font-black uppercase tracking-widest hover:text-[#0a6b19]">Audit All</button>
                        </div>
                        <div className="space-y-3">
                            {(recentOrders || []).map((order, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-[#0c831f] shadow-sm transition-all font-black text-xs">
                                            #{order.orderId?.slice(-4) || '....'}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-800">{order.customer || 'Guest'}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                {order.itemsCount} Items <span className="mx-1">·</span> 
                                                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-slate-900">{formatCurrency(order.amount)}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                                            order.status === 'delivered' ? 'text-emerald-500' : 
                                            order.status === 'confirmed' ? 'text-green-500' : 'text-amber-500'
                                        }`}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                            {(!recentOrders || recentOrders.length === 0) && (
                                <div className="text-center py-10">
                                    <ShoppingBag size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic opacity-50">No Activity Yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scope Actions Sidebar */}
                <div className="space-y-8">
                    
                    {/* Action Panel */}
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0c831f]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                            <LayoutGrid size={16} className="text-green-400" />
                            Quick Operations
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <button onClick={() => navigate('/vendor/products/add')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/item">
                                <span className="text-xs font-bold text-white/90">Add New Product</span>
                                <Plus size={14} className="text-white/40 group-hover/item:text-[#0c831f]" />
                            </button>
                            <button onClick={() => navigate('/vendor/earnings')} className="w-full flex items-center justify-between p-4 bg-[#0c831f] hover:bg-[#0a6b19] rounded-2xl transition-all shadow-lg active:scale-95">
                                <span className="text-xs font-black uppercase tracking-wider text-white">Withdraw Earnings</span>
                                <ArrowUpRight size={14} className="text-white/70" />
                            </button>
                        </div>
                    </div>

                    {/* Inventory Alerts */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                                    <AlertTriangle size={14} />
                                </div>
                                Inventory Alerts
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            {(inventoryAlerts || []).map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                        {prod.image ? (
                                            <img src={prod.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Package size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-800 truncate">{prod.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${prod.stock <= 5 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${(prod.stock / 20) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900">{prod.stock} left</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/vendor/products/edit/${prod.id}`)}
                                        className="p-2 text-slate-300 hover:text-[#0c831f] transition-colors"
                                    >
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                            {(!inventoryAlerts || inventoryAlerts.length === 0) && (
                                <div className="text-center py-6">
                                    <ShieldCheck size={24} className="mx-auto text-emerald-100 mb-2" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Stock Levels Stable</p>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => navigate('/vendor/stock')}
                            className="w-full mt-6 py-3 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-[#0c831f] hover:bg-slate-50 transition-all"
                        >
                            Refill Inventory
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
