import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save } from 'lucide-react';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const StaffEditModal = ({ show, onHide, staff, onSave }) => {
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
                <Modal.Title className="fw-bold">Edit Staff Member</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-light border-0 py-2 shadow-none"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">Job Role</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={adminUser.role === 'Branch Manager'}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            >
                                <option value="Staff">Staff</option>
                                <option value="Branch Manager">Branch Manager</option>
                                <option value="Admin">Admin</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">Assign Branch</Form.Label>
                            <Form.Select
                                name="branchId"
                                value={formData.branchId}
                                onChange={handleChange}
                                disabled={adminUser.role === 'Branch Manager'}
                                className="bg-light border-0 py-2 shadow-none"
                            >
                                {adminUser.role !== 'Branch Manager' && <option value="">Global / No Branch</option>}
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                placeholder="name@sathigro.com"
                                required
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                placeholder="+91 00000 00000"
                            />
                        </Col>
                    </Row>

                    <div className="mb-3 d-flex align-items-center gap-2">
                        <Form.Check
                            type="switch"
                            id="isActive-switch"
                            name="isActive"
                            label="Account Active"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium shadow-none">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm">
                            <Save size={18} /> Update Staff
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default StaffEditModal;
