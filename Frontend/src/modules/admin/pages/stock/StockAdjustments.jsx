import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllInventoryLogs } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const StockAdjustments = () => {
    const { adminUser } = useAdminAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getAllInventoryLogs(adminUser.token);
                setLogs(data);
            } catch (error) {
                console.error('Error fetching logs:', error);
                toast.error('Failed to load stock adjustments');
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) fetchLogs();
    }, [adminUser]);

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Stock Adjustments History</h5>
                    <Link to="/admin/stock/adjustments/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn">
                        <Plus size={18} /> New Adjustment
                    </Link>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Adjustment ID</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Product</th>
                                <th className="border-0 py-3">Branch</th>
                                <th className="border-0 py-3">Type</th>
                                <th className="border-0 py-3">Changed</th>
                                <th className="border-0 py-3">Quantity</th>
                                <th className="border-0 py-3">Reason</th>
                                <th className="border-0 py-3 text-end pe-4">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2">Loading logs...</span>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log, idx) => (
                                    <tr key={log._id}>
                                        <td className="ps-4">
                                            <span className="text-muted small">#{log._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(log.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-light overflow-hidden border">
                                                    {log.product?.image ? <img src={log.product.image} className="w-full h-full object-cover" alt="" /> : <span className="flex items-center justify-center h-full text-[10px]">{log.product?.name?.charAt(0)}</span>}
                                                </div>
                                                <div className="fw-bold text-dark">{log.product?.name || 'Unknown Product'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="light" className="text-secondary fw-normal border">
                                                {log.branchId?.name || 'Main'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={(log.type === 'Addition' || log.type === 'Return') ? 'success' : 'danger'} className="rounded-pill px-3 fw-normal bg-opacity-10 text-reset border">
                                                {(log.type === 'Addition' || log.type === 'Return') ? <ArrowUpRight size={14} className="text-success me-1" /> : <ArrowDownRight size={14} className="text-danger me-1" />}
                                                {log.type}
                                            </Badge>
                                        </td>
                                        <td className={`fw-bold ${(log.type === 'Addition' || log.type === 'Return') ? 'text-success' : 'text-danger'}`}>
                                            {(log.type === 'Addition' || log.type === 'Return') ? '+' : ''}{log.changeAmount}
                                        </td>
                                        <td className="fw-bold">{log.newStock}</td>
                                        <td className="small text-muted">{log.reason}</td>
                                        <td className="text-end pe-4">
                                            <div className="small fw-medium text-dark">{log.admin?.name || 'System'}</div>
                                            <div className="small text-muted" style={{ fontSize: '10px' }}>{log.admin?.email}</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-5 text-muted">No stock adjustments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default StockAdjustments;
