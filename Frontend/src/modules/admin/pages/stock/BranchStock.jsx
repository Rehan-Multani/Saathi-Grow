import React, { useState } from 'react';
import { Card, Table, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, MapPin } from 'lucide-react';

const BRANCH_STOCK_MOCK = [
    { branch: 'Main Store', location: 'New York', product: 'Wireless Mouse', stock: 45, status: 'In Stock' },
    { branch: 'Main Store', location: 'New York', product: 'Keyboard', stock: 12, status: 'Low Stock' },
    { branch: 'Downtown Branch', location: 'Boston', product: 'Wireless Mouse', stock: 10, status: 'Low Stock' },
    { branch: 'Downtown Branch', location: 'Boston', product: 'Keyboard', stock: 0, status: 'Out of Stock' },
    { branch: 'Westside Hub', location: 'Chicago', product: 'USB Cable', stock: 500, status: 'In Stock' },
];

const BranchStock = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = BRANCH_STOCK_MOCK.filter(item =>
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Branch-wise Stock</h5>
                    <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search Branch or Product..."
                            className="border-start-0 ps-0 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Branch</th>
                                <th className="border-0 py-3">Product</th>
                                <th className="border-0 py-3">Current Stock</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <MapPin size={16} className="text-secondary" />
                                            <div>
                                                <div className="fw-medium text-dark">{row.branch}</div>
                                                <div className="small text-muted">{row.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-medium">{row.product}</td>
                                    <td className="fw-bold">{row.stock}</td>
                                    <td>
                                        <Badge bg={
                                            row.status === 'In Stock' ? 'success' :
                                                row.status === 'Low Stock' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3">
                                            {row.status}
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

export default BranchStock;
