import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './components/SummaryCards';
import * as Icons from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { getDashboardStats } from '../../common/api/adminApi';

const StoreManagerDashboard = () => {
    const { managerUser } = useStoreManagerAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const hasPermission = (permission) => {
        if (!managerUser) return false;
        if (managerUser.role === 'Admin' || managerUser.role === 'Branch Manager') return true;
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
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [managerUser?.token]);

    const { stats: apiStats, recentOrders: apiOrders, revenueData: apiRevenueData } = stats || {};

    const authorizedStats = useMemo(() => {
        const allStats = [];

        if (hasPermission('MANAGE_POS_BILLING')) {
            const revenue = apiStats?.totalRevenue;
            allStats.push({ 
                label: 'Total Revenue', 
                value: (revenue !== undefined && revenue !== null) ? `₹${revenue.toLocaleString()}` : '0', 
                icon: 'DollarSign', 
                trend: apiStats?.revenueGrowth || 0,
                path: '/store-manager/reports' 
            });
        }

        if (hasPermission('VIEW_ORDERS')) {
            const totalOrders = apiStats?.totalOrders;
            allStats.push({ 
                label: 'Total Orders', 
                value: (totalOrders !== undefined && totalOrders !== null) ? totalOrders.toLocaleString() : '0', 
                icon: 'ShoppingCart', 
                trend: apiStats?.orderGrowth || 0,
                path: '/store-manager/orders' 
            });
            
            const pendingOrders = apiStats?.pendingOrders;
            allStats.push({ 
                label: 'Pending Orders', 
                value: (pendingOrders !== undefined && pendingOrders !== null) ? pendingOrders.toLocaleString() : '0', 
                icon: 'Clock', 
                path: '/store-manager/orders?status=pending' 
            });
        }

        const tickets = apiStats?.pendingTickets;
        allStats.push({ 
            label: 'Open Tickets', 
            value: (tickets !== undefined && tickets !== null) ? tickets : 0, 
            icon: 'MessageCircle', 
            path: '/store-manager/support' 
        });

        return allStats;
    }, [apiStats, managerUser]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Icons.Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Overview of your store's recent activity.</p>
                </div>

                <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{managerUser?.role}: {managerUser?.branchId?.name || 'Main Store'}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <SummaryCards stats={authorizedStats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Order Performance */}
                <div className="lg:col-span-8 space-y-8">
                    {hasPermission('MANAGE_POS_BILLING') && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Sales Performance</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sales from the last 7 days</p>
                                </div>
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Icons.BarChart3 size={20} />
                                </div>
                            </div>

                            <div className="h-[250px] flex items-end justify-between gap-3 px-2 pb-4 border-b border-slate-100 relative">
                                {apiRevenueData?.map((data, i) => {
                                    const maxOrders = Math.max(...(apiRevenueData || []).map(d => d.orders)) || 1;
                                    const heightPercentage = (data.orders / maxOrders) * 100;
                                    
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 whitespace-nowrap pointer-events-none z-10 group-hover:-translate-y-1 transition-transform">
                                                ₹{data.revenue >= 1000 ? (data.revenue / 1000).toFixed(1) + 'k' : (data.revenue || 0)}
                                            </div>

                                            <div className="w-full max-w-[40px] bg-slate-100 group-hover:bg-slate-200/50 transition-all rounded-t-xl relative h-full flex flex-col justify-end overflow-hidden">
                                                <div
                                                    className="w-full bg-blue-600 group-hover:bg-blue-700 transition-all rounded-t-xl relative shadow-sm"
                                                    style={{ height: `${heightPercentage}%`, minHeight: '8px' }}
                                                >
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold mt-4 tracking-tighter uppercase">
                                                {data.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recent Orders */}
                    {hasPermission('VIEW_ORDERS') && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Recent Orders</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Latest orders received</p>
                                </div>
                                <button onClick={() => navigate('/store-manager/orders')} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline hover:text-blue-700 flex items-center gap-1.5">
                                    View All <Icons.ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/30 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 font-black">User</th>
                                            <th className="px-6 py-4 text-center font-black">Amount</th>
                                            <th className="px-6 py-4 text-right font-black">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {apiOrders?.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/10 transition-all group cursor-pointer" onClick={() => navigate('/store-manager/orders')}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md group-hover:scale-105 group-hover:bg-blue-600 transition-all duration-300 shrink-0 italic">
                                                            {(order.customer || 'Guest').charAt(0)}
                                                        </div>
                                                        <div className="text-left font-black">
                                                            <div className="font-bold text-slate-900 text-xs uppercase tracking-tight leading-none text-left">{order.customer || 'Guest'}</div>
                                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 leading-none text-left">Ref: #{order.orderId || order.id || order._id}</div>
                                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                                <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[8px] font-black px-1 py-0.5 rounded uppercase leading-none">
                                                                    {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                                                                </span>
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                                                                    {order.date ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-black text-slate-900 text-sm italic tracking-tight">₹{(order.amount || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex px-3 py-1.5 rounded-[1.1rem] text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-500/5 px-4' :
                                                        order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-500/5' :
                                                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-500/5' :
                                                        order.status === 'returned' || order.status === 'return_picked_up' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-500/5' :
                                                        'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-500/5'
                                                    }`}>
                                                        {order.status || 'pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!apiOrders || apiOrders.length === 0) && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center opacity-30 mx-auto">
                                                        <Icons.Inbox size={32} className="mb-4 text-slate-200" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">No Recent Sales Data</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-3">
                            <Icons.Zap size={20} className="text-blue-400" />
                            Quick Actions
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {hasPermission('MANAGE_POS_BILLING') && (
                                <button onClick={() => navigate('/store-manager/pos-billing')} className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg active:scale-95 group/btn">
                                    <span className="text-sm font-bold uppercase tracking-widest">New POS Sale</span>
                                    <Icons.Monitor size={18} className="text-white/70 group-hover/btn:scale-110 transition-transform" />
                                </button>
                            )}
                            {hasPermission('MANAGE_INVENTORY') && (
                                <button onClick={() => navigate('/store-manager/inventory')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all group/btn">
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-300">Manage Stock</span>
                                    <Icons.Package size={18} className="text-slate-500 group-hover/btn:text-blue-400 transition-colors" />
                                </button>
                            )}
                            {!hasPermission('MANAGE_POS_BILLING') && !hasPermission('MANAGE_INVENTORY') && (
                                <div className="text-center py-8">
                                    <Icons.ShieldOff size={32} className="mx-auto text-slate-700 mb-3" />
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest px-4">Administrative access limited for this role.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Icons.Activity size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-base">Store Status</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current System Status</p>
                            </div>
                        </div>
                        
                        <div className="flex items-end justify-between mb-4">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Online</h3>
                            <div className="text-emerald-500 flex items-center gap-1 mb-1.5">
                                <Icons.CheckCircle2 size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"></div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center">Last check 2 minutes ago</p>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StoreManagerDashboard;
