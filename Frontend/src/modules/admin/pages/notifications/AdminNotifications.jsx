import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Badge, Spinner, Pagination, Form, Row, Col } from 'react-bootstrap';
import { Bell, Trash2, CheckCircle, Mail, MailOpen, Inbox, Filter, RefreshCw, Smartphone, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getMyNotifications, markAsRead, markAllRead, deleteNotifications } from '../../api/notificationApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AdminNotifications = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchNotifications = useCallback(async (page = 1) => {
        if (!adminUser?.token) return;
        try {
            setLoading(true);
            const res = await getMyNotifications(adminUser.token, page, 10);
            if (res.success) {
                setNotifications(res.notifications);
                setTotalPages(res.pagination.totalPages);
                setCurrentPage(res.pagination.page);
                setTotalItems(res.pagination.total);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [adminUser?.token, t]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(notifications.map(n => n._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(adminUser.token, id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            toast.success(t('notifications.admin_inbox.mark_read_success'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead(adminUser.token);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success(t('notifications.admin_inbox.mark_all_read_success'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleDelete = async (idsToDelete) => {
        if (!window.confirm(t('notifications.admin_inbox.delete_confirm', { count: idsToDelete.length }))) return;
        try {
            const res = await deleteNotifications(adminUser.token, idsToDelete);
            if (res.success) {
                toast.success(t('notifications.admin_inbox.delete_success'));
                setSelectedIds([]);
                fetchNotifications(currentPage);
            }
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <h4 className="fw-bold mb-0">{t('notifications.admin_inbox.title')}</h4>
                    {pageInfoData.adminNotifications && <PageInfoTooltip data={pageInfoData.adminNotifications} />}
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => fetchNotifications(currentPage)} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('notifications.admin_inbox.sync')}
                    </Button>
                </div>
            </div>

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="d-flex justify-content-between align-items-center p-3">
                            <div className="d-flex gap-3 align-items-center">
                                <Form.Check
                                    type="checkbox"
                                    checked={selectedIds.length === notifications.length && notifications.length > 0}
                                    onChange={handleSelectAll}
                                />
                                <span className="small text-muted">{selectedIds.length} {t('notifications.admin_inbox.selected')}</span>
                                {selectedIds.length > 0 && (
                                    <>
                                        <Button variant="outline-secondary" size="sm" onClick={() => handleDelete(selectedIds)}>
                                            <Trash2 size={14} className="me-1" /> {t('notifications.admin_inbox.delete_selected')}
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="link" size="sm" className="text-decoration-none" onClick={handleMarkAllRead}>
                                    {t('notifications.admin_inbox.mark_all_read')}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th style={{ width: '40px' }} className="ps-4"></th>
                                    <th style={{ width: '50px' }}>{t('notifications.admin_inbox.state')}</th>
                                    <th>{t('notifications.admin_inbox.subject')}</th>
                                    <th>{t('notifications.admin_inbox.timestamp')}</th>
                                    <th className="text-end pe-4">{t('notifications.admin_inbox.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                        </td>
                                    </tr>
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <div className="mb-2"><Inbox size={48} className="opacity-10" /></div>
                                            {t('notifications.admin_inbox.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((n) => (
                                        <tr key={n._id} className={n.isRead ? 'opacity-75' : 'bg-light-primary fw-bold'}>
                                            <td className="ps-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedIds.includes(n._id)}
                                                    onChange={() => handleSelectOne(n._id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-center">
                                                    {n.isRead ? <MailOpen size={16} className="text-muted" /> : <Mail size={16} className="text-primary" />}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={n.isRead ? 'text-muted' : 'text-dark'}>{n.title}</div>
                                                <div className="small text-muted text-truncate" style={{ maxWidth: '400px' }}>
                                                    {n.body}
                                                </div>
                                            </td>
                                            <td className="small text-muted">
                                                <div className="d-flex align-items-center gap-1">
                                                    <Clock size={14} /> {new Date(n.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    {!n.isRead && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 text-success"
                                                            onClick={() => handleMarkAsRead(n._id)}
                                                            title={t('notifications.admin_inbox.mark_read_success')}
                                                        >
                                                            <CheckCircle size={18} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 text-danger"
                                                        onClick={() => handleDelete([n._id])}
                                                        title={t('common.delete')}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
                {totalPages > 1 && (
                    <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-center">
                        <Pagination className="mb-0">
                            <Pagination.Prev
                                disabled={currentPage === 1}
                                onClick={() => fetchNotifications(currentPage - 1)}
                            />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => fetchNotifications(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                disabled={currentPage === totalPages}
                                onClick={() => fetchNotifications(currentPage + 1)}
                            />
                        </Pagination>
                    </Card.Footer>
                )}
            </Card>
        </div>
    );
};

export default AdminNotifications;
