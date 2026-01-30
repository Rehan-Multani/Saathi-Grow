import React from 'react';
import { Card, Table, Button, ProgressBar } from 'react-bootstrap';
import { AlertTriangle, ShoppingCart } from 'lucide-react';

const LOW_STOCK_MOCK = [
    { product: 'Mechanical Keyboard', sku: 'ELEC-KEY-002', current: 12, minLevel: 20, status: 'Critical' },
    { product: 'Wireless Mouse', sku: 'ELEC-MOU-001', current: 10, minLevel: 15, status: 'Warning' },
    { product: 'USB-C Cable (1m)', sku: 'ACC-CAB-005', current: 5, minLevel: 50, status: 'Critical' },
];

const LowStockAlerts = () => {
    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4 bg-danger bg-opacity-10">
                <Card.Body className="d-flex align-items-center gap-3">
                    <div className="bg-danger text-white p-3 rounded-circle">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h5 className="fw-bold text-danger mb-1">Action Required: 3 Products Critical</h5>
                        <p className="mb-0 text-muted small">These items are below their minimum stock levels. Restock immediately to avoid losing sales.</p>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">Low Stock Reports</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Product Info</th>
                                <th className="border-0 py-3">Stock Level</th>
                                <th className="border-0 py-3 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LOW_STOCK_MOCK.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.product}</div>
                                        <div className="small text-muted text-monospace">{item.sku}</div>
                                    </td>
                                    <td style={{ minWidth: '200px' }}>
                                        <div className="d-flex justify-content-between mb-1 small">
                                            <span className="fw-bold text-danger">{item.current} items left</span>
                                            <span className="text-muted">Min: {item.minLevel}</span>
                                        </div>
                                        <ProgressBar
                                            now={(item.current / item.minLevel) * 100}
                                            variant="danger"
                                            style={{ height: '6px' }}
                                            className="bg-danger bg-opacity-10"
                                        />
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button size="sm" variant="primary" className="d-flex align-items-center gap-2 ms-auto">
                                            <ShoppingCart size={14} /> Reorder Now
                                        </Button>
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

export default LowStockAlerts;
