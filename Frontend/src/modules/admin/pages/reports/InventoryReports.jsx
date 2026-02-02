import React, { useState } from 'react';
import { Card, Table, Button, Form, ProgressBar, Badge } from 'react-bootstrap';
import { Download, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const INVENTORY_DATA = [
    { id: 'PROD-001', name: 'Fresh Apples (Kashmir)', category: 'Fruits', stock: 150, reorderLevel: 50, status: 'In Stock' },
    { id: 'PROD-002', name: 'Almond Milk 1L', category: 'Dairy', stock: 12, reorderLevel: 20, status: 'Low Stock' },
    { id: 'PROD-003', name: 'Whole Wheat Bread', category: 'Bakery', stock: 0, reorderLevel: 10, status: 'Out of Stock' },
    { id: 'PROD-004', name: 'Organic Honey 500g', category: 'Groceries', stock: 85, reorderLevel: 15, status: 'In Stock' },
];

const InventoryReports = () => {
    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Inventory Reports</h4>
                <div className="d-flex gap-2 w-100  justify-content-between justify-content-sm-end">
                    <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center">
                        <AlertTriangle size={16} /> <span className="text-nowrap">Low Stock (14)</span>
                    </Button>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center">
                        <Download size={16} /> <span className="d-none d-sm-inline">Export Stock List</span>
                        <span className="d-inline d-sm-none">Export</span>
                    </Button>
                </div>
            </div>

            {/* Inventory Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h6 className="mb-0 fw-bold">Current Stock Levels</h6>
                    <div className="d-flex align-items-center gap-2 w-100 w-sm-auto border rounded px-2 bg-light">
                        <Search size={16} className="text-muted" />
                        <Form.Control size="sm" type="search" placeholder="Search Product..." className="border-0 bg-transparent shadow-none" style={{ minWidth: '200px' }} />
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Product</th>
                                <th className="border-0 py-3">Category</th>
                                <th className="border-0 py-3" style={{ width: '200px' }}>Stock Level</th>
                                <th className="border-0 py-3 text-center">Reorder Point</th>
                                <th className="border-0 py-3 text-end pe-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {INVENTORY_DATA.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.name}</div>
                                        <div className="small text-muted">{item.id}</div>
                                    </td>
                                    <td>{item.category}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <ProgressBar
                                                now={item.stock}
                                                max={200}
                                                variant={item.stock < item.reorderLevel ? 'danger' : item.stock < item.reorderLevel * 2 ? 'warning' : 'success'}
                                                style={{ height: '6px', width: '100px' }}
                                            />
                                            <span className="small fw-bold">{item.stock}</span>
                                        </div>
                                    </td>
                                    <td className="text-center text-muted small">{item.reorderLevel} units</td>
                                    <td className="text-end pe-4">
                                        <Badge
                                            bg={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}
                                            className="rounded-pill fw-normal px-3"
                                        >
                                            {item.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default InventoryReports;
