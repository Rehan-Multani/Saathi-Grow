import React, { useState } from 'react';
import { Card, Table, Button, ProgressBar } from 'react-bootstrap';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';
import RestockModal from '../../components/products/RestockModal';

const LOW_STOCK_MOCK = [
    { id: '101', product: 'Mechanical Keyboard', sku: 'ELEC-KEY-002', branch: 'Main Branch', current: 12, minLevel: 20, status: 'Critical', stock: 12 },
    { id: '102', product: 'Wireless Mouse', sku: 'ELEC-MOU-001', branch: 'Downtown Store', current: 10, minLevel: 15, status: 'Warning', stock: 10 },
    { id: '103', product: 'USB-C Cable (1m)', sku: 'ACC-CAB-005', branch: 'Warehouse A', current: 5, minLevel: 50, status: 'Critical', stock: 5 },
];

const LowStockAlerts = () => {
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [alertsList, setAlertsList] = useState(LOW_STOCK_MOCK);

    const handleRestockOpen = (product) => {
        // Map the alert item to a product-like object for the modal
        setSelectedProduct({
            id: product.id,
            name: product.product,
            sku: product.sku,
            stock: product.current
        });
        setShowRestockModal(true);
    };

    const handleRestockSave = async (productId, amount) => {
        // In a real app, call API to restock here
        setAlertsList(prev => prev.map(item =>
            item.id === productId ? { ...item, current: item.current + amount, stock: item.current + amount } : item
        ));
        await showSuccessAlert('Inventory Updated!', `${amount} units have been added to the stock.`);
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4 bg-danger bg-opacity-10">
                <Card.Body className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
                    <div className="bg-danger text-white p-3 rounded-circle">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h5 className="fw-bold text-danger mb-1">Action Required: {alertsList.filter(a => a.current < a.minLevel).length} Products Critical</h5>
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
                                <th className="border-0 py-3">Branch</th>
                                <th className="border-0 py-3">Stock Level</th>
                                <th className="border-0 py-3 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alertsList.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.product}</div>
                                        <div className="small text-muted text-monospace">{item.sku}</div>
                                    </td>
                                    <td className="text-muted">{item.branch}</td>
                                    <td style={{ minWidth: '200px' }}>
                                        <div className="d-flex justify-content-between mb-1 small">
                                            <span className={`fw-bold ${item.current < item.minLevel * 0.5 ? 'text-red-500' : 'text-amber-500'}`}>
                                                {item.current} items left
                                            </span>
                                            <span className="text-muted">Min: {item.minLevel}</span>
                                        </div>
                                        <ProgressBar
                                            now={Math.min(100, (item.current / item.minLevel) * 100)}
                                            variant={item.current < item.minLevel * 0.5 ? 'danger' : 'warning'}
                                            style={{ height: '6px' }}
                                            className="bg-gray-100"
                                        />
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            size="sm"
                                            variant="success"
                                            className="d-flex align-items-center justify-content-center gap-2 ms-auto responsive-btn shadow-sm text-nowrap px-3"
                                            onClick={() => handleRestockOpen(item)}
                                        >
                                            <RefreshCw size={14} /> <span>Restock</span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <RestockModal
                show={showRestockModal}
                onHide={() => setShowRestockModal(false)}
                product={selectedProduct}
                onRestock={handleRestockSave}
            />
        </div>
    );
};

export default LowStockAlerts;
