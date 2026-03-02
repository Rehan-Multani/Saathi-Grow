import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, MessageCircle, MoreHorizontal, Edit, Trash2, Info, ArrowUpRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

import TicketEditModal from '../../components/support/TicketEditModal';

const SupportTickets = () => {
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;

    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const response = await complaintApi.getAllComplaintsForAdmin(token);
            if (response.success) {
                setComplaints(response.complaints);
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

    const filtered = complaints.filter(t =>
        t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket);
        setShowEditModal(true);
    };

    const handleEscalate = async (ticketId, notes) => {
        try {
            const response = await complaintApi.escalateToStore(token, ticketId, notes);
            if (response.success) {
                toast.success('Ticket escalated to store!');
                loadComplaints();
            }
        } catch (error) {
            toast.error('Escalation failed');
        }
    };

    const statusMap = {
        'OPEN': { bg: 'primary', label: 'OPEN' },
        'ESCALATED_TO_STORE': { bg: 'warning', label: 'ESCALATED' },
        'STORE_RESPONDED': { bg: 'info', label: 'RESPONDED' },
        'RESOLVED': { bg: 'success', label: 'RESOLVED' },
        'CLOSED': { bg: 'secondary', label: 'CLOSED' }
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="py-3 py-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold uppercase tracking-tight text-[#0c831f]">Ticket Intake Center</h5>
                            <Badge bg="success" pill className="fw-normal">{filtered.length}</Badge>
                        </div>
                        <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                            <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                                <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by ID or User..."
                                    className="border-start-0 ps-0 shadow-none font-small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                            <Button onClick={loadComplaints} variant="outline-success" className="d-flex align-items-center justify-content-center gap-2 responsive-btn">
                                <Plus size={18} /> Refresh
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                    {isLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-[#f8f9fa] text-[#6c757d] small uppercase font-black tracking-widest">
                                <tr>
                                    <th className="ps-4 border-0 py-4">TICKET ID</th>
                                    <th className="border-0 py-4">ORDER ID</th>
                                    <th className="border-0 py-4">USER</th>
                                    <th className="border-0 py-4">ISSUE CATEGORY</th>
                                    <th className="border-0 py-4">PRIORITY</th>
                                    <th className="border-0 py-4">STATUS</th>
                                    <th className="border-0 py-4 text-end pe-4">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t, idx) => (
                                    <tr key={idx} className="border-bottom border-gray-50">
                                        <td className="ps-4 fw-black text-[#0c831f]">{t.ticketId}</td>
                                        <td className="small font-black">{t.order?.orderId || 'N/A'}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-[#0c831f]/10 rounded-circle d-flex align-items-center justify-content-center text-[#0c831f] small fw-black" style={{ width: '28px', height: '28px' }}>
                                                    {t.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="small fw-black">{t.user?.name || 'Deleted User'}</span>
                                                    <span className="text-muted xs">{t.user?.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark small">{t.category}</div>
                                            <div className="text-muted x-small truncate" style={{ maxWidth: '150px' }}>{t.description}</div>
                                        </td>
                                        <td>
                                            <Badge bg={t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'info'} className="fw-black px-2 py-1 x-small tracking-tighter">
                                                {t.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={statusMap[t.status]?.bg || 'secondary'} className="rounded-pill fw-black px-3 x-small tracking-widest">
                                                {statusMap[t.status]?.label || t.status}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-[#0c831f] hover:bg-[#0c831f]/10 border-0"
                                                onClick={() => handleEdit(t)}
                                            >
                                                <Info size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

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

