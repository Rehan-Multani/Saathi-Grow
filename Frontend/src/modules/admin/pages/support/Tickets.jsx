import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

import TicketEditModal from '../../components/support/TicketEditModal';

const SupportTickets = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;

    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
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
            toast.error(t('support.tickets.load_failed', { defaultValue: 'Failed to load tickets' }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadComplaints();
    }, [token]);

    const filtered = complaints.filter(t_item =>
        t_item.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t_item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t_item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                toast.success(t('support.tickets.escalate_success', { defaultValue: 'Ticket escalated to store!' }));
                loadComplaints();
            }
        } catch (error) {
            toast.error(t('support.tickets.escalate_failed', { defaultValue: 'Escalation failed' }));
        }
    };

    const statusMap = {
        'OPEN': { bg: 'primary', label: t('support.tickets.status.open') },
        'ESCALATED_TO_STORE': { bg: 'warning', label: t('support.tickets.status.escalated') },
        'STORE_RESPONDED': { bg: 'info', label: t('support.tickets.status.responded') },
        'RESOLVED': { bg: 'success', label: t('support.tickets.status.resolved') },
        'CLOSED': { bg: 'secondary', label: t('support.tickets.status.closed') },
        'OVERDUE': { bg: 'danger', label: t('support.tickets.status.sla_breach') }
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="py-3 py-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold uppercase tracking-tight text-[#0c831f]">{t('support.tickets.title')}</h5>
                            <Badge bg="success" pill className="fw-normal">{filtered.length}</Badge>
                        </div>
                        <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                            <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                                <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                                <Form.Control
                                    placeholder={t('support.tickets.search_placeholder')}
                                    className="border-start-0 ps-0 shadow-none font-small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                            <Button onClick={loadComplaints} variant="outline-success" className="d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                                <Plus size={18} /> {t('support.tickets.refresh')}
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
                            <p className="mt-2 text-muted x-small uppercase tracking-widest">{t('common.loading')}</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-[#f8f9fa] text-[#6c757d] small uppercase font-black tracking-widest">
                                <tr>
                                    <th className="ps-4 border-0 py-4">{t('support.tickets.table.ticket_id')}</th>
                                    <th className="border-0 py-4">{t('support.tickets.table.order_id')}</th>
                                    <th className="border-0 py-4">{t('support.tickets.table.user')}</th>
                                    <th className="border-0 py-4">{t('support.tickets.table.category')}</th>
                                    <th className="border-0 py-4">{t('support.tickets.table.priority')}</th>
                                    <th className="border-0 py-4">{t('support.tickets.table.status')}</th>
                                    <th className="border-0 py-4 text-end pe-4">{t('support.tickets.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTickets.length > 0 ? paginatedTickets.map((t_item, idx) => (
                                    <tr key={idx} className="border-bottom border-gray-50">
                                        <td className="ps-4 fw-black text-[#0c831f]">{t_item.ticketId}</td>
                                        <td className="small font-black">{t_item.order?.orderId || 'N/A'}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-[#0c831f]/10 rounded-circle d-flex align-items-center justify-content-center text-[#0c831f] small fw-black" style={{ width: '28px', height: '28px' }}>
                                                    {t_item.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="small fw-black">{t_item.user?.name || t('dashboard.guest')}</span>
                                                    <span className="text-muted xs">{t_item.user?.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark small">{t_item.category}</div>
                                            <div className="text-muted x-small truncate" style={{ maxWidth: '150px' }}>{t_item.description}</div>
                                        </td>
                                        <td>
                                            <Badge bg={t_item.priority === 'High' ? 'danger' : t_item.priority === 'Medium' ? 'warning' : 'info'} className="fw-black px-2 py-1 x-small tracking-tighter">
                                                {t_item.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={statusMap[t_item.status]?.bg || 'secondary'} className="rounded-pill fw-black px-3 x-small tracking-widest">
                                                {statusMap[t_item.status]?.label || t_item.status}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-[#0c831f] hover:bg-[#0c831f]/10 border-0 shadow-none"
                                                onClick={() => handleEdit(t_item)}
                                                title={t('common.view')}
                                            >
                                                <Info size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted small">
                                            {t('support.faqs.no_matching', { defaultValue: 'No results found' })}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>

                {/* Pagination Controls */}
                {!isLoading && totalFiltered > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            {t('common.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('common.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> {t('common.of')} <span className="fw-semibold text-dark">{totalFiltered}</span> {t('support.tickets.title').toLowerCase()}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="d-flex align-items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <Button
                                                key={p}
                                                variant={page === p ? 'success' : 'light'}
                                                className={`rounded shadow-sm ${page === p ? 'fw-bold' : 'text-secondary border'}`}
                                                style={{ width: '36px', height: '36px', padding: 0 }}
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-muted px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
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

