import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Package, RefreshCw, AlertCircle } from 'lucide-react';
import { adjustInventory } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { toast } from 'react-toastify';

const RestockModal = ({ show, onHide, product, onRestockSuccess }) => {
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();

    const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Addition');
    const [reason, setReason] = useState('');
    const [branchId, setBranchId] = useState('');
    const [loading, setLoading] = useState(false);
    const isVendorProduct = Boolean(product?.vendor);

    useEffect(() => {
        if (show) {
            setAmount('');
            setType('Addition');
            setReason('');
            // Set initial branch if product has branches
            if (!isVendorProduct && product?.branchStocks?.length > 0) {
                setBranchId(product.branchStocks[0].branchId._id || product.branchStocks[0].branchId);
            } else {
                setBranchId('');
            }
        }
    }, [show, product, isVendorProduct]);

    const getSelectedStock = () => {
        if (!product) return 0;
        if (isVendorProduct) return product.stock || 0;
        if (!branchId) return 0;
        const bs = product.branchStocks.find(s => (s.branchId._id || s.branchId) === branchId);
        return bs ? bs.stock : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVendorProduct && !branchId) return toast.warning('Please select a branch');
        if (!amount || amount <= 0) return toast.warning('Please enter a valid amount');
        if (!reason) return toast.warning('Please provide a reason for adjustment');

        setLoading(true);
        try {
            const result = await adjustInventory(adminUser.token, product._id, {
                amount: Number(amount),
                type,
                reason,
                branchId,
                storeType: isVendorProduct ? 'vendor' : 'branch'
            });
            toast.success(`Inventory updated: ${product.name}`);
            if (onRestockSuccess) onRestockSuccess(result.product);
            onHide();
        } catch (error) {
            toast.error(error.message || 'Failed to adjust inventory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Package className="text-primary" size={24} />
                    Inventory Adjustment
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {product && (
                    <div className="mb-4 p-3 bg-light rounded-3 border">
                        <div className="text-xs text-uppercase fw-bold text-muted mb-1">Target Product</div>
                        <div className="fw-bold text-dark">{product.name}</div>
                        <div className="text-sm text-secondary font-monospace mb-2">{product.sku}</div>

                        {!isVendorProduct ? (
                            <Form.Group className="mb-2">
                                <Form.Label className="fw-bold small mb-1">Select Branch</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="border-secondary"
                                >
                                    <option value="">Select Branch...</option>
                                    {product.branchStocks.map(bs => (
                                        <option key={bs.branchId._id || bs.branchId} value={bs.branchId._id || bs.branchId}>
                                            {bs.branchId.name || 'Unknown Branch'} (Current: {bs.stock})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        ) : (
                            <div className="mb-2 small text-muted">
                                Vendor: <span className="fw-bold text-dark">{product.vendor?.storeName || 'Vendor Store'}</span>
                            </div>
                        )}

                        <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-2">
                            <span className="text-sm">{isVendorProduct ? 'Vendor Stock:' : 'Stock in Selected Branch:'}</span>
                            <span className={`fw-bold ${getSelectedStock() <= 10 ? 'text-danger' : 'text-success'}`}>
                                {getSelectedStock()} {product.unitType || 'pcs'}
                            </span>
                        </div>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">Adjustment Type</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="Addition">📦 Stock Addition (Purchase/Restock)</option>
                            <option value="Return">🔄 Customer Return</option>
                            <option value="Deduction">📤 Manual Deduction</option>
                            <option value="Damage">️ Damaged / Expired</option>
                            <option value="Audit">️ Inventory Audit (Set Exact)</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">
                            {type === 'Audit' ? 'Exact Current Count' : 'Quantity Change'}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="e.g. 50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">Reason / Note</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="e.g. New stock from supplier XYZ"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                        disabled={loading || (!isVendorProduct && !branchId)}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : <RefreshCw size={18} />}
                        Confirm Adjustment
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RestockModal;
