import React, { useState, useEffect } from 'react';
import { Search, Plus, Info, ChevronLeft, ChevronRight, RefreshCw, Ticket as TicketIcon, Clock, Package, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

import TicketEditModal from '../../components/support/TicketEditModal';

const SupportTickets = () => {
    const { t } = useTranslation('admin_support');
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;

    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const limit = 10;

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const response = await complaintApi.getAllComplaintsForAdmin(token);
            if (response.success) {
                setComplaints(response.complaints);
            }
        } catch (error) {
            // toast.error(t('tickets.load_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadComplaints();
    }, [token]);

    const filtered = complaints.filter(t_item => {
        const search = searchTerm.toLowerCase();
        return (
            (t_item.ticketId && t_item.ticketId.toLowerCase().includes(search)) ||
            (t_item.user?.name && t_item.user.name.toLowerCase().includes(search)) ||
            (t_item.category && t_item.category.toLowerCase().includes(search))
        );
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedTickets = filtered.slice((page - 1) * limit, page * limit);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket);
        setShowEditModal(true);
    };

    const handleEscalate = async (ticketId, notes) => {
        try {
            const response = await complaintApi.escalateToStore(token, ticketId, notes);
            if (response.success) {
                toast.success(t('tickets.escalate_success'));
                loadComplaints();
            }
        } catch (error) {
            toast.error(t('tickets.escalate_failed'));
        }
    };

    const statusMap = {
        'OPEN': { bg: 'bg-blue-50 text-blue-600 border-blue-100', label: t('tickets.status.open') },
        'ESCALATED_TO_STORE': { bg: 'bg-amber-50 text-amber-600 border-amber-100', label: t('tickets.status.escalated') },
        'STORE_RESPONDED': { bg: 'bg-cyan-50 text-cyan-600 border-cyan-100', label: t('tickets.status.responded') },
        'RESOLVED': { bg: 'bg-emerald-600 text-white border-emerald-600', label: t('tickets.status.resolved') },
        'CLOSED': { bg: 'bg-slate-400 text-white border-slate-400', label: t('tickets.status.closed') },
        'OVERDUE': { bg: 'bg-rose-600 text-white border-rose-600', label: t('tickets.status.sla_breach') }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('tickets.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.supportTickets} />
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                            {totalFiltered}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('tickets.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-slate-700 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={loadComplaints}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[11px]">
                                <th className="px-6 py-4">{t('tickets.table.ticket_id')}</th>
                                <th className="px-4 py-4">{t('tickets.table.order_id')}</th>
                                <th className="px-4 py-4">{t('tickets.table.user')}</th>
                                <th className="px-4 py-4">{t('tickets.table.category')}</th>
                                <th className="px-4 py-4 text-center">{t('tickets.table.priority')}</th>
                                <th className="px-4 py-4 text-center">{t('tickets.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('tickets.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-5">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <TicketIcon size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('faqs.no_matching')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTickets.map((t_item, idx) => {
                                    const status = statusMap[t_item.status] || { bg: 'bg-slate-100 text-slate-500 border-slate-200', label: t_item.status };
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="text-xs font-bold text-blue-600 uppercase tracking-tight">{t_item.ticketId}</div>
                                            </td>
                                            <td className="px-4 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                {t_item.order?.orderId || 'N/A'}
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold border border-slate-200 uppercase">
                                                        {t_item.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-slate-800 leading-tight uppercase">{t_item.user?.name || 'Guest'}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">{t_item.user?.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-xs font-bold text-slate-700 uppercase">{t_item.category}</div>
                                                <div className="text-[10px] text-slate-400 font-bold truncate mt-0.5 max-w-[150px]">{t_item.description}</div>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-tight ${
                                                    t_item.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : t_item.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                    {t_item.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-tight ${status.bg}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleEdit(t_item)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    title="View"
                                                >
                                                    <Info size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && totalFiltered > 0 && totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Showing <span className="text-slate-900">{((page - 1) * limit) + 1} - {Math.min(page * limit, totalFiltered)}</span> of {totalFiltered} tickets
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-xl disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <span className="text-xs font-bold text-slate-500">{page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded-xl disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            <TicketEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                ticket={selectedTicket}
                onEscalate={handleEscalate}
                onRefresh={loadComplaints}
            />
        </div>
    );
};

export default SupportTickets;
