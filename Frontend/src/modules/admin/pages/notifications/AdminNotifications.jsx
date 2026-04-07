import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Spinner, Pagination, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { Bell, Trash2, CheckCircle, Mail, MailOpen, Inbox, RefreshCw, Clock, MoreVertical, ShieldAlert, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getMyNotifications, markAsRead, markAllRead, deleteNotifications } from '../../api/notificationApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

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
            if (res.success || res.notifications) {
                setNotifications(res.notifications);
                setTotalPages(res.pagination?.totalPages || 1);
                setCurrentPage(res.pagination?.page || 1);
                setTotalItems(res.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(t('common.error', { defaultValue: 'Failed to fetch items' }));
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
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            await markAllRead(adminUser.token);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            Swal.fire({
                icon: 'success',
                title: 'Clean Slate!',
                text: 'All notifications marked as read',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (idsToDelete) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${idsToDelete.length === 1 ? 'this notification' : idsToDelete.length + ' notifications'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete!',
            customClass: {
                popup: 'rounded-3xl border-0 shadow-lg',
                confirmButton: 'rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2',
                cancelButton: 'rounded-xl font-bold uppercase tracking-wider text-xs px-4 py-2'
            }
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const res = await deleteNotifications(adminUser.token, idsToDelete);
                if (res.success) {
                    toast.success('Successfully deleted');
                    setSelectedIds([]);
                    fetchNotifications(currentPage);
                }
            } catch (error) {
                toast.error(t('common.error'));
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-black mb-0 tracking-tighter uppercase text-sm">
                        {t('notifications.admin_inbox.title', { defaultValue: 'Admin Inbox' })}
                        {totalItems > 0 && (
                            <span className="ms-2 badge bg-primary rounded-pill font-black text-[9px] px-2 py-1">
                                {totalItems}
                            </span>
                        )}
                    </h4>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="white" 
                        className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-gray-100"
                        onClick={() => fetchNotifications(currentPage)} 
                        disabled={loading}
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        {loading ? '...' : 'Sync'}
                    </Button>
                </div>
            </div>

            <Row className="mb-3">
                <Col md={12}>
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <Card.Body className="d-flex justify-content-between align-items-center p-2.5 px-3">
                            <div className="d-flex gap-4 align-items-center w-100 w-md-auto">
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Check
                                        type="checkbox"
                                        id="select-all"
                                        checked={selectedIds.length === notifications.length && notifications.length > 0}
                                        onChange={handleSelectAll}
                                        className="h5 mb-0 cursor-pointer custom-checkbox"
                                    />
                                    <label htmlFor="select-all" className="small text-muted fw-black uppercase tracking-widest cursor-pointer mb-0">Select All</label>
                                </div>
                                
                                {selectedIds.length > 0 && (
                                    <div className="d-flex gap-2 animate-in slide-in-from-left duration-200">
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleDelete(selectedIds)}
                                            className="rounded-xl px-3 font-black text-[10px] uppercase tracking-widest border-0 d-flex align-items-center gap-2"
                                        >
                                            <Trash2 size={12} /> Delete ({selectedIds.length})
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="d-flex gap-2 w-100 w-md-auto justify-content-end">
                                <Button 
                                    variant="link" 
                                    className="text-primary text-decoration-none font-black text-[10px] uppercase tracking-widest d-flex align-items-center gap-1 p-0 px-2"
                                    onClick={handleMarkAllRead}
                                >
                                    <CheckCircle size={14} /> Mark All as Read
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden mb-4">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle border-0">
                            <thead className="bg-light border-bottom border-gray-100">
                                <tr>
                                    <th style={{ width: '60px' }} className="ps-4"></th>
                                    <th>{t('notifications.admin_inbox.subject', { defaultValue: 'Alert Details' })}</th>
                                    <th style={{ width: '200px' }}>{t('notifications.admin_inbox.timestamp', { defaultValue: 'Date & Time' })}</th>
                                    <th className="text-end pe-4" style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" size="sm" />
                                            <p className="mt-2 text-muted x-small font-black uppercase tracking-widest">Loading Alerts...</p>
                                        </td>
                                    </tr>
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <div className="mb-3 bg-light rounded-circle p-4 d-inline-flex mx-auto">
                                                <Inbox size={40} className="text-gray-300" strokeWidth={1.5} />
                                            </div>
                                            <h6 className="fw-black text-gray-800 uppercase tracking-widest">Inbox is Empty</h6>
                                            <p className="text-muted small">You don't have any received notifications yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((n) => (
                                        <tr key={n._id} className={`${!n.isRead ? 'bg-blue-50/20' : ''} transition-colors border-bottom border-gray-50`}>
                                            <td className="ps-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedIds.includes(n._id)}
                                                    onChange={() => handleSelectOne(n._id)}
                                                    className="cursor-pointer"
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-start gap-3 py-2">
                                                    <div className={`p-2 rounded-xl shrink-0 ${!n.isRead ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                                        {!n.isRead ? <Mail size={18} /> : <MailOpen size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className={`d-flex align-items-center gap-2 mb-1 ${!n.isRead ? 'text-gray-900 fw-black' : 'text-gray-500 font-bold'}`}>
                                                            {n.title}
                                                            {!n.isRead && <span className="bg-red-500 w-1.5 h-1.5 rounded-full shadow-sm animate-pulse"></span>}
                                                        </div>
                                                        <div className="text-gray-600 small line-clamp-1 opacity-75">{n.body}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="small text-muted fw-bold">
                                                <div className="d-flex align-items-center gap-1 text-[11px] uppercase tracking-tighter opacity-75">
                                                    <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Dropdown align="end" className="d-inline">
                                                    <Dropdown.Toggle as="button" className="p-2 bg-transparent border-0 hover:bg-gray-100 rounded-lg text-gray-400 shadow-none">
                                                        <MoreVertical size={16} />
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu className="border-0 shadow-lg rounded-2xl p-2 animate-in zoom-in-95 duration-150">
                                                        {!n.isRead && (
                                                            <Dropdown.Item 
                                                                onClick={() => handleMarkAsRead(n._id)}
                                                                className="rounded-xl py-2 px-3 d-flex align-items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest"
                                                            >
                                                                <Check size={14} /> Mark as Read
                                                            </Dropdown.Item>
                                                        )}
                                                        <Dropdown.Item 
                                                            onClick={() => handleDelete([n._id])}
                                                            className="rounded-xl py-2 px-3 d-flex align-items-center gap-2 text-danger font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            <Trash2 size={14} /> Delete Alert
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
                {totalPages > 1 && (
                    <Card.Footer className="bg-white border-0 py-4 d-flex justify-content-center">
                        <Pagination className="mb-0 premium-pagination">
                            <Pagination.Prev
                                disabled={currentPage === 1}
                                onClick={() => fetchNotifications(currentPage - 1)}
                                className="rounded-l-xl"
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
                                className="rounded-r-xl"
                            />
                        </Pagination>
                    </Card.Footer>
                )}
            </Card>
        </div>
    );
};

export default AdminNotifications;
