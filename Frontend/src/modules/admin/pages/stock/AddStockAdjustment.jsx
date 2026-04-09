import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { Save, X, ArrowLeft, Search, Package, Layers, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, bulkAdjustInventory } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField, IconButton } from '@mui/material';

const AddStockAdjustment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [formData, setFormData] = useState({
        branchId: '',
        type: 'Addition',
        reason: 'New Stock Arrival',
        notes: '',
        commonAmount: ''
    });

    const [individualAmounts, setIndividualAmounts] = useState({});

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
                // Fetch ALL products for search (filter vendor products server-side or here)
                const [productsData, branchesData] = await Promise.all([
                    getProducts(adminUser.token, { limit: 1000 }), 
                    getBranches(adminUser.token)
                ]);
                
                // Exclude vendor products
                const adminProducts = (productsData.products || []).filter(p => !p.vendor);
                setProducts(adminProducts);
                
                const activeBranches = branchesData.filter(b => b.isActive);
                setBranches(activeBranches);

                // Handle Pre-selection from Location State
                if (location.state) {
                    if (location.state.productId) {
                        const preSelected = adminProducts.find(p => p._id === location.state.productId);
                        if (preSelected) {
                            setSelectedProducts([preSelected]);
                        }
                    }
                    if (location.state.branchId) {
                        const targetBranchId = typeof location.state.branchId === 'object' 
                            ? (location.state.branchId._id || location.state.branchId.id) 
                            : location.state.branchId;
                            
                        setFormData(prev => ({ 
                            ...prev, 
                            branchId: String(targetBranchId), // Ensure string for select comparison
                            type: location.state.type || 'Addition',
                            reason: location.state.reason || 'New Stock Arrival'
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(t('stock.add_adjustment.alerts.load_error'));
            } finally {
                setInitialLoading(false);
            }
        };

        if (adminUser?.token) fetchInitialData();
    }, [adminUser, t, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (event, newValue) => {
        setSelectedProducts(newValue);
    };

    const handleAmountChange = (productId, amount) => {
        setIndividualAmounts(prev => ({ ...prev, [productId]: amount }));
    };

    const removeProduct = (id) => {
        setSelectedProducts(prev => prev.filter(p => p._id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedProducts.length === 0 || !formData.branchId || !formData.reason) {
            toast.warning(t('stock.add_adjustment.alerts.validation'));
            return;
        }

        setLoading(true);
        try {
            const adjustments = selectedProducts.map(p => ({
                productId: p._id,
                branchId: formData.branchId,
                amount: Number(individualAmounts[p._id] || formData.commonAmount || 0)
            }));

            // Validate amounts
            if (adjustments.some(a => a.amount === 0 && formData.type !== 'Audit')) {
                toast.warning(t('stock.add_adjustment.alerts.qty_required'));
                setLoading(false);
                return;
            }

            await bulkAdjustInventory(adminUser.token, {
                adjustments,
                commonData: {
                    type: formData.type,
                    reason: formData.reason,
                    notes: formData.notes
                }
            });

            toast.success(t('stock.add_adjustment.alerts.success'));
            navigate('/admin/stock/adjustments');
        } catch (error) {
            toast.error(error.message || t('stock.add_adjustment.alerts.error'));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">{t('stock.add_adjustment.preparing')}</p>
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <Button variant="light" size="sm" onClick={() => navigate('/admin/stock/adjustments')} className="rounded-circle p-2 shadow-sm">
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h4 className="fw-bold mb-0">{t('stock.add_adjustment.title')}</h4>
                        <p className="text-muted small mb-0">{t('stock.add_adjustment.subtitle')}</p>
                    </div>
                </div>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                                    <Package size={18} /> {t('stock.add_adjustment.step1')}
                                </h6>
                                
                                <Autocomplete
                                    multiple
                                    options={products}
                                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                    value={selectedProducts}
                                    onChange={handleProductSelect}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label={t('stock.add_adjustment.search_placeholder')}
                                            placeholder={t('stock.add_adjustment.table.product')}
                                            fullWidth
                                        />
                                    )}
                                    className="mb-4"
                                />

                                {selectedProducts.length > 0 && (
                                    <div className="mt-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="small fw-bold text-muted">{t('stock.add_adjustment.selected_items', { count: selectedProducts.length })}</span>
                                            {selectedProducts.length > 1 && (
                                                <Form.Group className="d-flex align-items-center gap-2">
                                                    <Form.Label className="mb-0 small text-nowrap">{t('stock.add_adjustment.set_common_qty')}</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        size="sm" 
                                                        style={{ width: '80px' }} 
                                                        value={formData.commonAmount}
                                                        placeholder={t('stock.add_adjustment.qty_placeholder')}
                                                        onChange={(e) => setFormData({...formData, commonAmount: e.target.value})}
                                                    />
                                                </Form.Group>
                                            )}
                                        </div>
                                        <div className="table-responsive rounded border">
                                            <Table hover className="align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr className="small text-muted">
                                                        <th className="ps-3">{t('stock.add_adjustment.table.product')}</th>
                                                        <th className="text-center">{t('stock.add_adjustment.table.quantity')}</th>
                                                        <th className="text-end pe-3">{t('stock.add_adjustment.table.remove')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedProducts.map(p => (
                                                        <tr key={p._id}>
                                                            <td className="ps-3">
                                                                 <div className="d-flex align-items-center gap-2">
                                                                     <div className="rounded bg-light border p-1">
                                                                          <img src={p.image || '/placeholder.png'} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                                                     </div>
                                                                     <div>
                                                                         <div className="fw-bold small">{p.name}</div>
                                                                         <div className="extra-small text-muted">{p.sku}</div>
                                                                     </div>
                                                                 </div>
                                                            </td>
                                                            <td className="text-center" style={{ width: '120px' }}>
                                                                <Form.Control 
                                                                    type="number" 
                                                                    size="sm" 
                                                                    className="text-center fw-bold"
                                                                    placeholder={formData.commonAmount || "0"}
                                                                    value={individualAmounts[p._id] || ''}
                                                                    onChange={(e) => handleAmountChange(p._id, e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-end pe-3">
                                                                <IconButton size="small" color="error" onClick={() => removeProduct(p._id)}>
                                                                    <Trash2 size={16} />
                                                                </IconButton>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                                    <Layers size={18} /> {t('stock.add_adjustment.step2')}
                                </h6>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">{t('stock.add_adjustment.target_branch')} <span className="text-danger">*</span></Form.Label>
                                    <Form.Select 
                                        name="branchId" 
                                        value={formData.branchId} 
                                        onChange={handleChange} 
                                        required 
                                        className="shadow-none border-secondary-subtle"
                                    >
                                        <option value="">{t('stock.add_adjustment.select_branch')}</option>
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">{t('stock.add_adjustment.adjustment_type')} <span className="text-danger">*</span></Form.Label>
                                    <Form.Select 
                                        name="type" 
                                        value={formData.type} 
                                        onChange={handleChange}
                                        className="shadow-none border-secondary-subtle"
                                    >
                                        <option value="Addition">{t('stock.add_adjustment.types.addition')}</option>
                                        <option value="Deduction">{t('stock.add_adjustment.types.deduction')}</option>
                                        <option value="Damage">{t('stock.add_adjustment.types.damage')}</option>
                                        <option value="Return">{t('stock.add_adjustment.types.return')}</option>
                                        <option value="Audit">{t('stock.add_adjustment.types.audit')}</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">{t('stock.add_adjustment.reason')} <span className="text-danger">*</span></Form.Label>
                                    <Form.Select 
                                        name="reason" 
                                        value={formData.reason} 
                                        onChange={handleChange} 
                                        required
                                        className="shadow-none border-secondary-subtle"
                                    >
                                        <option value="">{t('stock.add_adjustment.select_reason')}</option>
                                        {REASONS.map((r, idx) => {
                                            const map = {
                                                'new stock arrival': 'arrival',
                                                'damaged goods': 'damaged',
                                                'inventory correction': 'correction',
                                                'return': 'return',
                                                'theft/loss': 'loss',
                                                'audit': 'audit',
                                                'other': 'other'
                                            };
                                            return (
                                                <option key={idx} value={r}>{t(`stock.add_adjustment.reasons.${map[r.toLowerCase()] || 'other'}`)}</option>
                                            );
                                        })}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">{t('stock.add_adjustment.notes')}</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder={t('stock.add_adjustment.notes_placeholder')}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="shadow-none border-secondary-subtle"
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="primary" 
                                        size="lg" 
                                        type="submit" 
                                        className="d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 py-3"
                                        disabled={loading || selectedProducts.length === 0}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />}
                                        {loading ? t('stock.add_adjustment.processing') : t('stock.add_adjustment.submit_btn', { count: selectedProducts.length })}
                                    </Button>
                                    <Button variant="light" onClick={() => navigate('/admin/stock/adjustments')} disabled={loading}>
                                        {t('stock.add_adjustment.cancel')}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AddStockAdjustment;
