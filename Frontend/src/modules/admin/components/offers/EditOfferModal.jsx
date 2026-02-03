import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, X, Tag, Code, Calendar, Percent } from 'lucide-react';
import Swal from 'sweetalert2';

const EditOfferModal = ({ show, onHide, offer, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        discount: '',
        code: '',
        validUntil: '',
        status: 'Active'
    });

    useEffect(() => {
        if (offer) {
            setFormData({
                title: offer.title || '',
                discount: offer.discount || '',
                code: offer.code || '',
                validUntil: offer.validUntil === 'N/A' ? '' : offer.validUntil || '',
                status: offer.status || 'Active'
            });
        }
    }, [offer, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...offer, ...formData, validUntil: formData.validUntil || 'N/A' });
        onHide();
        Swal.fire({
            title: 'Updated!',
            text: 'Offer has been updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#0c831f'
        });
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 bg-light p-4">
                <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
                    <Tag className="text-danger" size={24} /> Edit Special Offer
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Offer Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Festival Bonanza"
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Discount Value</Form.Label>
                                <InputGroup className="bg-light border rounded overflow-hidden">
                                    <InputGroup.Text className="bg-transparent border-0"><Percent size={16} /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. 20% OFF or ₹50 Flat"
                                        className="border-0 bg-transparent shadow-none py-2"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Promo Code</Form.Label>
                                <InputGroup className="bg-light border rounded overflow-hidden">
                                    <InputGroup.Text className="bg-transparent border-0"><Code size={16} /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. SAVE20"
                                        className="border-0 bg-transparent shadow-none py-2 font-monospace"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Expiry Date</Form.Label>
                                <InputGroup className="bg-light border rounded overflow-hidden">
                                    <InputGroup.Text className="bg-transparent border-0"><Calendar size={16} /></InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="validUntil"
                                        value={formData.validUntil}
                                        onChange={handleChange}
                                        className="border-0 bg-transparent shadow-none py-2"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Offer Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Scheduled">Scheduled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4 pt-2">
                        <Button variant="light" onClick={onHide} className="flex-grow-1 py-2 border shadow-none d-flex align-items-center justify-content-center">
                            <X size={18} className="me-2" /> Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="flex-grow-1 py-2 shadow-sm fw-bold d-flex align-items-center justify-content-center btn-danger border-0">
                            <Save size={18} className="me-2" /> Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditOfferModal;
