import React, { useState } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ADJUSTMENTS_MOCK = [
    { id: 'ADJ-001', date: '2023-11-01', product: 'Wireless Mouse', type: 'Addition', quantity: 50, reason: 'New Stock Arrival', user: 'Admin' },
    { id: 'ADJ-002', date: '2023-10-31', product: 'Keyboard', type: 'Deduction', quantity: 2, reason: 'Damaged Goods', user: 'Admin' },
    { id: 'ADJ-003', date: '2023-10-30', product: 'USB Cable', type: 'Deduction', quantity: 5, reason: 'Inventory Correction', user: 'Manager' },
];

const StockAdjustments = () => {
    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Stock Adjustments History</h5>
                    <Button variant="primary" className="d-flex align-items-center justify-content-center gap-2 responsive-btn">
                        <Plus size={18} /> New Adjustment
                    </Button>
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
                                <th className="border-0 py-3">Type</th>
                                <th className="border-0 py-3">Quantity</th>
                                <th className="border-0 py-3">Reason</th>
                                <th className="border-0 py-3 text-end pe-4">User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ADJUSTMENTS_MOCK.map((adj, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-medium text-secondary">{adj.id}</td>
                                    <td className="text-muted small">{adj.date}</td>
                                    <td className="fw-bold text-dark">{adj.product}</td>
                                    <td>
                                        <Badge bg={adj.type === 'Addition' ? 'success' : 'danger'} className="rounded-pill px-3 fw-normal bg-opacity-10 text-reset border">
                                            {adj.type === 'Addition' ? <ArrowUpRight size={14} className="text-success me-1" /> : <ArrowDownRight size={14} className="text-danger me-1" />}
                                            {adj.type}
                                        </Badge>
                                    </td>
                                    <td className={`fw-bold ${adj.type === 'Addition' ? 'text-success' : 'text-danger'}`}>
                                        {adj.type === 'Addition' ? '+' : '-'}{adj.quantity}
                                    </td>
                                    <td>{adj.reason}</td>
                                    <td className="text-end pe-4 text-muted small">{adj.user}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default StockAdjustments;
