import React, { useState, useMemo, useEffect } from 'react';
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
import { formatCurrency } from '../../vendor/utils/formatDate';


const DeliveryHistory = () => {
    const navigate = useNavigate();
    const { token, history = [], historyPagination, refreshOrders } = useDelivery();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        if (!token) return;
        const params = {
            page: currentPage,
            limit: 10,
            date: dateFilter
        };
        refreshOrders('history', params);
    }, [token, refreshOrders, currentPage, dateFilter]);

    const historicalOrders = useMemo(() => {
        if (!history || !Array.isArray(history)) return [];
        const all = history.flatMap(run =>
            run.orders.filter(o => o.order).map(o => ({
                id: o.order?.orderId || o.order?._id || 'Unknown',
                rawDate: new Date(o.deliveredAt || o.failedAt || run.completedAt || run.createdAt),
                date: new Date(o.deliveredAt || o.failedAt || run.completedAt || run.createdAt).toLocaleDateString(),
                time: new Date(o.deliveredAt || o.failedAt || run.completedAt || run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: o.status === 'delivered' ? 'Delivered' : (o.status === 'failed' ? 'Failed' : o.status.replace(/_/g, ' ')),
                amount: o.order?.totalAmount || 0,
                customer: o.order?.user?.name || 'Customer',
                location: o.order?.shippingAddress?.street || 'Unknown',
                paymentMethod: o.order?.paymentMethod || 'online'
            }))
        ).sort((a, b) => b.rawDate - a.rawDate);

        const q = searchQuery.trim().toLowerCase();
        // Remove # or SG- prefixes from search query to match raw IDs, or match against a simulated string
        const normalizedQuery = q.replace(/^#?sg-?/, '');
        
        return q ? all.filter(o =>
            o.id.toLowerCase().includes(normalizedQuery) ||
            o.id.toLowerCase().includes(q) ||
            o.customer.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q) ||
            ('#sg-' + o.id.toLowerCase()).includes(q)
        ) : all;
    }, [history, searchQuery]);

    const handleDownloadReport = async () => {
        const id = toast.loading("Generating delivery history report...");
        try {
            const csvContent = "Order ID,Date,Customer,Location,Status,Amount\n" +
                historicalOrders.map(o => `"${o.id}","${o.date}","${o.customer.replace(/"/g, '""')}","${o.location.replace(/"/g, '""')}","${o.status}","${o.amount}"`).join("\n");

            const fileName = `delivery_history_${new Date().toISOString().split('T')[0]}.csv`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.update(id, { render: "Report downloaded successfully", type: "success", isLoading: false, autoClose: 2000 });
        } catch (error) {
            console.error("Export failed:", error);
            toast.update(id, { render: "Export Failed", type: "error", isLoading: false, autoClose: 2000 });
        }
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
        <div className="space-y-4 md:space-y-6 pb-28 md:pb-8">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">History</h1>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Logistics & Archival</p>
                </div>
                
                <button
                    onClick={handleDownloadReport}
                    className="w-9 h-9 flex items-center justify-center bg-[#028A0F] text-white !rounded-full shadow-lg shadow-[#028A0F]/20 hover:bg-[#035a0a] transition-all active:scale-95"
                    title="Download Report"
                >
                    <Download size={16} />
                </button>
            </div>

            {/* Filters Row */}
            <div className="flex items-stretch gap-2">
                <div className="flex items-center gap-2 flex-1 bg-white border border-slate-100 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-[#028A0F]/30">
                    <Search className="text-slate-400 shrink-0" size={14} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search order id..."
                        className="flex-1 plain-input bg-transparent text-[11px] !text-slate-900 font-bold outline-none"
                    />
                </div>
                <div className="relative shrink-0 flex items-center gap-1">
                    {dateFilter && (
                        <button
                            onClick={() => {
                                setDateFilter('');
                                setCurrentPage(1);
                            }}
                            className="h-full px-2.5 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 hover:bg-rose-100 transition-all active:scale-95 shadow-sm text-[10px] font-black uppercase tracking-wider"
                            title="Clear Date Filter"
                        >
                            Clear ({dateFilter})
                        </button>
                    )}
                    <button
                        onClick={() => document.getElementById('hist-date').showPicker()}
                        className={`h-full px-3 flex items-center justify-center bg-white border rounded-2xl transition-all active:scale-95 shadow-sm ${
                            dateFilter ? 'border-[#028A0F] text-[#028A0F] bg-[#028A0F]/5' : 'border-slate-100 text-slate-600 hover:border-[#028A0F]'
                        }`}
                    >
                        <Calendar size={18} className={dateFilter ? 'text-[#028A0F]' : 'text-slate-400'} />
                    </button>
                    <input 
                        id="hist-date"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={dateFilter}
                        className="absolute inset-0 opacity-0 pointer-events-none"
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* History Cards */}
            <div className="space-y-2">
                {historicalOrders.length > 0 ? (
                    historicalOrders.map((order) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={order.id} 
                            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <Package size={16} />
                                </div>
                                <div>
                                    <h4 className="font-black text-xs text-slate-900 leading-tight">#{order.orderId || order.id || order._id}</h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {order.date}
                                        </span>
                                        <span className="text-[7px] font-black text-slate-500 bg-slate-100 px-1 py-0.5 rounded ml-1 uppercase">
                                            {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xs text-slate-900 leading-none">{formatCurrency(order.amount)}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 leading-none">{order.time}</p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-50">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-2">No historical records found</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {historyPagination && historyPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="p-2 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-400 disabled:opacity-30 transition-all active:scale-95"
                    >
                        Prev
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {historyPagination.totalPages}
                    </span>
                    <button
                        disabled={currentPage === historyPagination.totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(historyPagination.totalPages, prev + 1))}
                        className="p-2 px-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeliveryHistory;

