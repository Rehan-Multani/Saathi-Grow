import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AddBranch = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        manager: '',
        email: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.manager || !formData.phone) {
            Swal.fire('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        Swal.fire({
            title: 'Saving Branch...',
            didOpen: () => Swal.showLoading(),
            timer: 1000,
            showConfirmButton: false
        }).then(() => {
            Swal.fire({
                title: 'Created!',
                text: 'New branch has been added successfully.',
                icon: 'success',
                confirmButtonColor: '#0c831f'
            }).then(() => {
                navigate('/admin/locations/branches');
            });
        });
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm border"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <h4 className="fw-bold mb-0 text-nowrap">Add New Branch</h4>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/locations/branches')} className="d-flex align-items-center gap-2 shadow-sm px-4">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <h6 className="fw-bold mb-4 text-primary">Branch Information</h6>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Branch Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Main Store - Downtown"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Manager Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Sarah Connor"
                                                name="manager"
                                                value={formData.manager}
                                                onChange={handleChange}
                                                required
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Contact Phone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="+91 00000 00000"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="branch@sathigro.com"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Full Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="123 Market St, City, State..."
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="shadow-none border-light-subtle bg-light-subtle"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Under Renovation">Under Renovation</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button type="submit" variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold shadow-sm">
                                    <Save size={18} /> Save Branch Details
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddBranch;
