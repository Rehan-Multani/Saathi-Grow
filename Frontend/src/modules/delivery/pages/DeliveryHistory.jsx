import React from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Calendar,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Download,
    Package,
    ArrowUpDown
} from 'lucide-react';

const DeliveryHistory = () => {
    const historicalOrders = [
        { id: 'SG-0841', date: '21 Feb 2024', status: 'Delivered', amount: 'â‚¹45.00', items: '2 Items', customer: 'Rohan J.', location: 'Palasia' },
        { id: 'SG-0842', date: '21 Feb 2024', status: 'Cancelled', amount: 'â‚¹0.00', items: '1 Item', customer: 'Sneha M.', location: 'LIG Sq.' },
        { id: 'SG-0835', date: '20 Feb 2024', status: 'Delivered', amount: 'â‚¹38.00', items: '5 Items', customer: 'Vikas T.', location: 'Bhawarkua' },
        { id: 'SG-0830', date: '20 Feb 2024', status: 'Delivered', amount: 'â‚¹42.00', items: '3 Items', customer: 'Anjali R.', location: 'Annapurna' },
        { id: 'SG-0824', date: '19 Feb 2024', status: 'Delivered', amount: 'â‚¹55.00', items: '7 Items', customer: 'Kunal S.', location: 'Geeta Bhawan' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Delivery History</h1>
                    <p className="text-slate-500 font-medium">Review your past performance and earnings</p>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm font-bold text-sm hover:bg-slate-50 transition-colors">
                    <Download size={18} />
                    Download Report
                </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer name..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl font-medium focus:ring-2 focus:ring-pink-500 transition-all outline-none"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl font-bold text-sm tracking-tight text-slate-600 dark:text-zinc-400">
                    <Calendar size={18} />
                    Select Date Range
                </button>
            </div>

            {/* History Table/List */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-zinc-800">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer & Date</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Earning</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                            {historicalOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                                <Package size={20} />
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">#{order.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{order.customer}</span>
                                            <span className="text-xs font-medium text-slate-400">{order.date} â€¢ {order.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'Delivered'
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                                            : 'bg-red-50 dark:bg-red-500/10 text-red-600'
                                            }`}>
                                            {order.status === 'Delivered' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {order.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="font-black text-slate-900 dark:text-white text-lg">{order.amount}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-lime-500 transition-colors inline" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Showing 5 of 148 deliveries</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs font-bold text-slate-400">Previous</button>
                        <button className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryHistory;

