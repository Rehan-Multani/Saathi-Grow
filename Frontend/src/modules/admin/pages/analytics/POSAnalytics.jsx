import React, { useState } from 'react';
import { Download, Monitor, Store, ShoppingCart, User, Activity, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const POS_DATA = [
    { id: 'TXN-9001', branch: 'Main Store - Downtown', cashier: 'Sarah C.', items: 4, total: '₹56.00', time: '10:30 AM', itemsList: 'Milk, Bread, Eggs, Cheese' },
    { id: 'TXN-9002', branch: 'West Mall Kiosk', cashier: 'John C.', items: 1, total: '₹12.00', time: '10:45 AM', itemsList: 'Magazines' },
    { id: 'TXN-9003', branch: 'Main Store - Downtown', cashier: 'Sarah C.', items: 8, total: '₹145.50', time: '11:00 AM', itemsList: 'Vegetables, Meat, Snacks...' },
];

const POSAnalytics = () => {
    const { t } = useTranslation('admin_analytics');
    
    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Store Counter Sales</h1>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">Monitor real-time sales from physical counters</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase text-slate-700 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer pr-10 min-w-[180px]"
                    >
                        <option>All Locations</option>
                        <option>Main Store - Downtown</option>
                        <option>West Mall Kiosk</option>
                    </select>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                    >
                        <Download size={16} />
                        <span>{t('sales.download', { ns: 'admin_reports' })}</span>
                    </button>
                    
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <Monitor size={20} className="opacity-80" />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Working Counters</p>
                    <h3 className="text-2xl font-black tracking-tight mt-1">12 / 15 <span className="text-[10px] opacity-60 ml-1">Online</span></h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:text-blue-600 transition-colors">
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Today's Transactions</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">342 Entries</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:text-blue-600 transition-colors">
                            <Store size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Top Location</p>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1 truncate">Main Downtown</h3>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} className="text-blue-600" /> Live Receipt Log
                    </h5>
                    <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2">Full Record History</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">TXN Code</th>
                                <th className="px-6 py-5">Time</th>
                                <th className="px-6 py-5">Location</th>
                                <th className="px-6 py-5">Staff</th>
                                <th className="px-6 py-5">Items Sold</th>
                                <th className="px-8 py-5 text-right uppercase">Bill Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                            {POS_DATA.map((txn, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{txn.id}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                            <Clock size={12} className="opacity-50" /> {txn.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{txn.branch}</div>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] text-slate-400 uppercase tracking-tight font-bold">
                                        {txn.cashier}
                                    </td>
                                    <td className="px-6 py-5 max-w-[200px]">
                                        <div className="truncate">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 mr-2">{txn.items} items</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">{txn.itemsList}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-slate-900 text-sm tracking-tight">
                                        {txn.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default POSAnalytics;
