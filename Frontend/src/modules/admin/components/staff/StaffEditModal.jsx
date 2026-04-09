import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save } from 'lucide-react';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTranslation } from 'react-i18next';

const StaffEditModal = ({ show, onHide, staff, onSave }) => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        branchId: '',
        isActive: true
    });

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await getBranches(adminUser.token);
                setBranches(data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        if (show) fetchBranches();
    }, [show, adminUser.token]);

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name || '',
                role: staff.role || '',
                email: staff.email || '',
                phone: staff.phone || '',
                branchId: staff.branchId?._id || staff.branchId || '',
                isActive: staff.isActive ?? true
            });
        }
    }, [staff]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal show={show} onHide={onHide} centered className="staff-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">{t('staff.edit_modal.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">{t('staff.edit_modal.name_label')}</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-light border-0 py-2 shadow-none"
                            placeholder={t('staff.edit_modal.name_placeholder')}
                            required
                        />
                    </div>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">{t('staff.edit_modal.role_label')}</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={adminUser.role === 'Branch Manager'}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            >
                                <option value="Staff">{t('staff.permissions.staff', { defaultValue: 'Staff' })}</option>
                                <option value="Branch Manager">{t('staff.permissions.store_manager', { defaultValue: 'Store Manager' })}</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">{t('staff.edit_modal.branch_label')}</Form.Label>
                            <Form.Select
                                name="branchId"
                                value={formData.branchId}
                                onChange={handleChange}
                                disabled={adminUser.role === 'Branch Manager'}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            >
                                {adminUser.role !== 'Branch Manager' && <option value="" disabled>{t('staff.edit_modal.select_branch_placeholder', { defaultValue: 'Select Branch' })}</option>}
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">{t('staff.edit_modal.email_label')}</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                placeholder={t('staff.edit_modal.email_placeholder')}
                                required
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">{t('staff.edit_modal.phone_label')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                placeholder={t('staff.edit_modal.phone_placeholder')}
                            />
                        </Col>
                    </Row>

                    <div className="mb-3 d-flex align-items-center gap-2">
                        <Form.Check
                            type="switch"
                            id="isActive-switch"
                            name="isActive"
                            label={t('staff.edit_modal.active_switch')}
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium shadow-none">
                            {t('staff.edit_modal.cancel')}
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm">
                            <Save size={18} /> {t('staff.edit_modal.update_btn')}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default StaffEditModal;
