import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './components/SummaryCards';
import * as Icons from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { getDashboardStats } from '../admin/api/adminApi';

const StoreManagerDashboard = () => {
    const { managerUser } = useStoreManagerAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Today');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
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

        if (managerUser?.token) {
            fetchStats();
        }
    }, [managerUser.token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { stats: apiStats, recentOrders: apiOrders, revenueData: apiRevenueData } = stats || {};

    const summaryStats = [
        { label: 'Total Revenue', value: `₹${apiStats?.totalRevenue || 0}`, icon: 'IndianRupee', color: 'bg-green-500', textColor: 'text-green-500', trend: 0, path: '/store-manager/reports' },
        { label: 'Total Orders', value: apiStats?.totalOrders || 0, icon: 'ShoppingCart', color: 'bg-blue-500', textColor: 'text-blue-500', trend: 0, path: '/store-manager/orders' },
        { label: 'Pending Orders', value: apiStats?.pendingOrders || 0, icon: 'Clock', color: 'bg-amber-500', textColor: 'text-amber-500', trend: 0, path: '/store-manager/orders' },
        { label: 'Support Tickets', value: apiStats?.pendingTickets || 0, icon: 'Headphones', color: 'bg-rose-500', textColor: 'text-rose-500', trend: 0, path: '/store-manager/support' },
        { label: 'Branch Status', value: 'Active', icon: 'Shield', color: 'bg-indigo-500', textColor: 'text-indigo-500', trend: 0, path: '/store-manager/profile' },
    ];


    const chartData = apiRevenueData?.map(d => d.orders) || [0, 0, 0, 0, 0, 0, 0];
    const maxChartValue = Math.max(...chartData) || 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-1">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Branch Management</h2>
                    <p className="text-slate-500 text-xs">Real-time metrics for your assigned branch.</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 italic text-[11px] font-medium">
                    <Icons.ShieldCheck size={14} />
                    <span>Manager Access: {managerUser?.branchId ? 'Active' : 'Global (Admin View)'}</span>
                </div>
            </div>

            {/* Stats Grid - Clickable */}
            <SummaryCards stats={summaryStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Chart & Actions) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Inventory Chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">Order Volume (Last 7 Days)</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Historical trend analysis</p>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-[220px] flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100">
                            {apiRevenueData?.map((data, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                                        <div className="bg-slate-800 text-white text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                            ₹{data.revenue.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Bar Container */}
                                    <div className="w-full bg-slate-50 group-hover:bg-blue-50/50 transition-all rounded-t-md relative h-full flex flex-col justify-end">
                                        <div
                                            className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-md relative"
                                            style={{
                                                height: `${(data.orders / maxChartValue) * 100}%`,
                                                minHeight: '4px'
                                            }}
                                        >
                                            {/* Bar Accent */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-md"></div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <span className="text-[9px] text-slate-400 font-semibold mt-3 whitespace-nowrap">
                                        {data.name}
                                    </span>
                                </div>
                            ))}
                            {(!apiRevenueData || apiRevenueData.length === 0) && (
                                <div className="w-full text-center text-slate-400 text-xs py-20">No data available for chart.</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders Section */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 text-sm">Recent Transactions</h3>
                            <button onClick={() => navigate('/store-manager/orders')} className="text-blue-600 text-[10px] font-bold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead className="text-slate-400 font-bold uppercase tracking-wider">
                                    <tr className="border-b border-slate-50">
                                        <th className="pb-3 px-1">Order</th>
                                        <th className="pb-3">Customer</th>
                                        <th className="pb-3 text-right">Amount</th>
                                        <th className="pb-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {apiOrders?.map((order, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-1 font-bold text-slate-700">{order.id}</td>
                                            <td className="py-3 text-slate-600">{order.customer}</td>
                                            <td className="py-3 text-right font-bold text-slate-800">₹{order.amount}</td>
                                            <td className="py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!apiOrders || apiOrders.length === 0) && (
                                        <tr><td colSpan="4" className="text-center py-4 text-slate-400">No recent orders.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content (Activities & Metrics) */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 text-sm mb-4">Branch Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/store-manager/inventory')}
                                className="w-full flex items-center justify-between p-3 bg-slate-900 rounded-lg text-white hover:bg-slate-800 transition-all group"
                            >
                                <div className="text-left flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-md">
                                        <Icons.Package size={14} />
                                    </div>
                                    <span className="font-semibold text-xs text-white">Stock Management</span>
                                </div>
                                <Icons.ChevronRight size={14} className="text-slate-500" />
                            </button>
                            <button
                                onClick={() => navigate('/store-manager/staff')}
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-slate-800 hover:border-blue-500 hover:bg-slate-50 transition-all group"
                            >
                                <div className="text-left flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                                        <Icons.Users size={14} />
                                    </div>
                                    <span className="font-semibold text-xs">Branch Staff</span>
                                </div>
                                <Icons.ChevronRight size={14} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Performance Metric - Professional Card */}
                    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>

                        <div className="flex items-center gap-2 mb-4">
                            <Icons.ShieldCheck size={16} className="text-blue-600" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Efficiency</p>
                        </div>

                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">98%</span>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold mb-1 border border-emerald-100">
                                <Icons.TrendingUp size={12} />
                                <span>+2%</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                            <div className="bg-blue-600 h-full rounded-full w-[98%]" />
                        </div>

                        <p className="text-[10px] text-slate-500 leading-normal">
                            All staff members are currently online and processing orders.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreManagerDashboard;
