import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './components/SummaryCards';
import * as Icons from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { getDashboardStats } from '../admin/api/adminApi';

const StoreManagerDashboard = () => {
    const { managerUser } = useStoreManagerAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Permissions check helper
    const hasPermission = (permission) => {
        if (!managerUser) return false;
        if (managerUser.role === 'Admin') return true;
        return managerUser.permissions?.includes(permission);
    };

    useEffect(() => {
        const fetchStats = async () => {
            if (!managerUser?.token) return;
            try {
                setLoading(true);
                const data = await getDashboardStats(managerUser.token);
                if (data.success) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching manager dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [managerUser?.token]);

    const { stats: apiStats, recentOrders: apiOrders, revenueData: apiRevenueData } = stats || {};

    // 1. Dynamic Summary stats based on permissions
    const authorizedStats = useMemo(() => {
        const allStats = [];

        // Financial Data - Requires MANAGE_POS_BILLING
        if (hasPermission('MANAGE_POS_BILLING')) {
            const revenue = apiStats?.totalRevenue;
            allStats.push({ 
                label: 'Total Revenue', 
                value: (revenue !== undefined && revenue !== null) ? `₹${revenue.toLocaleString()}` : '0.00', 
                icon: 'IndianRupee', 
                color: 'bg-emerald-500', 
                textColor: 'text-emerald-500', 
                trend: apiStats?.revenueGrowth || 0,
                path: '/store-manager/reports' 
            });
        }

        // Order Operations - Requires VIEW_ORDERS
        if (hasPermission('VIEW_ORDERS')) {
            const totalOrders = apiStats?.totalOrders;
            allStats.push({ 
                label: 'Total Orders', 
                value: (totalOrders !== undefined && totalOrders !== null) ? totalOrders.toLocaleString() : '0', 
                icon: 'ShoppingCart', 
                color: 'bg-blue-500', 
                textColor: 'text-blue-500', 
                trend: apiStats?.orderGrowth || 0,
                path: '/store-manager/orders' 
            });
            
            const pendingOrders = apiStats?.pendingOrders;
            allStats.push({ 
                label: 'Pending Focus', 
                value: (pendingOrders !== undefined && pendingOrders !== null) ? pendingOrders.toLocaleString() : '0', 
                icon: 'Clock', 
                color: 'bg-amber-500', 
                textColor: 'text-amber-500', 
                path: '/store-manager/orders?status=pending' 
            });
        }

        // Inventory - Requires MANAGE_INVENTORY
        if (hasPermission('MANAGE_INVENTORY')) {
            const lowStock = apiStats?.lowStockCount;
            allStats.push({ 
                label: 'Low Stock Alerts', 
                value: (lowStock !== undefined && lowStock !== null) ? lowStock.toLocaleString() : '0', 
                icon: 'AlertTriangle', 
                color: 'bg-rose-500', 
                textColor: 'text-rose-500', 
                path: '/store-manager/inventory' 
            });
        }

        // Customer Service - (Assumed permission or role based)
        const tickets = apiStats?.pendingTickets;
        allStats.push({ 
            label: 'Support Tickets', 
            value: (tickets !== undefined && tickets !== null) ? tickets : 0, 
            icon: 'Headphones', 
            color: 'bg-violet-500', 
            textColor: 'text-violet-500', 
            path: '/store-manager/support' 
        });

        return allStats;
    }, [apiStats, managerUser]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent shadow-sm"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Initializing Portal...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Branch Command Center</h2>
                    <p className="text-slate-500 text-xs">Dynamic oversight based on your administrative scope.</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Branch: {managerUser?.branchId ? 'Scoped' : 'Global Admin'}</span>
                </div>
            </div>

            {/* Stats Grid - Dynamically filtered by permissions */}
            <SummaryCards stats={authorizedStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Operations Area */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Revenue Trend - Requires MANAGE_POS_BILLING */}
                    {hasPermission('MANAGE_POS_BILLING') && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <Icons.TrendingUp size={14} />
                                        </div>
                                        Order Performance (Last 7 Days)
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Transaction Velocity</p>
                                </div>
                            </div>

                            <div className="h-[240px] flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-50 relative">
                                {apiRevenueData?.map((data, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                                            <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl font-bold whitespace-nowrap">
                                                ₹{(data.revenue || 0).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="w-full bg-slate-50/50 group-hover:bg-blue-50/50 transition-all rounded-t-lg relative h-full flex flex-col justify-end overflow-hidden">
                                            <div
                                                className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-lg relative"
                                                style={{
                                                    height: `${(data.orders / (Math.max(...(apiRevenueData || []).map(d => d.orders)) || 1)) * 100}%`,
                                                    minHeight: '6px'
                                                }}
                                            >
                                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20"></div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-bold mt-3 uppercase">
                                            {data.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Critical Transactions - Requires VIEW_ORDERS */}
                    {hasPermission('VIEW_ORDERS') && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Icons.Zap size={14} />
                                    </div>
                                    Active Transaction Ticker
                                </h3>
                                <button onClick={() => navigate('/store-manager/orders')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-700">Audit All</button>
                            </div>
                            <div className="space-y-2">
                                {apiOrders?.map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 shadow-sm transition-all font-black text-xs">
                                                #{order.id ? order.id.toString().slice(-4) : '....'}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-800">{order.customer || 'Guest'}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{order.date ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-slate-900">₹{(order.amount || 0).toFixed(2)}</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'text-emerald-500' : 'text-blue-500'}`}>{order.status || 'pending'}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!apiOrders || apiOrders.length === 0) && (
                                    <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest italic opacity-50">No Active Traffic</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Scope Actions Sidebar */}
                <div className="space-y-6">
                    {/* Dynamic Action Panel */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                            <Icons.LayoutGrid size={16} className="text-blue-400" />
                            Operational Quick-Links
                        </h3>
                        <div className="space-y-3 relative z-10">
                            {hasPermission('MANAGE_INVENTORY') && (
                                <button onClick={() => navigate('/store-manager/inventory')} className="w-full flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group/item">
                                    <span className="text-xs font-bold text-white/90">Inventory Command</span>
                                    <Icons.ArrowRight size={14} className="text-white/40 group-hover/item:translate-x-1 group-hover/item:text-blue-400 transition-all" />
                                </button>
                            )}
                            {hasPermission('MANAGE_POS_BILLING') && (
                                <button onClick={() => navigate('/store-manager/pos')} className="w-full flex items-center justify-between p-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg active:scale-95">
                                    <span className="text-xs font-black uppercase tracking-wider text-white">Lauch POS Terminal</span>
                                    <Icons.Monitor size={14} className="text-white/70" />
                                </button>
                            )}
                            {!hasPermission('MANAGE_POS_BILLING') && !hasPermission('MANAGE_INVENTORY') && (
                                <p className="text-[10px] text-white/50 italic text-center py-4">Administrative actions restricted to your current role.</p>
                            )}
                        </div>
                    </div>

                    {/* Team Health - Visible to Branch Managers */}
                    {managerUser?.role === 'Branch Manager' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Icons.Activity size={16} />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Branch Integrity</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Staff Operations</p>
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between mb-4">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Normal</h3>
                                <div className="text-emerald-500 flex items-center gap-1 mb-1">
                                    <Icons.ShieldCheck size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Stable</span>
                                </div>
                            </div>

                            <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full w-[100%] shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreManagerDashboard;
