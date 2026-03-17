import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { getDashboardStats } from '../../admin/api/adminApi';
import {
    ShoppingCart,
    Package,
    Clock,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Zap,
    AlertCircle,
    Users,
    Briefcase,
    Store,
    LayoutDashboard,
    ChevronRight,
    Search,
    QrCode,
    LifeBuoy,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { staffUser } = useStaffAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Permission-Aware Helper Function
    const hasAccess = (permissionCode) => {
        if (!staffUser) return false;
        // Managers see everything (Role-based override as per requirement)
        if (staffUser.role === 'Branch Manager') return true;
        // Staff see based on assigned permissions
        return Array.isArray(staffUser.permissions) && staffUser.permissions.includes(permissionCode);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats(staffUser?.token);
                if (data.success) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching staff dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (staffUser?.token) {
            fetchStats();
        }
    }, [staffUser?.token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-100 border-t-emerald-500 animate-spin"></div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Syncing Data...</p>
            </div>
        );
    }

    const { stats: apiStats, recentOrders: apiOrders } = stats || {};

    // 2. Implementation Strategy: Stats Widgets Generation
    const summaryStats = [
        {
            label: 'Orders Today',
            value: apiStats?.totalOrders,
            icon: ShoppingCart,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            path: '/staff/orders/active',
            show: hasAccess('VIEW_ORDERS')
        },
        {
            label: 'Pending Focus',
            value: apiStats?.pendingOrders,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            path: '/staff/orders/active?status=pending',
            show: hasAccess('VIEW_ORDERS')
        },
        {
            label: 'Today\'s Revenue',
            value: apiStats?.totalRevenue !== null ? `₹${apiStats.totalRevenue}` : null,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            path: '/staff/pos-billing',
            show: hasAccess('MANAGE_POS_BILLING')
        },
        {
            label: 'Active Inventory',
            value: apiStats?.totalProducts,
            icon: Package,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            path: '/staff/products',
            show: hasAccess('VIEW_PRODUCTS')
        },
        {
            label: 'Low Stock Alert',
            value: apiStats?.lowStockCount,
            icon: AlertCircle,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            path: '/staff/inventory',
            show: hasAccess('MANAGE_INVENTORY')
        },
        {
            label: 'Branch Users',
            value: apiStats?.totalUsers,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            path: '/staff/customers',
            show: hasAccess('VIEW_CUSTOMERS')
        },
    ].filter(stat => stat.show && stat.value !== null);

    // If no permissions, show empty state
    if (summaryStats.length === 0 && !hasAccess('VIEW_ORDERS')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                    <Briefcase size={40} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome, {staffUser?.name?.split(' ')[0]}</h2>
                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                    Your dashboad is currently empty because no active modules have been assigned to your profile by the administrator.
                </p>
                <div className="mt-8 flex gap-4">
                    <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for Sync</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto pb-8 px-2">

            {/* 3. Production Header - Compact & Premium */}
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Branch Portal Active</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">
                            Namaste, <span className="text-emerald-400">{staffUser?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-400 text-xs font-medium">Tracking performance at <span className="text-white font-bold">{staffUser?.branchId?.name || 'Main Hub'}</span></p>
                    </div>

                    {/* Actionable Links: Dynamic Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        {hasAccess('MANAGE_POS_BILLING') && (
                            <button onClick={() => navigate('/staff/pos-billing')} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                                <Zap size={14} /> New Bill
                            </button>
                        )}
                        {hasAccess('MANAGE_INVENTORY') && (
                            <button onClick={() => navigate('/staff/inventory')} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all border border-slate-700 active:scale-95">
                                <QrCode size={14} /> Scan Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Dynamic Stats Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {summaryStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={idx}
                            onClick={() => navigate(stat.path)}
                            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 ${stat.bgColor} ${stat.color} rounded-lg group-hover:scale-110 transition-transform`}>
                                    <Icon size={16} />
                                </div>
                                <ArrowRight size={12} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 5. Recent Transactions Table - Condition: VIEW_ORDERS */}
                {hasAccess('VIEW_ORDERS') && (
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Order Stream</h3>
                            </div>
                            <button
                                onClick={() => navigate('/staff/orders/active')}
                                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                            >
                                View History
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4 text-center">Amount</th>
                                        <th className="px-6 py-4 text-end">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {apiOrders?.map((order, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-all">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-[11px] shadow-sm">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-[11px]">{order.customer}</div>
                                                        <div className="text-[9px] text-slate-400 font-medium">Ref: {order.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className="font-black text-slate-900 text-[12px]">₹{order.amount}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-end">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!apiOrders || apiOrders.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-300">
                                                <div className="flex flex-col items-center opacity-30 italic">
                                                    <ShoppingCart size={32} className="mb-2" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No Recent Sales Activity</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. Side Tools - Condition: Role/Inventory */}
                <div className={`${hasAccess('VIEW_ORDERS') ? 'lg:col-span-4' : 'lg:col-span-full'} space-y-4`}>

                    {/* Performance Widget - Condition: Branch Manager */}
                    {staffUser?.role === 'Branch Manager' && (
                        <div className="bg-emerald-500 text-slate-900 p-6 rounded-[2rem] shadow-lg shadow-emerald-500/10 relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900/60 font-black">Efficiency Metric</h4>
                                    <TrendingUp size={16} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black tracking-tighter">98.4%</h2>
                                    <p className="text-[11px] font-bold leading-tight opacity-70">Top performing branch this week. Well done!</p>
                                </div>
                                <div className="h-2 w-full bg-slate-900/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-900 w-[98.4%] rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Production Support Desk Widget */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm">
                                    <MessageSquare size={16} />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest">Branch Support</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Triage Center</p>
                                </div>
                            </div>
                            {(apiStats?.pendingTickets > 0) && (
                                <div className="px-2 py-1 bg-rose-500 text-white text-[8px] font-black rounded-lg uppercase animate-pulse">
                                    Action Required
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 mb-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Escalated Tickets</p>
                                    <h3 className="text-2xl font-black text-slate-900">{apiStats?.pendingTickets || 0}</h3>
                                </div>
                                <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <LifeBuoy size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 mb-6">
                            <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-50">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Pending Resolution
                                </span>
                                <span className="text-xs font-black text-slate-900">{apiStats?.supportStats?.totalActive ?? apiStats?.pendingTickets ?? 0}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium px-1 text-center italic">
                                Only tickets escalated by Central Admin for branch resolution are shown here.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/staff/support')}
                            className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.1em] transition-all hover:bg-emerald-600 shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Open Support Desk <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
