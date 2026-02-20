import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './components/SummaryCards';
import * as Icons from 'lucide-react';

const StoreManagerDashboard = () => {
    const [period, setPeriod] = useState('Today');
    const navigate = useNavigate();

    // Period-based dummy data with paths for redirection
    const dashboardData = {
        'Today': {
            stats: [
                { label: 'Total Products', value: '1,240', icon: 'Package', color: 'bg-blue-500', textColor: 'text-blue-500', trend: 0, path: '/store-manager/inventory' },
                { label: 'Low Stock Items', value: '14', icon: 'AlertTriangle', color: 'bg-amber-500', textColor: 'text-amber-500', trend: 2, path: '/store-manager/inventory' },
                { label: 'Out of Stock', value: '3', icon: 'XCircle', color: 'bg-red-500', textColor: 'text-red-500', trend: 0, path: '/store-manager/inventory' },
                { label: 'Pending Returns', value: '8', icon: 'RotateCcw', color: 'bg-purple-500', textColor: 'text-purple-500', trend: 5, path: '/store-manager/returns' },
                { label: "Stock Updates", value: '45', icon: 'RefreshCcw', color: 'bg-green-500', textColor: 'text-green-500', trend: 8, path: '/store-manager/inventory' },
            ],
            chartData: [40, 65, 45, 90, 75, 55, 85],
            activities: [
                { id: 1, action: 'Stock Updated', details: 'Fresh Organic Tomatoes added (+50 units)', time: '10 mins ago', icon: 'Package', color: 'text-blue-600' },
                { id: 2, action: 'Return Approved', details: 'Order #ORD-9928 processed', time: '1 hour ago', icon: 'CheckCircle2', color: 'text-green-600' },
                { id: 3, action: 'Low Stock Alert', details: 'Cow Milk 1L is below threshold (2 units left)', time: '2 hours ago', icon: 'AlertCircle', color: 'text-red-600' },
                { id: 4, action: 'Stock Request', details: 'Request for 100 units of Brown Eggs', time: '4 hours ago', icon: 'Clock', color: 'text-amber-600' },
            ]
        },
        'Weekly': {
            stats: [
                { label: 'Total Products', value: '1,240', icon: 'Package', color: 'bg-blue-500', textColor: 'text-blue-500', trend: 1.2, path: '/store-manager/inventory' },
                { label: 'Low Stock Items', value: '32', icon: 'AlertTriangle', color: 'bg-amber-500', textColor: 'text-amber-500', trend: 15, path: '/store-manager/inventory' },
                { label: 'Out of Stock', value: '12', icon: 'XCircle', color: 'bg-red-500', textColor: 'text-red-500', trend: 4, path: '/store-manager/inventory' },
                { label: 'Pending Returns', value: '28', icon: 'RotateCcw', color: 'bg-purple-500', textColor: 'text-purple-500', trend: 12, path: '/store-manager/returns' },
                { label: "Stock Updates", value: '210', icon: 'RefreshCcw', color: 'bg-green-500', textColor: 'text-green-500', trend: 15, path: '/store-manager/inventory' },
            ],
            chartData: [220, 240, 210, 300, 280, 340, 310],
            activities: [
                { id: 1, action: 'Bulk Import', details: 'Imported 120 new SKU from Delhi Warehouse', time: '2 days ago', icon: 'UploadCloud', color: 'text-blue-600' },
                { id: 2, action: 'Monthly Audit', details: 'Inventory consistency check completed (99% match)', time: '4 days ago', icon: 'ClipboardCheck', color: 'text-violet-600' },
                { id: 3, action: 'Supplier Order', details: 'Restock order #SUP-114 placed for Dairy items', time: '5 days ago', icon: 'ShoppingCart', color: 'text-amber-600' },
            ]
        },
        'Monthly': {
            stats: [
                { label: 'Total Products', value: '1,240', icon: 'Package', color: 'bg-blue-500', textColor: 'text-blue-500', trend: 5.4, path: '/store-manager/inventory' },
                { label: 'Low Stock Items', value: '45', icon: 'AlertTriangle', color: 'bg-amber-500', textColor: 'text-amber-500', trend: -10, path: '/store-manager/inventory' },
                { label: 'Out of Stock', value: '18', icon: 'XCircle', color: 'bg-red-500', textColor: 'text-red-500', trend: -5, path: '/store-manager/inventory' },
                { label: 'Pending Returns', value: '105', icon: 'RotateCcw', color: 'bg-purple-500', textColor: 'text-purple-500', trend: 22, path: '/store-manager/returns' },
                { label: "Stock Updates", value: '890', icon: 'RefreshCcw', color: 'bg-green-500', textColor: 'text-green-500', trend: 18, path: '/store-manager/inventory' },
            ],
            chartData: [850, 920, 880, 1100, 1050, 1200, 1150],
            activities: [
                { id: 1, action: 'Inventory Correction', details: 'Spillage adjustment for Beverage section (-12 units)', time: '18 days ago', icon: 'Trash2', color: 'text-red-600' },
                { id: 2, action: 'New Manager', details: 'Rehan Khan assigned as Lead Store Manager', time: '25 days ago', icon: 'UserCheck', color: 'text-blue-600' },
            ]
        }
    };

    const currentData = dashboardData[period];
    const maxChartValue = Math.max(...currentData.chartData) || 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-1">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-500 text-xs">Real-time metrics and store performance insights.</p>
                </div>

                <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                    {['Today', 'Weekly', 'Monthly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all ${period === p
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid - Clickable */}
            <SummaryCards stats={currentData.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Chart & Actions) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Inventory Chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">Inventory Flow</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Unit movement analysis</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] text-slate-500 font-medium">Stock Level</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-[220px] flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100">
                            {currentData.chartData.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                                        <div className="bg-slate-800 text-white text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                            ₹{(val * 1250).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Bar Container */}
                                    <div className="w-full bg-slate-50 group-hover:bg-blue-50/50 transition-all rounded-t-md relative h-full flex flex-col justify-end">
                                        <div
                                            className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-md relative"
                                            style={{
                                                height: `${(val / maxChartValue) * 100}%`,
                                                minHeight: '4px'
                                            }}
                                        >
                                            {/* Bar Accent */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-md"></div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <span className="text-[9px] text-slate-400 font-semibold mt-3 whitespace-nowrap">
                                        {period === 'Today' ? `${i * 3}h` : period === 'Weekly' ? `Day ${i + 1}` : `W${i + 1}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/store-manager/inventory')}
                            className="flex items-center justify-between p-4 bg-slate-900 rounded-xl text-white hover:bg-slate-800 transition-all group shadow-sm"
                        >
                            <div className="text-left">
                                <p className="font-semibold text-sm">Manage Stock</p>
                                <p className="text-[10px] text-slate-400">Add or update inventory items</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                <Icons.ArrowRight size={18} />
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/store-manager/reports')}
                            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl text-slate-800 hover:border-blue-500 hover:bg-slate-50 transition-all group shadow-sm"
                        >
                            <div className="text-left">
                                <p className="font-semibold text-sm">Generate Report</p>
                                <p className="text-[10px] text-slate-500">Export inventory status to PDF</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <Icons.FileText size={18} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Sidebar Content (Activities & Metrics) */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                    <Icons.Activity size={14} />
                                </div>
                                Recent Activity
                            </h3>
                            <span className="text-[9px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-full">ACTIVE</span>
                        </div>

                        <div className="space-y-6 relative">
                            {currentData.activities.map((activity, idx) => {
                                const ActivityIcon = Icons[activity.icon] || Icons.Package;
                                return (
                                    <div key={activity.id} className="flex gap-4 relative">
                                        {idx !== currentData.activities.length - 1 && (
                                            <div className="absolute left-[15.5px] top-8 w-[1px] h-full bg-slate-100" />
                                        )}
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 z-10 shadow-sm group-hover:border-blue-200">
                                            <ActivityIcon size={14} className={activity.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-semibold text-slate-800 truncate">{activity.action}</h4>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{activity.details}</p>
                                            <span className="text-[9px] font-medium text-slate-400 mt-1.5 block uppercase tracking-tight">{activity.time}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => navigate('/store-manager/reports')}
                            className="w-full mt-8 py-2.5 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-all active:scale-95"
                        >
                            View Historical Logs
                        </button>
                    </div>

                    {/* Performance Metric - Professional Card */}
                    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>

                        <div className="flex items-center gap-2 mb-4">
                            <Icons.ShieldCheck size={16} className="text-blue-600" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inventory Health</p>
                        </div>

                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">94%</span>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold mb-1 border border-emerald-100">
                                <Icons.ArrowUpRight size={12} />
                                <span>2.4%</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                            <div className="bg-blue-600 h-full rounded-full w-[94%]" />
                        </div>

                        <p className="text-[10px] text-slate-500 leading-normal">
                            Discrepancies identified in <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/store-manager/inventory')}>"Vegetables"</span> sector.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreManagerDashboard;
