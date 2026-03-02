import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { MessageSquare, Send, ArrowUpRight, CheckCircle, Search, Filter, Loader2, Package, User as UserIcon } from 'lucide-react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as complaintApi from '../../../admin/api/complaintApi';
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
    const [isActionLoading, setIsActionLoading] = useState(false);

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
            } else if (action === 'CLOSE') {
                const res = await complaintApi.closeTicket(token, selectedTicket.ticketId);
                if (res.success) {
                    toast.success('Ticket closed');
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
        'CLOSED': { bg: 'secondary', label: 'CLOSED' }
    };

    const filtered = complaints.filter(c => {
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchesSearch = c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

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
                            ) : filtered.map((c) => (
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
            </Card>

            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-black text-[#0c831f] uppercase tracking-tight">Manage Ticket: {selectedTicket?.ticketId}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4">
                    {selectedTicket && (
                        <div className="row g-4">
                            <div className="col-md-7">
                                <div className="p-3 bg-light rounded-4 mb-4">
                                    <label className="xs font-black text-muted uppercase tracking-widest mb-1 d-block">Original Complaint</label>
                                    <p className="small mb-2 fw-bold italic text-dark">"{selectedTicket.description}"</p>

                                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                        <div className="d-flex gap-2 mt-2 overflow-auto pb-2">
                                            {selectedTicket.attachments.map((img, idx) => (
                                                <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                                                    <img
                                                        src={img}
                                                        alt="Evidence"
                                                        className="rounded border border-gray-200 shadow-sm hover:opacity-80 transition-opacity"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>


                                <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">Resolution Thread</label>
                                <div className="border-start border-2 border-success ms-2 ps-3 space-y-3">
                                    {selectedTicket.resolutionThread?.map((msg, idx) => (
                                        <div key={idx} className="mb-2">
                                            <div className="xs text-muted uppercase font-black">{msg.senderName} ({msg.senderModel})</div>
                                            <div className="small fw-bold">{msg.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-5 border-start">
                                <Form.Group className="mb-4">
                                    <Form.Label className="xs font-black text-muted uppercase tracking-widest">Admin/Staff Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        className="bg-light border-0 small font-bold"
                                        placeholder="Add notes for the store manager..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    {selectedTicket.status === 'OPEN' && (
                                        <Button
                                            variant="warning"
                                            className="fw-black uppercase xs tracking-widest py-3 border-0 rounded-3 shadow-sm"
                                            onClick={() => handleAction('ESCALATE')}
                                            disabled={isActionLoading}
                                        >
                                            <ArrowUpRight size={18} className="me-2" /> Escalate to Store
                                        </Button>
                                    )}

                                    {['STORE_RESPONDED', 'RESOLVED'].includes(selectedTicket.status) && (
                                        <Button
                                            variant="success"
                                            className="fw-black uppercase xs tracking-widest py-3 border-0 rounded-3 shadow-sm"
                                            onClick={() => handleAction('CLOSE')}
                                            disabled={isActionLoading}
                                        >
                                            <CheckCircle size={18} className="me-2" /> Close Ticket
                                        </Button>
                                    )}

                                    <Button variant="light" onClick={() => setShowDetailModal(false)} className="fw-black xs uppercase tracking-widest text-muted border-0">
                                        Back to List
                                    </Button>
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

