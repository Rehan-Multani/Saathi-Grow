import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as api from '../../api/adminDeliveryApi';

const AddDeliveryPartner = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Automatically generate a secure password string for the driver to login with
    const generateRandomPassword = () => 'Rider@' + Math.floor(1000 + Math.random() * 9000);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        vehicleType: 'Bike',
        vehicleNumber: ''
    });
    const [profileImage, setProfileImage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGeneratePassword = () => {
        setFormData({ ...formData, password: generateRandomPassword() });
    };

    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (profileImage) data.append('profileImage', profileImage);

        try {
            setLoading(true);
            const res = await api.addDeliveryPartner(data);

            Swal.fire({
                title: 'Driver Created!',
                html: `
                    <div class="text-start">
                        <p><strong>Name:</strong> ${formData.name}</p>
                        <p><strong>Phone:</strong> ${formData.phone}</p>
                        <p class="text-success fw-bold">Login enabled via OTP</p>
                        <p class="text-muted small mt-3">* The driver can now log into the Delivery App using their phone number and OTP.</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'View Partners'
            }).then(() => {
                navigate('/admin/delivery/partners');
            });

        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'Failed to create partner', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Register Delivery Driver</h4>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/delivery/partners')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Driver Credentials & Info</h6>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Legal Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Rahul Kumar"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mobile Number (Login ID) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="9876543210"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="rahul@example.com"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Profile Photo</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <Form.Text className="text-muted">Optional: Upload a clear face photo for identification.</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mt-4 mb-3 text-primary border-bottom pb-2">Logistics Profile</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Vehicle Type</Form.Label>
                                            <Form.Select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                                                <option value="Bike">Motorcycle (Bike)</option>
                                                <option value="EV">Electric Vehicle (EV)</option>
                                                <option value="Cycle">Bicycle</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Vehicle License Plate</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. MP09-AB-1234"
                                                name="vehicleNumber"
                                                value={formData.vehicleNumber}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading}
                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-3 mt-4 fw-bold shadow-sm"
                                >
                                    {loading ? <Spinner size="sm" /> : <Save size={18} />}
                                    Create Driver Profile
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddDeliveryPartner;
