import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import GoogleMapsInput from '../../components/common/GoogleMapsInput';

const EditBranch = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        },
        phone: '',
        manager: '',
        email: '',
        status: 'Active'
    });

    // Mock loading data
    useEffect(() => {
        // In a real app, you'd fetch branch data by ID here
        const mockBranchData = {
            '1': { name: 'Main Store - Downtown', address: '123 Market St, Downtown', phone: '+91 98765 43210', manager: 'Sarah Connor', email: 'downtown@sathigro.com', status: 'Active' },
            '2': { name: 'Northside Branch', address: '456 North Ave, Uptown', phone: '+91 98765 43211', manager: 'Kyle Reese', email: 'northside@sathigro.com', status: 'Active' },
            '3': { name: 'West Mall Kiosk', address: '789 West Mall, Westside', phone: '+91 98765 43212', manager: 'John Connor', email: 'westmall@sathigro.com', status: 'Inactive' },
        };

        if (mockBranchData[id]) {
            setFormData(mockBranchData[id]);
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Updating Branch...',
            didOpen: () => Swal.showLoading(),
            timer: 1000,
            showConfirmButton: false
        }).then(() => {
            Swal.fire({
                title: 'Updated!',
                text: 'Branch details have been updated successfully.',
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
                    <h4 className="fw-bold mb-0 text-nowrap">Edit Branch</h4>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto gap-2">
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
                                    <Form.Label className="small fw-bold">Street Address (Search on Map)</Form.Label>
                                    <GoogleMapsInput
                                        onLocationSelect={handleLocationSelect}
                                        defaultValue={formData.address.street}
                                        placeholder="Search for store location..."
                                    />
                                    <div className="mt-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="123 Market St"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                            className="shadow-none border-light-subtle bg-light-subtle py-2"
                                        />
                                    </div>
                                </Form.Group>
                                <Row className="g-3 mb-3">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle py-2"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle py-2"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Zip Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.zipCode"
                                                value={formData.address.zipCode}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle py-2"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

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
                                    <Save size={18} /> Update Branch Details
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default EditBranch;
