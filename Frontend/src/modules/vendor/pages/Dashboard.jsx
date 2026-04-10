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
    Headphones,
    Target
} from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../../../common/utils/formatUtils';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

const Dashboard = () => {
    const { 
        vendor, 
        dashboardData, 
        fetchDashboardStats
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
            { label: 'Merchant Assets', value: formatCurrency(stats.totalEarnings), icon: Wallet, color: '#3b82f6', desc: 'Total Cumulative Revenue' },
            { label: 'Available Credit', value: formatCurrency(stats.balance), icon: DollarSign, color: '#10b981', desc: 'Withdrawable Funds' },
            { label: 'Trade Volume', value: stats.totalOrders?.toLocaleString() || '0', icon: ShoppingBag, color: '#8b5cf6', desc: 'Total Success Dispatches' },
            { label: 'SKU Portfolio', value: stats.totalProducts?.toLocaleString() || '0', icon: Package, color: '#f59e0b', desc: 'Live Product Intelligence' },
            { label: 'Ops Pending', value: stats.pendingOrders?.toLocaleString() || '0', icon: Clock, color: '#f43f5e', desc: 'Action Required Node' }
        ];
    }, [stats]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader-ring">
                    <Store size={32} className="pulsing-logo" />
                </div>
                <p>Establishing Secondary merchant Node link...</p>
                <style dangerouslySetInnerHTML={{ __html: `
                    .dashboard-loading { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; background: #fff; }
                    .loader-ring { width: 80px; height: 80px; border: 4px solid #f1f5f9; border-top-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: spin 1s linear infinite; position: relative; }
                    .pulsing-logo { color: #3b82f6; animation: pulse 1.5s ease-in-out infinite; }
                    .dashboard-loading p { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
                `}} />
            </div>
        );
    }

    return (
        <div className="vendor-dashboard-portal p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
                <div className="portal-header-text">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="status-badge bg-emerald-50 text-emerald-600 border border-emerald-100">
                             <Activity size={12} className="animate-pulse" />
                             <span>Merchant Stream: Secured</span>
                        </div>
                        <div className="status-badge bg-blue-50 text-blue-600 border border-blue-100">
                            <ShieldCheck size={12} />
                            <span>Protocol v2.4</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-16 bg-blue-600 rounded-full"></div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                                {vendor?.shopName || 'Merchant Console'}
                            </h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{vendor?.ownerName || 'Direct Control Account'} · Global Market Reach</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button 
                        onClick={() => navigate('/vendor/products/add')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={18} /> Deploy SKU Asset
                    </button>
                </div>
            </div>

            {/* KPI Registry */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
                {authorizedStats.map((stat, i) => (
                    <div key={i} className="kpi-block border border-slate-100 p-6 rounded-[2rem] bg-white group hover:-translate-y-2 transition-all cursor-default">
                        <div className="flex items-center justify-between mb-8">
                            <div className="icon-portal" style={{ background: stat.color + '15', color: stat.color }}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <ArrowUpRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <div className="block-footer mt-6 pt-6 border-t border-slate-50 flex items-center gap-2">
                             <Zap size={10} className="text-amber-400" />
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{stat.desc}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Visual Intelligence Area */}
                <div className="lg:col-span-2 chart-card p-8 rounded-[3rem] bg-white border border-slate-100">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Financial Velocity</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Flow Analytics (Real-time)</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">
                            <Activity size={14} className="text-emerald-500" /> Live Data
                        </div>
                    </div>

                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics || []}>
                                <defs>
                                    <linearGradient id="vendorColorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                                    tickFormatter={(v) => `₹${v/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px'}}
                                    itemStyle={{fontSize: '12px', fontWeight: '900', textTransform: 'uppercase'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    fill="url(#vendorColorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations Sidebar */}
                <div className="space-y-8">
                    {/* Quick Launch Console */}
                    <div className="action-console p-8 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <h4 className="text-sm font-black uppercase tracking-widest opacity-60 mb-8">Protocol Actions</h4>
                        <div className="space-y-4 relative z-10">
                            <button onClick={() => navigate('/vendor/products/add')} className="action-button bg-white/5 hover:bg-white/10 border border-white/10">
                                <span>Deploy SKU</span>
                                <Plus size={16} />
                            </button>
                            <button onClick={() => navigate('/vendor/pos')} className="action-button bg-blue-600 hover:bg-blue-700 border border-blue-500 shadow-xl shadow-blue-500/20">
                                <span>Terminal POS</span>
                                <Monitor size={16} />
                            </button>
                            <button onClick={() => navigate('/vendor/earnings')} className="action-button bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 shadow-xl shadow-emerald-500/20">
                                <span>Liquidity Sync</span>
                                <Wallet size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Stock Intelligence */}
                    <div className="alert-panel p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex justify-between items-center mb-8">
                             <h4 className="text-sm font-black text-slate-900 tracking-tight">Stock Warnings</h4>
                             <AlertTriangle size={18} className="text-rose-500" />
                        </div>
                        <div className="space-y-4">
                            {(inventoryAlerts || []).map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/vendor/products/edit/${prod.id}`)}>
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-all">
                                        {prod.image ? <img src={prod.image} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-slate-200" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-slate-900 truncate mb-1">{prod.name}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]" style={{ width: `${Math.min(100, (prod.stock/20)*100)}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900">{prod.stock} Units</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!inventoryAlerts || inventoryAlerts.length === 0) && (
                                <div className="text-center py-8">
                                    <ShieldCheck size={32} className="mx-auto text-emerald-100 mb-2" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Logistics Stable</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transaction Log */}
            <div className="ledger-card bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Recent Dispatches</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Transaction Ledger</p>
                    </div>
                    <button onClick={() => navigate('/vendor/orders')} className="view-link group">
                        <span>Registry Archive</span>
                        <ArrowUpRight size={16} />
                    </button>
                </div>
                
                <div className="p-4 space-y-2">
                    {(recentOrders || []).map((order, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 hover:bg-slate-50/80 rounded-[2rem] transition-all cursor-pointer border border-transparent hover:border-slate-100 group">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xs shadow-sm group-hover:text-blue-600 transition-colors">
                                    #{order.orderId?.slice(-4)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{order.customer || 'Digital Entity'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.itemsCount} SKU Deployment</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-slate-900">{formatCurrency(order.amount)}</p>
                                <div className={`status-dot ${order.status}`}>
                                    <div className="dot"></div>
                                    <span>{order.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .vendor-dashboard-portal { background: #fdfdff; min-height: 100vh; position: relative; overflow-x: hidden; }
                
                .status-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10rem; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
                
                .kpi-block { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
                .kpi-block .icon-portal { width: 56px; height: 56px; border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; }
                .kpi-block:hover .icon-portal { transform: scale(1.1) rotate(-5deg); }
                
                .action-console { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); }
                .action-button { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 1.5rem; font-size: 11px; font-weight: 900; text-transform: uppercase; tracking: 0.1em; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .action-button:hover { transform: translateX(8px); }
                
                .view-link { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; }
                
                .status-dot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
                .status-dot .dot { width: 6px; height: 6px; border-radius: 50%; }
                .status-dot.delivered { color: #10b981; } .status-dot.delivered .dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
                .status-dot.confirmed { color: #3b82f6; } .status-dot.confirmed .dot { background: #3b82f6; }
                .status-dot.pending { color: #f59e0b; } .status-dot.pending .dot { background: #f59e0b; animate: pulse-yellow 2s infinite; }
                
                @keyframes pulse-yellow { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10rem; }
            `}} />
        </div>
    );
};

export default Dashboard;
