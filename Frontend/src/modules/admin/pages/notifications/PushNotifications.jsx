import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Badge, Table, Spinner, InputGroup, Pagination } from 'react-bootstrap';
import { Send, Bell, Smartphone, User, Clock, CheckCircle, Search, Users, Shield, Truck, Store, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import { sendNotification, getNotificationHistory, searchRecipients, deleteNotifications } from '../../api/notificationApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const PushNotifications = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState('broadcast');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dispatching, setDispatching] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Individual selection state
    const [searchQuery, setSearchQuery] = useState('');
    const [recipientType, setRecipientType] = useState('User');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);

    const fetchHistory = useCallback(async (page = 1) => {
        if (!adminUser?.token) return;
        try {
            setLoading(true);
            const res = await getNotificationHistory(adminUser.token, page, 10);
            if (res.success) {
                setHistory(res.notifications);
                setTotalPages(res.pagination.totalPages);
                setCurrentPage(res.pagination.page);
                setTotalItems(res.pagination.total);
            }
        } catch (error) {
            console.error('History fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [adminUser?.token]);

    useEffect(() => {
        fetchHistory(1);
    }, [fetchHistory]);

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            setSearchLoading(true);
            const res = await searchRecipients(adminUser.token, val, recipientType);
            if (res.success) {
                setSearchResults(res.results);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSend = async () => {
        if (!title || !message) {
            toast.error(t('common.fill_required', { defaultValue: 'Please enter title and message' }));
            return;
        }

        if (targetType === 'individual' && !selectedRecipient) {
            toast.error('Please select a recipient');
            return;
        }

        try {
            setDispatching(true);
            const payload = {
                title,
                body: message,
                targetType,
                group: targetType === 'broadcast' ? selectedGroup : undefined,
                recipientId: targetType === 'individual' ? selectedRecipient._id : undefined,
                recipientType: targetType === 'individual' ? recipientType : undefined
            };

            const res = await sendNotification(adminUser.token, payload);
            if (res.success) {
                toast.success(t('notifications.push.dispatch_success'));
                setTitle('');
                setMessage('');
                setSelectedRecipient(null);
                setSearchQuery('');
                fetchHistory(1); // Refresh history
            }
        } catch (error) {
            toast.error(error.message || 'Failed to dispatch signal');
        } finally {
            setDispatching(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('notifications.push.delete_record_confirm'))) return;
        try {
            const res = await deleteNotifications(adminUser.token, [id]);
            if (res.success) {
                toast.success(t('notifications.push.delete_success', { defaultValue: 'Record Deleted' }));
                fetchHistory(currentPage);
            }
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const getTargetEntityIcon = (n) => {
        if (n.isBroadcast) return <Users size={12} />;
        switch (n.recipientModel) {
            case 'Vendor': return <Store size={12} />;
            case 'DeliveryPartner': return <Truck size={12} />;
            case 'Admin': return <Shield size={12} />;
            default: return <User size={12} />;
        }
    };

    const getTargetEntityName = (n) => {
        if (n.isBroadcast) {
            return `${t('notifications.push.group')}: ${n.targetGroup?.toUpperCase() || 'ALL'}`;
        }
        return n.recipient?.name || t('notifications.push.unknown_recipient');
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <h4 className="fw-bold mb-0">{t('notifications.push.title')}</h4>
                    <PageInfoTooltip data={pageInfoData.pushNotifications} />
                </div>
            </div>

            <Row className="g-4 mb-4">
                {/* Control Panel */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-primary text-white py-3 border-0">
                            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <Send size={18} /> {t('notifications.push.initialize')}
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">{t('notifications.push.transmission_protocol')}</Form.Label>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={targetType === 'broadcast' ? 'primary' : 'outline-primary'}
                                        size="sm"
                                        className="flex-grow-1"
                                        onClick={() => setTargetType('broadcast')}
                                    >
                                        {t('notifications.push.mass_broadcast')}
                                    </Button>
                                    <Button
                                        variant={targetType === 'individual' ? 'primary' : 'outline-primary'}
                                        size="sm"
                                        className="flex-grow-1"
                                        onClick={() => setTargetType('individual')}
                                    >
                                        {t('notifications.push.direct_signal')}
                                    </Button>
                                </div>
                            </Form.Group>

                            {targetType === 'broadcast' ? (
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">{t('notifications.push.strategic_audience')}</Form.Label>
                                    <Form.Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                                        <option value="all">{t('notifications.push.all_nodes')}</option>
                                        <option value="users">{t('notifications.push.premium_users')}</option>
                                        <option value="vendors">{t('notifications.push.vendor_network')}</option>
                                        <option value="delivery_partners">{t('notifications.push.logistics_partners')}</option>
                                        <option value="staff">{t('notifications.push.internal_staff')}</option>
                                        <option value="branch_managers">{t('notifications.push.regional_managers')}</option>
                                    </Form.Select>
                                </Form.Group>
                            ) : (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">{t('notifications.push.entity_type')}</Form.Label>
                                        <Form.Select value={recipientType} onChange={(e) => {
                                            setRecipientType(e.target.value);
                                            setSelectedRecipient(null);
                                            setSearchResults([]);
                                            setSearchQuery('');
                                        }}>
                                            <option value="User">{t('common.customers')}</option>
                                            <option value="Vendor">{t('common.vendors')}</option>
                                            <option value="DeliveryPartner">{t('sidebar.delivery_partners')}</option>
                                            <option value="Staff">{t('common.staff')}</option>
                                            <option value="Branch Manager">{t('sidebar.branches')}</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3 position-relative">
                                        <Form.Label className="small fw-bold text-muted">{t('notifications.push.locate_recipient')}</Form.Label>
                                        <InputGroup size="sm">
                                            <InputGroup.Text className="bg-white"><Search size={14} /></InputGroup.Text>
                                            <Form.Control
                                                placeholder={t('common.search')}
                                                value={selectedRecipient ? selectedRecipient.name : searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                readOnly={!!selectedRecipient}
                                            />
                                            {selectedRecipient && (
                                                <Button variant="outline-danger" onClick={() => setSelectedRecipient(null)}>{t('common.cancel')}</Button>
                                            )}
                                        </InputGroup>
                                        {searchLoading && <div className="position-absolute end-0 top-50 me-5 translate-middle-y"><Spinner animation="border" size="sm" /></div>}
                                        {searchResults.length > 0 && !selectedRecipient && (
                                            <div className="position-absolute w-100 bg-white shadow rounded mt-1 z-3 border overflow-auto" style={{ maxHeight: '200px' }}>
                                                {searchResults.map(res => (
                                                    <div
                                                        key={res._id}
                                                        className="p-2 border-bottom cursor-pointer hover-bg-light small d-flex justify-content-between align-items-center"
                                                        onClick={() => {
                                                            setSelectedRecipient(res);
                                                            setSearchResults([]);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <span>{res.name}</span>
                                                        <span className="text-muted">{res.phone}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>
                                </>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">{t('notifications.push.signal_title')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={t('notifications.push.signal_title')}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted">{t('notifications.push.protocol_msg')}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder={t('notifications.push.protocol_msg')}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                                onClick={handleSend}
                                disabled={dispatching}
                            >
                                {dispatching ? <Spinner animation="border" size="sm" /> : <Bell size={18} />}
                                {t('notifications.push.dispatch_signal')}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Preview Panel */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100 bg-gradient-light">
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div className="bg-white rounded-4 shadow p-3" style={{ width: '280px', minHeight: '400px', border: '1px solid #eee' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                    <span className="small fw-bold text-primary">SathiGro</span>
                                    <span className="small text-muted">{t('common.now', { defaultValue: 'Now' })}</span>
                                </div>
                                <div className="d-flex gap-2">
                                    <div className="bg-primary rounded p-2 text-white" style={{ height: '32px', width: '32px' }}>
                                        <Bell size={16} />
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <h6 className="mb-1 fw-bold small text-dark text-truncate">{title || t('notifications.push.signal_title')}</h6>
                                        <p className="mb-0 small text-muted text-wrap" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                            {message || t('notifications.push.preview_instruction')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Analysis Panel */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">{t('notifications.push.analysis_title')}</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">{t('notifications.push.total_dispatched')}</span>
                                <span className="fw-bold text-dark">{totalItems.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">{t('notifications.push.response_rate')}</span>
                                <span className="fw-bold text-success">18.5%</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">{t('notifications.push.protocol_health')}</span>
                                <span className="fw-bold text-primary">98.8%</span>
                            </div>
                            <hr className="my-4 opacity-10" />
                            <div className="bg-light p-3 rounded-3 small text-muted">
                                {t('notifications.push.metrics_wait')}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Broadcast History */}
            <Card className="border-0 shadow-sm overflow-hidden mb-4">
                <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">{t('notifications.push.history')}</h5>
                    <Badge bg="light" text="dark" className="border">{t('notifications.push.historical_logs')}: {totalItems}</Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4 border-0 py-3">{t('notifications.push.signal_content')}</th>
                                    <th className="border-0 py-3">{t('notifications.push.target_entity')}</th>
                                    <th className="border-0 py-3">{t('notifications.push.dispatch_time')}</th>
                                    <th className="border-0 py-3">{t('notifications.push.protocol_state')}</th>
                                    <th className="border-0 py-3 text-end pe-4">{t('notifications.admin_inbox.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <Spinner animation="grow" variant="primary" />
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">{t('notifications.admin_inbox.empty')}</td>
                                    </tr>
                                ) : (
                                    history.map((n) => (
                                        <tr key={n._id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{n.title}</div>
                                                <div className="small text-muted text-truncate" style={{ maxWidth: '250px' }}>{n.body}</div>
                                            </td>
                                            <td>
                                                <Badge bg="light" text="dark" className="border fw-normal d-inline-flex align-items-center gap-1">
                                                    {getTargetEntityIcon(n)} {getTargetEntityName(n)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-1 text-muted small">
                                                    <Clock size={14} /> {new Date(n.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="success" className="rounded-pill fw-normal px-3">{t('notifications.push.sent')}</Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="link" size="sm" className="p-0 text-primary">{t('notifications.push.resend')}</Button>
                                                    <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => handleDelete(n._id)}><Trash2 size={16} /></Button>
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
                                onClick={() => fetchHistory(currentPage - 1)}
                            />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => fetchHistory(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                disabled={currentPage === totalPages}
                                onClick={() => fetchHistory(currentPage + 1)}
                            />
                        </Pagination>
                    </Card.Footer>
                )}
            </Card>
        </div>
    );
};

export default PushNotifications;
