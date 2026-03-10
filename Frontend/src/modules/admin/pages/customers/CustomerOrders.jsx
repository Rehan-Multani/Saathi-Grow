import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, XCircle, Clock } from 'lucide-react';

const CUSTOMER_ORDERS_MOCK = [
    { orderId: 'ORD-8801', customer: 'Alice Johnson', items: 'Milk, Bread, Eggs', amount: '₹25.50', date: '2023-11-01', status: 'Delivered' },
    { orderId: 'ORD-8802', customer: 'Carol Williams', items: 'Detergent, Soap', amount: '₹15.00', date: '2023-10-31', status: 'Processing' },
    { orderId: 'ORD-8803', customer: 'Alice Johnson', items: 'Vegetables Pack', amount: '₹35.00', date: '2023-10-28', status: 'Delivered' },
    { orderId: 'ORD-8804', customer: 'Bob Smith', items: 'Electronics Gadget', amount: '₹200.00', date: '2023-10-25', status: 'Cancelled' },
    { orderId: 'ORD-8805', customer: 'Diana Prince', items: 'Organic Apples, Bananas', amount: '₹42.00', date: '2023-11-02', status: 'Processing' },
    { orderId: 'ORD-8806', customer: 'Edward Norton', items: 'Coffee Beans, Sugar', amount: '₹18.75', date: '2023-11-03', status: 'Delivered' },
    { orderId: 'ORD-8807', customer: 'Fiona Gallagher', items: 'Shampoo, Conditioner', amount: '₹22.50', date: '2023-10-29', status: 'Cancelled' },
    { orderId: 'ORD-8808', customer: 'George Lucas', items: 'Star Wars Merchandise', amount: '₹150.00', date: '2023-11-04', status: 'Delivered' },
    { orderId: 'ORD-8809', customer: 'Hannah Baker', items: 'Notebooks, Pens', amount: '₹12.00', date: '2023-10-27', status: 'Processing' },
    { orderId: 'ORD-8810', customer: 'Ian Wright', items: 'Football, Sports Gear', amount: '₹85.00', date: '2023-11-05', status: 'Delivered' },
];

const CustomerOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const limit = 5; // Low limit for visible pagination testing

    const filtered = CUSTOMER_ORDERS_MOCK.filter(o => {
        const matchesSearch = o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.orderId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedOrders = filtered.slice((page - 1) * limit, page * limit);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPage(1);
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                <Clock size={20} />
                            </div>
                            <h5 className="mb-0 fw-bold">Customer Orders History</h5>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
                            <InputGroup className="shadow-sm border-0" style={{ maxWidth: '280px' }}>
                                <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Order ID, Customer..."
                                    className="border-start-0 ps-0 shadow-none py-2"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                />
                            </InputGroup>

                            <Dropdown align="end">
                                <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 border shadow-sm px-3 py-2">
                                    <Filter size={18} className="text-muted" />
                                    <span className="small fw-medium d-none d-sm-inline">Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="border-0 shadow-lg p-2 rounded-xl" style={{ minWidth: '180px' }}>
                                    <div className="px-2 py-1 mb-1 border-bottom">
                                        <span className="text-muted small fw-bold text-uppercase">Filter Status</span>
                                    </div>
                                    {['all', 'Delivered', 'Processing', 'Cancelled'].map(s => (
                                        <Dropdown.Item
                                            key={s}
                                            onClick={() => { setStatusFilter(s); setPage(1); }}
                                            className={`rounded-lg py-2 small fw-medium mb-1 ${statusFilter === s ? 'bg-primary text-white' : ''}`}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </Dropdown.Item>
                                    ))}

                                    {(searchTerm || statusFilter !== 'all') && (
                                        <>
                                            <Dropdown.Divider className="my-1 opacity-50" />
                                            <Dropdown.Item
                                                onClick={clearFilters}
                                                className="rounded-lg py-2 small fw-medium text-danger d-flex align-items-center gap-2"
                                            >
                                                <XCircle size={14} /> Reset Filters
                                            </Dropdown.Item>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Order ID</th>
                                <th className="border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Items Summary</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Amount</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? paginatedOrders.map((o, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <span className="fw-bold text-primary px-2 py-1 bg-primary bg-opacity-10 rounded cursor-pointer">{o.orderId}</span>
                                    </td>
                                    <td className="fw-semibold text-dark">{o.customer}</td>
                                    <td className="text-muted small">
                                        <div className="text-truncate" style={{ maxWidth: '180px' }}>{o.items}</div>
                                    </td>
                                    <td className="text-muted small">
                                        <div className="d-flex align-items-center gap-2">
                                            <Calendar size={14} /> {o.date}
                                        </div>
                                    </td>
                                    <td className="fw-bold">{o.amount}</td>
                                    <td>
                                        <Badge
                                            bg={o.status === 'Delivered' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}
                                            className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                        >
                                            {o.status}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted small">
                                        No matching orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                    <div className="text-secondary small">
                        Showing <span className="fw-semibold text-dark">{totalFiltered > 0 ? ((page - 1) * limit) + 1 : 0}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> orders
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
                                            variant={page === p ? 'primary' : 'light'}
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
            </Card>
        </div>
    );
};

export default CustomerOrders;
