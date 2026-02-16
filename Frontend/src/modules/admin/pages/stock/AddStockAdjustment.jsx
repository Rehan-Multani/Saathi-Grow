import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, adjustInventory } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const AddStockAdjustment = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);

    const [formData, setFormData] = useState({
        productId: '',
        branchId: '',
        type: 'Addition', // Addition, Deduction, Damage, Return
        amount: '',
        reason: '',
        notes: ''
    });

    const REASONS = [
        'New Stock Arrival',
        'Damaged Goods',
        'Inventory Correction',
        'Return',
        'Theft/Loss',
        'Audit',
        'Other'
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productsData, branchesData] = await Promise.all([
                    getProducts(adminUser.token),
                    getBranches(adminUser.token)
                ]);
                setProducts(productsData);
                setBranches(branchesData.filter(b => b.isActive));
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load products and branches');
            } finally {
                setInitialLoading(false);
            }
        };

        if (adminUser?.token) fetchInitialData();
    }, [adminUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.productId || !formData.branchId || !formData.amount || !formData.reason) {
            toast.warning('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await adjustInventory(adminUser.token, formData.productId, {
                amount: Number(formData.amount),
                type: formData.type,
                reason: formData.reason + (formData.notes ? ` - ${formData.notes}` : ''),
                branchId: formData.branchId
            });
            toast.success('Stock adjusted successfully');
            navigate('/admin/stock/adjustments');
        } catch (error) {
            toast.error(error.message || 'Failed to adjust stock');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="text-center py-10">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted text-sm">Loading form data...</p>
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-2 w-100 w-sm-auto text-nowrap">
                    <Button variant="light" size="sm" onClick={() => navigate('/admin/stock/adjustments')} className="rounded-circle p-2 shadow-sm">
                        <ArrowLeft size={18} />
                    </Button>
                    <h4 className="fw-bold mb-0">New Stock Adjustment</h4>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/stock/adjustments')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={8} className="mx-auto">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Select Product <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="productId" value={formData.productId} onChange={handleChange} required>
                                                <option value="">Choose Product...</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Select Branch <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="branchId" value={formData.branchId} onChange={handleChange} required>
                                                <option value="">{formData.productId ? 'Choose Branch...' : 'Select Product First'}</option>
                                                {branches.filter(b => {
                                                    if (!formData.productId) return false;
                                                    const selectedProduct = products.find(p => p._id === formData.productId);
                                                    if (!selectedProduct) return false;
                                                    // Check if branch exists in product's branchStocks
                                                    return selectedProduct.branchStocks?.some(bs => {
                                                        const bid = bs.branchId?._id || bs.branchId;
                                                        return bid.toString() === b._id.toString();
                                                    });
                                                }).map(b => (
                                                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                                                ))}
                                            </Form.Select>
                                            {formData.productId && branches.filter(b => {
                                                const selectedProduct = products.find(p => p._id === formData.productId);
                                                return selectedProduct?.branchStocks?.some(bs => (bs.branchId?._id || bs.branchId).toString() === b._id.toString());
                                            }).length === 0 && (
                                                    <Form.Text className="text-danger">
                                                        This product is not assigned to any branch. Edit the product to add branches.
                                                    </Form.Text>
                                                )}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Adjustment Type <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                                <option value="Addition">Addition (+)</option>
                                                <option value="Deduction">Deduction (-)</option>
                                                <option value="Damage">Damage (-)</option>
                                                <option value="Return">Return (+)</option>
                                                <option value="Audit">Audit (Direct Set)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quantity/New Stock <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                placeholder="Enter quantity"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleChange}
                                                required
                                            />
                                            <Form.Text className="text-muted small">
                                                For 'Audit' type, enter the actual total stock. For others, enter the change amount.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="reason" value={formData.reason} onChange={handleChange} required>
                                                <option value="">Select Reason...</option>
                                                {REASONS.map((r, idx) => (
                                                    <option key={idx} value={r}>{r}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Notes (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add any additional details here..."
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <div className="d-flex flex-column flex-sm-row justify-content-end gap-3 mt-4">
                                    <Button variant="light" size="lg" onClick={() => navigate('/admin/stock/adjustments')} className="w-100 w-sm-auto order-2 order-sm-1" disabled={loading}>Cancel</Button>
                                    <Button variant="primary" size="lg" type="submit" className="d-flex align-items-center justify-content-center gap-2 px-4 w-100 w-sm-auto shadow-sm order-1 order-sm-2" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={22} />}
                                        {loading ? 'Processing...' : 'Save Adjustment'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddStockAdjustment;
