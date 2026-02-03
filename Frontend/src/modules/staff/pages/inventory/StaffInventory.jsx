import React, { useState } from 'react';
import { Card, Table, Badge, ProgressBar, Button } from 'react-bootstrap';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

const MOCK_STOCK = [
    { id: 1, name: 'Amul Butter 500g', stock: 5, min: 20, status: 'Critical' },
    { id: 2, name: 'Fortune Oil 1L', stock: 12, min: 25, status: 'Low' },
    { id: 3, name: 'Tata Salt 1kg', stock: 8, min: 30, status: 'Critical' },
];

const StaffInventory = () => {
    const handleSyncStock = () => {
        Swal.fire({
            title: 'Syncing Inventory',
            text: 'Updating stock levels from the main server...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Simulate network request
        setTimeout(() => {
            Swal.fire({
                title: 'Synced!',
                text: 'Inventory data has been successfully updated.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }, 1500);
    };

    return (
        <div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Inventory Status</h4>
                <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm"
                    onClick={handleSyncStock}
                >
                    <RefreshCw size={16} /> Sync Stock
                </Button>
            </div>

            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <AlertTriangle className="flex-shrink-0 me-2" size={20} />
                <div>
                    <strong>Action Required:</strong> There are 3 items below critical stock levels. Please verify physically.
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="fw-bold mb-0">Low Stock Items</h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Product Name</th>
                                <th className="py-3 border-0">Current Stock</th>
                                <th className="py-3 border-0" style={{ width: '30%' }}>Level</th>
                                <th className="py-3 border-0 text-end pe-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_STOCK.map((item) => (
                                <tr key={item.id}>
                                    <td className="ps-4 fw-medium">{item.name}</td>
                                    <td className="fw-bold">{item.stock} / {item.min}</td>
                                    <td>
                                        <ProgressBar
                                            now={(item.stock / item.min) * 100}
                                            variant={item.status === 'Critical' ? 'danger' : 'warning'}
                                            style={{ height: '6px' }}
                                        />
                                    </td>
                                    <td className="text-end pe-4">
                                        <Badge
                                            bg={item.status === 'Critical' ? 'danger' : 'warning'}
                                            className="rounded-pill px-3 fw-normal"
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

export default StaffInventory;
