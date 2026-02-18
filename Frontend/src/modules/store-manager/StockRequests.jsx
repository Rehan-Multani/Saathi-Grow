import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Package, AlertTriangle, User, History, ChevronRight } from 'lucide-react';

const StockRequests = () => {
    const [requests, setRequests] = useState([
        { id: 1, staffName: 'Amit Sharma', role: 'Floor Staff', product: 'Cow Milk 1L', quantity: 60, status: 'Pending', date: 'Feb 16, 2024 10:30 AM' },
        { id: 2, staffName: 'Priya Verma', role: 'Inventory Staff', product: 'Organic Brown Eggs', quantity: 100, status: 'Approved', date: 'Feb 15, 2024 02:45 PM' },
        { id: 3, staffName: 'Rahul Das', role: 'Floor Staff', product: 'Fresh Spinach', quantity: 30, status: 'Rejected', date: 'Feb 15, 2024 11:00 AM' },
        { id: 4, staffName: 'Sunita Roy', role: 'Floor Staff', product: 'Whole Wheat Bread', quantity: 20, status: 'Pending', date: 'Feb 16, 2024 09:15 AM' },
    ]);

    const handleStatusChange = (id, newStatus) => {
        setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle2 size={12} />;
            case 'Rejected': return <XCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Supply Chain Requests</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Audit and authorize inventory replenishment tickets from warehouse staff.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest">
                        <History size={16} /> Request History
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Staff Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Target Asset</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 text-center">Volume</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Authorization</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.map((request) => (
                                <tr key={request.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-500 text-xs shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
                                                {request.staffName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-800 tracking-tight">{request.staffName}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{request.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Package size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 tracking-tight">{request.product}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl inline-block uppercase border border-blue-100">
                                            {request.quantity} SKU
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{request.date}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black border flex items-center gap-2 w-fit tracking-widest ${getStatusStyle(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            {request.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {request.status === 'Pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(request.id, 'Approved')}
                                                        className="px-5 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 uppercase tracking-widest"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(request.id, 'Rejected')}
                                                        className="px-5 py-2 bg-white border border-rose-100 text-rose-600 text-[10px] font-black rounded-xl hover:bg-rose-50 transition-all uppercase tracking-widest"
                                                    >
                                                        Deny
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Processed</span>
                                                    <ChevronRight size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-start gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <AlertTriangle size={120} />
                </div>
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                    <AlertTriangle size={28} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-lg font-black text-white tracking-tight italic">Protocol Advisory</h4>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-2xl font-medium">
                        Status changes are finalized upon authorization. Ensure physical stock availability matches digital updates.
                        Discrepancies must be reported to the <span className="text-blue-400">Warehouse Command Center</span> immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StockRequests;
