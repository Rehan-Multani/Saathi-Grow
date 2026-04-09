import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Package, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adjustInventory } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { toast } from 'react-toastify';

const RestockModal = ({ show, onHide, product, onRestockSuccess }) => {
    const { t } = useTranslation();
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
            } else if (product?.vendor) {
                setBranchId('vendor');
            } else {
                setBranchId('');
            }
        }
    }, [show, product, isVendorProduct]);

    const getSelectedBranchStock = () => {
        if (!product || !branchId) return 0;
        if (branchId === 'vendor') return product.stock || 0;
        const bs = product.branchStocks.find(s => (s.branchId._id || s.branchId) === branchId);
        return bs ? bs.stock : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVendorProduct && !branchId) return toast.warning(t('products.restock_modal.alerts.select_branch'));
        if (!amount || amount <= 0) return toast.warning(t('products.restock_modal.alerts.valid_amount'));
        if (!reason) return toast.warning(t('products.restock_modal.alerts.provide_reason'));

        setLoading(true);
        try {
            const result = await adjustInventory(adminUser.token, product._id, {
                amount: Number(amount),
                type,
                reason,
                branchId: branchId === 'vendor' ? null : branchId
            });
            toast.success(t('products.restock_modal.alerts.update_success', { name: product.name }));
            if (onRestockSuccess) onRestockSuccess(result.product);
            onHide();
        } catch (error) {
            toast.error(error.message || t('products.restock_modal.alerts.update_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Package className="text-primary" size={24} />
                    {t('products.restock_modal.title')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {product && (
                    <div className="mb-4 p-3 bg-light rounded-3 border">
                        <div className="text-xs text-uppercase fw-bold text-muted mb-1">{t('products.restock_modal.target_product')}</div>
                        <div className="fw-bold text-dark">{product.name}</div>
                        <div className="text-sm text-secondary font-monospace mb-2">{product.sku}</div>

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold small mb-1">{t('products.restock_modal.target_storage')}</Form.Label>
                            <Form.Select
                                size="sm"
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                                className="border-secondary"
                            >
                                <option value="">{t('products.restock_modal.select_placeholder')}</option>
                                {product.vendor && (
                                    <option value="vendor">{t('products.restock_modal.vendor_stock', { name: product.vendor.storeName })}</option>
                                )}
                                {product.branchStocks?.map(bs => (
                                    <option key={bs.branchId._id || bs.branchId} value={bs.branchId._id || bs.branchId}>
                                        {t('products.restock_modal.branch_info', { name: bs.branchId.name || 'Unknown', stock: bs.stock })}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-2">
                            <span className="text-sm">{t('products.restock_modal.current_stock')}</span>
                            <span className={`fw-bold ${getSelectedBranchStock() <= 10 ? 'text-danger' : 'text-success'}`}>
                                {getSelectedBranchStock()} {product.unitType || 'pcs'}
                            </span>
                        </div>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">{t('products.restock_modal.adjustment_type')}</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="Addition">{t('products.restock_modal.type_options.addition')}</option>
                            <option value="Return">{t('products.restock_modal.type_options.return')}</option>
                            <option value="Deduction">{t('products.restock_modal.type_options.deduction')}</option>
                            <option value="Damage">{t('products.restock_modal.type_options.damage')}</option>
                            <option value="Audit">{t('products.restock_modal.type_options.audit')}</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">
                            {type === 'Audit' ? t('products.restock_modal.exact_count') : t('products.restock_modal.qty_change')}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="e.g. 50"
                            value={amount}
                            onFocus={(e) => { if (amount === 0 || amount === "0") setAmount("") }}
                            onBlur={(e) => { if (amount === "" || amount === null) setAmount(0) }}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">{t('products.restock_modal.reason_label')}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder={t('products.restock_modal.reason_placeholder')}
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
                        {t('products.restock_modal.confirm_btn')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RestockModal;
