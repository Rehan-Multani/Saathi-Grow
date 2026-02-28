import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { getDashboardStats } from '../../admin/api/adminApi';
import {
    ShoppingCart,
    Package,
    Clock,
    TrendingUp,
    Activity,
    CheckCircle2,
    Bell,
    ArrowRight,
    ShieldCheck,
    ChevronRight,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { staffUser } = useStaffAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { stats: apiStats, recentOrders: apiOrders, revenueData: apiRevenueData } = stats || {};

    const summaryStats = [
        { label: 'Total Orders', value: apiStats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50', path: '/staff/orders/active' },
        { label: 'Pending', value: apiStats?.pendingOrders || 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', path: '/staff/orders/active' },
        { label: 'Revenue', value: `₹${apiStats?.totalRevenue || 0}`, icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50', path: '/staff/orders/active' },
        { label: 'Products', value: apiStats?.totalProducts || 0, icon: Package, color: 'text-indigo-600', bgColor: 'bg-indigo-50', path: '/staff/inventory' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Overview</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase">Staff</span>
                        <p className="text-slate-500 text-xs font-medium">
                            <span className="font-bold text-blue-600">Branch:</span> {staffUser?.branchId ? 'Operationally Active' : 'Global Access'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500 animate-pulse" />
                        <span className="text-slate-800 text-xs font-bold">Live Status</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={idx}
                            onClick={() => navigate(stat.path)}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.bgColor} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                    <Icon size={24} />
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                            </div>
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Table Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Orders Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Recent Store Activity</h3>
                                <p className="text-[10px] text-slate-400 font-medium">LATEST 5 TRANSACTIONS IN BRANCH</p>
                            </div>
                            <button
                                onClick={() => navigate('/staff/orders/active')}
                                className="text-blue-600 text-[11px] font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                VIEW ALL
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {apiOrders?.map((order, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 text-[12px]">{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                    <span className="text-slate-600 text-[12px]">{order.customer}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[12px] font-black text-slate-800">₹{order.amount}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!apiOrders || apiOrders.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center opacity-40">
                                                    <ShoppingCart size={40} className="mb-2" />
                                                    <p className="text-xs font-bold uppercase tracking-widest">No Recent Orders</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Side Info Column */}
                <div className="space-y-6">
                    {/* Performance Metrics */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full transition-all group-hover:scale-150 duration-700"></div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Branch Performance</h4>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-extrabold tracking-tighter">98.4%</span>
                                <div className="mb-1 flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                                    <TrendingUp size={12} />
                                    <span>+1.2%</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                                Overall order fulfillment rate is exceptionally high. Keep up the momentum!
                            </p>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[98.4%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Checklist */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <CheckCircle2 size={18} />
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Operational Tasklist</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: 'Opening Attendance', done: true },
                                { title: 'Kitchen/Stock Check', done: false },
                                { title: 'Order Counter Prep', done: false }
                            ].map((task, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 group-hover:border-blue-400'
                                        }`}>
                                        {task.done && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-[12px] font-medium ${task.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                        {task.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                            REFRESH LIST
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
