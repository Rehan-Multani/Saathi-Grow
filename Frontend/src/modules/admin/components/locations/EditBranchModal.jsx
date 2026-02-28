import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import GoogleMapsInput from '../common/GoogleMapsInput';
import { getAllStaff } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const EditBranchModal = ({ show, onHide, branch, onSave }) => {
    const { adminUser } = useAdminAuth();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        isActive: true,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        }
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || '',
                code: branch.code || '',
                phone: branch.phone || '',
                email: branch.email || '',
                isActive: branch.isActive ?? true,
                address: {
                    street: branch.address?.street || '',
                    city: branch.address?.city || '',
                    state: branch.address?.state || '',
                    zipCode: branch.address?.zipCode || '',
                    location: branch.address?.location || { type: 'Point', coordinates: [0, 0] }
                }
            });
        }
    }, [branch, show]);

    // Z-index fix for google autocomplete in modal
    useEffect(() => {
        if (show) {
            const style = document.createElement('style');
            style.innerHTML = `.pac-container { z-index: 10000 !important; }`;
            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [show]);

    const handleLocationSelect = (locData) => {
        setFormData(prev => ({
            ...prev,
            address: {
                street: locData.street || locData.fullAddress,
                city: locData.city,
                state: locData.state,
                zipCode: locData.zipCode,
                location: {
                    type: 'Point',
                    coordinates: [locData.lng, locData.lat]
                }
            }
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 bg-light p-4">
                <Modal.Title className="fw-bold fs-5">Edit Branch Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Branch Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Branch Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light text-uppercase"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Contact Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Branch Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Location Details</Form.Label>
                            <Row className="g-2">
                                <Col md={12} className="mb-2">
                                    <Form.Label className="!text-[10px] fw-bold text-primary mb-1">Search on Map</Form.Label>
                                    <GoogleMapsInput
                                        onLocationSelect={handleLocationSelect}
                                        placeholder="Search for branch location..."
                                        defaultValue={formData.address.street}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Street"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        className="py-2 border-light-subtle shadow-none bg-light"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="City"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="py-2 border-light-subtle shadow-none bg-light"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="State"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        className="py-2 border-light-subtle shadow-none bg-light"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Zip Code"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        className="py-2 border-light-subtle shadow-none bg-light"
                                    />
                                </Col>
                            </Row>
                        </Col>

                        <Col md={12}>
                            <Form.Check
                                type="switch"
                                id="branch-active-switch"
                                label="Branch Active"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="fw-medium mt-2"
                            />
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4 pt-2">
                        <Button variant="light" onClick={onHide} className="flex-grow-1 py-2 border shadow-none d-flex align-items-center justify-content-center">
                            <X size={18} className="me-2" /> Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="flex-grow-1 py-2 shadow-sm fw-bold d-flex align-items-center justify-content-center">
                            <Save size={18} className="me-2" /> Update Branch
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditBranchModal;
