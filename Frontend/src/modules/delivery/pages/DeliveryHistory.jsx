import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Calendar,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Download,
    Package,
    ArrowUpDown,
    Filter,
    FileText,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useDelivery from '../hooks/useDelivery';


const DeliveryHistory = () => {
    const navigate = useNavigate();
    const { history, refreshOrders } = useDelivery();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFilter, setDateFilter] = useState('');
    const itemsPerPage = 5;

    React.useEffect(() => {
        refreshOrders('history');
    }, [refreshOrders]);

    const historicalOrders = useMemo(() => {
        if (!history) return [];
        return history.flatMap(run =>
            run.orders.map(o => ({
                id: o.order?.orderId || o.order?._id || 'Unknown',
                date: new Date(o.deliveredAt || o.failedAt || run.completedAt || run.createdAt).toLocaleDateString(),
                status: o.status === 'delivered' ? 'Delivered' : (o.status === 'failed' ? 'Failed' : o.status.replace('_', ' ')),
                amount: `₹${o.order?.totalAmount || 0}`,
                customer: o.order?.user?.name || 'Customer',
                location: o.order?.shippingAddress?.city || o.order?.shippingAddress?.street || 'Unknown'
            }))
        );
    }, [history]);

    const filteredOrders = useMemo(() => {
        return historicalOrders.filter(order =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, historicalOrders]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDownloadReport = () => {
        const id = toast.loading("Generating delivery history report...");
        setTimeout(() => {
            const csvContent = "Order ID,Date,Customer,Location,Status,Amount\n" +
                filteredOrders.map(o => `${o.id},${o.date},${o.customer},${o.location},${o.status},${o.amount}`).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `delivery_history_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.update(id, { render: "Report downloaded successfully", type: "success", isLoading: false, autoClose: 2000 });
        }, 1500);
    };

    const handleDateSelect = () => {
        toast.info(
            <div className="flex flex-col gap-2">
                <p className="font-bold text-xs uppercase tracking-widest text-[#028A0F]">Select Mission Date</p>
                <input
                    type="date"
                    onChange={(e) => {
                        setDateFilter(e.target.value);
                        toast.success(`Filtering by ${e.target.value}`);
                    }}
                    className="p-2 rounded-lg border border-slate-200 text-xs font-bold"
                />
            </div>,
            { autoClose: 4000 }
        );
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-slate-400 hover:text-[#028A0F] transition-all active:scale-90 shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-0.5 text-slate-800 dark:text-zinc-100">History</h1>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-zinc-400 font-bold tracking-tight uppercase tracking-[0.1em]">Ops Logistics & Archival</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadReport}
                    className="flex items-center justify-center gap-2 bg-[#028A0F] text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-lg shadow-[#028A0F]/20 font-black text-xs md:text-sm hover:bg-[#035a0a] transition-all active:scale-95"
                >
                    <Download size={16} md:size={18} />
                    Download report
                </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#028A0F] transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by order id or customer..."
                        className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl md:rounded-3xl text-sm font-medium focus:ring-2 focus:ring-[#028A0F] transition-all outline-none shadow-sm"
                    />
                </div>
                <button
                    onClick={handleDateSelect}
                    className="flex items-center justify-center gap-2 py-3 md:py-3.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl md:rounded-3xl font-bold text-[11px] md:text-xs tracking-tight text-slate-600 dark:text-zinc-400 hover:border-[#028A0F] transition-all active:scale-95 shadow-sm"
                >
                    <Calendar size={16} className="text-[#028A0F]" />
                    Select date
                </button>
            </div>

            {/* History Table/List */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-800/20">
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 italic">Order id</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 italic">Customer & date</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 italic">Status</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 text-right italic">Order Value</th>
                                <th className="px-4 md:px-6 py-3 md:py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer text-compact">
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                                    <Package size={16} md:size={18} />
                                                </div>
                                                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">#{order.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs md:text-sm text-slate-700 dark:text-slate-200">{order.customer}</span>
                                                <span className="text-[10px] md:text-xs font-medium text-slate-400">{order.date} • {order.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider ${order.status === 'Delivered'
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                                                : 'bg-red-50 dark:bg-red-500/10 text-red-600'
                                                }`}>
                                                {order.status === 'Delivered' ? <CheckCircle2 size={10} md:size={12} /> : <XCircle size={10} md:size={12} />}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                            <span className="font-black text-slate-900 dark:text-white text-sm md:text-base">{order.amount}</span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                            <ChevronRight size={16} md:size={18} className="text-slate-300 group-hover:text-[#028A0F] transition-colors inline" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px]">
                                        No historical logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        Logs archival • Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-2 md:px-4 md:py-2 bg-slate-50 dark:bg-zinc-800 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 transition-all flex items-center gap-1"
                        >
                            <ChevronLeft size={14} />
                            Prev
                        </button>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-2 md:px-4 md:py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-[#028A0F] border border-[#028A0F]/20 hover:bg-[#028A0F] hover:text-white disabled:opacity-30 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryHistory;

