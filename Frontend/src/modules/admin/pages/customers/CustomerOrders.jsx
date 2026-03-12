import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, XCircle, Clock, Loader2, Package } from 'lucide-react';
import { getAllOrdersAdmin } from '../../api/orderApi';
import { toast } from 'react-toastify';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const limit = 10;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: searchTerm,
                status: statusFilter === 'all' ? undefined : statusFilter.toLowerCase()
            };
            
            const data = await getAllOrdersAdmin(params);
            
            if (data && data.orders) {
                setOrders(data.orders);
                setPagination(data.pagination);
            } else {
                setOrders([]);
                setPagination({ total: 0, totalPages: 1 });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 400);
        return () => clearTimeout(timer);
    }, [page, statusFilter, searchTerm]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPage(1);
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'delivered': return <Badge bg="success" className="rounded-pill fw-bold text-[9px] uppercase tracking-wider px-3">Delivered</Badge>;
            case 'cancelled': return <Badge bg="danger" className="rounded-pill fw-bold text-[9px] uppercase tracking-wider px-3">Cancelled</Badge>;
            case 'pending': return <Badge bg="warning" className="text-dark rounded-pill fw-bold text-[9px] uppercase tracking-wider px-3">Pending</Badge>;
            case 'confirmed': return <Badge bg="primary" className="rounded-pill fw-bold text-[9px] uppercase tracking-wider px-3">Confirmed</Badge>;
            case 'preparing': return <Badge bg="info" className="rounded-pill fw-bold text-[9px] uppercase tracking-wider px-3 text-white">Preparing</Badge>;
            default: return <Badge bg="secondary" className="rounded-pill fw-bold text-[9px] uppercase tracking-wider px-3">{status}</Badge>;
        }
    };

    return (
        <div className="p-4 space-y-4">
            <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm shadow-primary/5">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h5 className="mb-0 font-black text-gray-800">Order Audit</h5>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global Customer Transactions</p>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
                            <InputGroup className="bg-gray-50 border-0 rounded-xl overflow-hidden" style={{ maxWidth: '300px' }}>
                                <InputGroup.Text className="bg-transparent border-0 text-muted ps-3"><Search size={16} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Order ID, Customer..."
                                    className="bg-transparent border-0 shadow-none py-2.5 text-xs font-bold"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                />
                            </InputGroup>

                            <Dropdown align="end">
                                <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 border-0 bg-gray-50 rounded-xl px-4 py-2.5 shadow-none hover:bg-gray-100 font-bold text-xs transition-all">
                                    <Filter size={16} className="text-muted" />
                                    <span>{statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="border-0 shadow-xl p-2 rounded-2xl mt-2 animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                        <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Transaction Status</span>
                                    </div>
                                    {['all', 'Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'].map(s => (
                                        <Dropdown.Item
                                            key={s}
                                            onClick={() => { setStatusFilter(s); setPage(1); }}
                                            className={`rounded-xl py-2 text-xs font-bold mb-0.5 ${statusFilter === s ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {s}
                                        </Dropdown.Item>
                                    ))}

                                    {(searchTerm || statusFilter !== 'all') && (
                                        <>
                                            <Dropdown.Divider className="my-1 opacity-50" />
                                            <Dropdown.Item
                                                onClick={clearFilters}
                                                className="rounded-xl py-2 text-[10px] font-black text-rose-500 hover:bg-rose-50 d-flex align-items-center gap-2 uppercase tracking-wider"
                                            >
                                                <XCircle size={14} /> Clear Scan
                                            </Dropdown.Item>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="ps-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-0">Reference</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-0">Customer</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-0">Cargo Manifest</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-0 text-center">Amount</th>
                                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-0 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="d-flex flex-column align-items-center gap-3">
                                                <div className="relative">
                                                    <Loader2 size={32} className="text-primary animate-spin" />
                                                    <div className="absolute inset-0 d-flex align-items-center justify-center opacity-20">
                                                        <Clock size={12} />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em]">Synchronizing Stream...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length > 0 ? orders.map((o) => (
                                    <tr key={o._id} className="group hover:bg-gray-50/40 transition-all duration-300">
                                        <td className="ps-6 py-4">
                                            <div className="d-flex flex-column">
                                                <span className="text-[11px] font-black text-primary tracking-widest mb-0.5">#{o.orderId}</span>
                                                <span className="text-[9px] text-gray-400 font-bold flex align-items-center gap-1">
                                                    <Calendar size={10} /> {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex flex-column">
                                                <span className="text-xs font-black text-gray-800">{o.user?.name || 'Guest User'}</span>
                                                <span className="text-[10px] text-gray-400 font-medium italic">{o.user?.phone || 'No phone'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="p-1.5 bg-gray-50 rounded text-gray-400 group-hover:text-primary transition-colors">
                                                    <Package size={14} />
                                                </div>
                                                <div className="text-[11px] font-bold text-gray-600 text-truncate" style={{ maxWidth: '200px' }}>
                                                    {o.items?.map(i => i.name || 'Product').join(', ')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-sm font-black text-gray-800">₹{o.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            {getStatusBadge(o.status)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="d-flex flex-column align-items-center gap-3 opacity-30">
                                                <XCircle size={40} className="text-gray-300" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">No matching logs in archive</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-gray-50/30 border-top px-6 py-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Scan Log: <span className="text-primary">{((page - 1) * limit) + 1}</span> - <span className="text-primary">{Math.min(page * limit, pagination.total)}</span> / <span className="text-primary">{pagination.total}</span> entries
                        </span>
                        
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center w-8 h-8 rounded-lg border-0 bg-white shadow-sm transition-all hover:scale-110 ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary hover:text-white'}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={14} />
                            </Button>

                            <div className="px-4 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <span className="text-xs font-black text-primary">{page} <span className="text-gray-300 mx-1">/</span> {pagination.totalPages}</span>
                            </div>

                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center w-8 h-8 rounded-lg border-0 bg-white shadow-sm transition-all hover:scale-110 ${page === pagination.totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary hover:text-white'}`}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CustomerOrders;
