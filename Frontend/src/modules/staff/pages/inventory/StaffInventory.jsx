import React, { useState } from 'react';
import { Card, Table, Badge, ProgressBar, Button } from 'react-bootstrap';
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

const MOCK_STOCK = [
    { id: 1, name: 'Amul Butter 500g', stock: 5, min: 20, status: 'Critical' },
    { id: 2, name: 'Fortune Oil 1L', stock: 12, min: 25, status: 'Low' },
    { id: 3, name: 'Tata Salt 1kg', stock: 8, min: 30, status: 'Critical' },
];

const StaffInventory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalPages = Math.ceil(MOCK_STOCK.length / itemsPerPage);
    const paginatedStock = MOCK_STOCK.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                            {paginatedStock.map((item) => (
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
                {MOCK_STOCK.length > 0 && (
                    <Card.Footer className="bg-white border-top-0 py-3 px-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small">
                                Showing <span className="fw-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, MOCK_STOCK.length)}</span> to <span className="fw-bold">{Math.min(currentPage * itemsPerPage, MOCK_STOCK.length)}</span> of <span className="fw-bold">{MOCK_STOCK.length}</span> items
                            </div>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="border shadow-sm px-3"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "primary" : "light"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={`border shadow-sm px-3 ${currentPage === page ? 'text-white' : ''}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="border shadow-sm px-3"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card.Footer>
                )}
            </Card>
        </div>
    );
};

export default StaffInventory;
