import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, MapPin, Package } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const BranchStock = () => {
    const { adminUser } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBranchWiseStock = async () => {
            try {
                const data = await getProducts(adminUser.token);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching stock:', error);
                toast.error('Failed to load branch-wise stock');
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) fetchBranchWiseStock();
    }, [adminUser]);

    // Flatten products into branch-wise list
    const branchStockList = products.reduce((acc, product) => {
        if (product.branchStocks && product.branchStocks.length > 0) {
            product.branchStocks.forEach(bs => {
                acc.push({
                    productId: product._id,
                    productName: product.name,
                    image: product.image,
                    sku: product.sku,
                    branchName: bs.branchId?.name || 'Unknown',
                    branchCode: bs.branchId?.branchCode || '',
                    location: bs.branchId?.address || 'N/A',
                    stock: bs.stock,
                    threshold: bs.lowStockThreshold,
                    status: bs.stock === 0 ? 'Out of Stock' : bs.stock <= bs.lowStockThreshold ? 'Low Stock' : 'In Stock'
                });
            });
        }
        return acc;
    }, []);

    const filtered = branchStockList.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <th className="border-0 py-3 text-center">Current Stock</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2">Loading stock data...</span>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? filtered.map((row, idx) => (
                                <tr key={`${row.productId}-${idx}`}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <MapPin size={16} className="text-primary" />
                                            <div>
                                                <div className="fw-medium text-dark">{row.branchName}</div>
                                                <div className="small text-muted">{row.branchCode}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="w-8 h-8 bg-light rounded flex items-center justify-center text-secondary font-bold overflow-hidden border">
                                                {row.image ? <img src={row.image} alt="" className="w-full h-full object-cover" /> : row.productName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-medium text-dark">{row.productName}</div>
                                                <div className="small text-muted font-monospace">{row.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`fw-bold ${row.stock <= row.threshold ? 'text-danger' : 'text-dark'}`}>
                                            {row.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            row.status === 'In Stock' ? 'success' :
                                                row.status === 'Low Stock' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3">
                                            {row.status}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">No stock data found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default BranchStock;
