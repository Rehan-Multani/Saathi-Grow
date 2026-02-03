import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Save } from 'lucide-react';

const BrandEditModal = ({ show, onHide, brand, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        status: 'Active'
    });

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name || '',
                status: brand.status || 'Active'
            });
        }
    }, [brand]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...brand, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="brand-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Edit Brand</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">Brand Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-light border-0 py-2"
                            placeholder="e.g. Nike"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">Status</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="bg-light border-0 py-2 shadow-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Form.Select>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2">
                            <Save size={18} /> Update Brand
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BrandEditModal;
