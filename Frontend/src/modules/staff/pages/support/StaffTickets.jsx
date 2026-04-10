import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { MessageSquare, Send, ArrowUpRight, CheckCircle, Search, Filter, Loader2, Package, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as complaintApi from '../../../../common/api/complaintApi';
import { toast } from 'react-toastify';

const StaffTickets = () => {
    const { staffUser } = useStaffAuth();
    const token = staffUser?.token;

    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [resolutionText, setResolutionText] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [recommendRefund, setRecommendRefund] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const res = await complaintApi.getAllComplaintsForAdmin(token);
            if (res.success) {
                setComplaints(res.complaints);
            }
        } catch (error) {
            toast.error('Failed to load tickets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadComplaints();
    }, [token]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const handleAction = async (action) => {
        try {
            setIsActionLoading(true);
            if (action === 'ESCALATE') {
                const res = await complaintApi.escalateToStore(token, selectedTicket.ticketId, adminNotes);
                if (res.success) {
                    toast.success('Escalated to Store');
                    loadComplaints();
                    setShowDetailModal(false);
                }
            } else if (action === 'RESOLVE') {
                const res = await complaintApi.resolveComplaintByStore(token, {
                    ticketId: selectedTicket.ticketId,
                    storeNotes: adminNotes || resolutionText,
                    resolutionSolution: resolutionText,
                    storeRecommendedRefund: recommendRefund
                });
                if (res.success) {
                    toast.success('Resolution & Recommendation sent to Admin');
                    loadComplaints();
                    setShowDetailModal(false);
                }
            }
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setIsActionLoading(false);
            setAdminNotes('');
        }
    };

    const statusMap = {
        'OPEN': { bg: 'warning', label: 'PENDING TRIAGE' },
        'ESCALATED_TO_STORE': { bg: 'danger', label: 'IN STORE RESOLUTION' },
        'STORE_RESPONDED': { bg: 'primary', label: 'STORE RESPONDED' },
        'RESOLVED': { bg: 'success', label: 'RESOLVED' },
        'CLOSED': { bg: 'secondary', label: 'CLOSED' },
        'OVERDUE': { bg: 'danger', label: 'SLA BREACH' }
    };

    const filtered = complaints.filter(c => {
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchesSearch = c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedTickets = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-1">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h4 className="fw-black text-[#0c831f] mb-0 uppercase tracking-tight">Support Intake Center</h4>
                    <p className="small text-muted font-bold uppercase tracking-wider">Triage and manage customer grievances</p>
                </div>
                <div className="d-flex gap-2">
                    <div className="position-relative">
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                        <Form.Control
                            size="sm"
                            className="ps-5 border-0 bg-light rounded-3 font-bold"
                            placeholder="SEARCH TICKETS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-[#0c831f]/5 text-muted small text-uppercase fw-black tracking-widest">
                            <tr>
                                <th className="ps-4 py-3 border-0">Ticket ID</th>
                                <th className="py-3 border-0">Context</th>
                                <th className="py-3 border-0">Priority</th>
                                <th className="py-3 border-0 text-center">Status</th>
                                <th className="py-3 border-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold border-0">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                            ) : paginatedTickets.map((c) => (
                                <tr key={c.ticketId} className="border-bottom border-light">
                                    <td className="ps-4">
                                        <div className="text-[#0c831f] xs fw-black uppercase">{c.ticketId}</div>
                                        <div className="xs text-muted">Order #{c.order?.orderId?.slice(-6)}</div>
                                    </td>
                                    <td>
                                        <div className="small fw-black uppercase">{c.category}</div>
                                        <div className="xs text-muted flex align-center gap-1"><UserIcon size={12} /> {c.user?.name}</div>
                                    </td>
                                    <td>
                                        <Badge bg={c.priority === 'High' ? 'danger' : 'warning'} className="xs border-0 px-2 py-1 uppercase tracking-tighter">
                                            {c.priority}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={statusMap[c.status]?.bg} className="bg-opacity-10 text-dark border xs fw-black px-2 py-1 uppercase tracking-widest">
                                            {statusMap[c.status]?.label}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="fw-black xs uppercase tracking-widest text-[#0c831f] border-0"
                                            onClick={() => {
                                                setSelectedTicket(c);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            View & Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
                {filtered.length > 0 && (
                    <Card.Footer className="bg-white border-top-0 py-3 px-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small font-bold uppercase tracking-wider">
                                Showing <span className="text-[#0c831f]">{Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}</span> to <span className="text-[#0c831f]">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="text-[#0c831f]">{filtered.length}</span> tickets
                            </div>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="border-0 bg-light rounded-2 px-3 hover:bg-[#0c831f] hover:text-white transition-all shadow-none"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "success" : "light"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={`border-0 rounded-2 px-3 font-black transition-all shadow-none ${currentPage === page ? 'bg-[#0c831f] text-white' : 'bg-light text-muted'}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="border-0 bg-light rounded-2 px-3 hover:bg-[#0c831f] hover:text-white transition-all shadow-none"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            <Modal 
                show={showDetailModal} 
                onHide={() => setShowDetailModal(false)} 
                centered 
                size="lg"
                contentClassName="border-0 rounded-[2rem] overflow-hidden shadow-2xl"
            >
                <Modal.Header className="bg-gradient-to-r from-[#0c831f] to-[#14a32a] p-4 border-0">
                    <div className="d-flex justify-content-between align-items-center w-100 px-2">
                        <div className="d-flex align-items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <MessageSquare className="text-white" size={20} />
                            </div>
                            <div>
                                <h5 className="mb-0 text-white font-black uppercase tracking-tight">Manage Ticket</h5>
                                <div className="text-white/70 text-[10px] font-bold tracking-widest">{selectedTicket?.ticketId}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowDetailModal(false)}
                            className="w-8 h-8 rounded-full bg-black/10 text-white hover:bg-black/20 flex items-center justify-center transition-all border-0"
                        >
                            <Loader2 size={18} className={isActionLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-0 bg-slate-50/50">
                    {selectedTicket && (
                        <div className="row g-0">
                            {/* Left Side: Details */}
                            <div className="col-md-7 p-4 p-lg-5">
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Complaint</label>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-50 relative">
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed mb-0">"{selectedTicket.description}"</p>
                                        </div>

                                        {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                            <div className="mt-4">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Attached Evidence</label>
                                                <div className="d-flex gap-2 overflow-auto pb-2 scroll-hide">
                                                    {selectedTicket.attachments.map((img, idx) => (
                                                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="group">
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                                                                <img src={img} alt="Evidence" className="w-100 h-100 object-cover" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-4 ms-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Thread</label>
                                        </div>
                                        <div className="ms-2 ps-4 border-l-2 border-slate-100 space-y-4">
                                            {selectedTicket.resolutionThread?.length > 0 ? (
                                                selectedTicket.resolutionThread.map((msg, idx) => (
                                                    <div key={idx} className="relative mb-3 last:mb-0">
                                                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-white border-2 border-slate-200 rounded-full" />
                                                        <div className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm inline-block max-w-full">
                                                            <div className="text-[9px] text-[#0c831f] font-black uppercase tracking-widest mb-1">{msg.senderName}</div>
                                                            <div className="text-xs font-bold text-slate-600 leading-snug">{msg.message}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-[11px] text-slate-400 font-bold italic py-2">No resolution updates yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Actions */}
                            <div className="col-md-5 bg-white border-l border-slate-50 p-4 p-lg-5">
                                <div className="flex flex-col h-100">
                                    <div className="mb-auto">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Notes</label>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all focus-within:border-[#0c831f] focus-within:shadow-lg focus-within:shadow-[#0c831f]/5">
                                            <textarea
                                                rows={4}
                                                className="w-100 bg-transparent border-0 text-sm font-bold text-slate-700 focus:outline-none resize-none"
                                                placeholder="Add private notes for the store manager..."
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        {['OPEN', 'ESCALATED_TO_STORE', 'OVERDUE'].includes(selectedTicket.status) && (
                                            <div className="mt-4 space-y-4">
                                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all focus-within:border-[#0c831f]">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Resolution Response</label>
                                                    <textarea
                                                        rows={3}
                                                        className="w-100 bg-transparent border-0 text-sm font-bold text-slate-700 focus:outline-none resize-none"
                                                        placeholder="Describe how the issue was resolved..."
                                                        value={resolutionText}
                                                        onChange={(e) => setResolutionText(e.target.value)}
                                                    />
                                                </div>

                                                {selectedTicket.order && (
                                                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                                        <input 
                                                            type="checkbox" 
                                                            id="staff-recommend-refund"
                                                            checked={recommendRefund}
                                                            onChange={(e) => setRecommendRefund(e.target.checked)}
                                                            className="w-4 h-4 accent-[#0c831f]"
                                                        />
                                                        <label htmlFor="staff-recommend-refund" className="text-[10px] font-black text-amber-900 uppercase cursor-pointer">
                                                            Recommend Refund (Requires Central Admin Approval)
                                                        </label>
                                                    </div>
                                                )}

                                                <Button
                                                    variant="success"
                                                    className="w-100 bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 text-white font-black uppercase text-[11px] tracking-[0.15em] py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                    disabled={!resolutionText.trim() || isActionLoading}
                                                    onClick={() => handleAction('RESOLVE')}
                                                >
                                                    {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                    Submit Resolution
                                                </Button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => setShowDetailModal(false)}
                                            className="w-100 bg-slate-50 border-0 text-slate-400 font-black uppercase text-[10px] tracking-widest py-3 rounded-2xl hover:bg-slate-100 transition-all"
                                        >
                                            Dismiss View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default StaffTickets;

