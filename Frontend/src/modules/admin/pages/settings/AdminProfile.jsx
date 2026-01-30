import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, User, Mail, Phone, Lock, Camera } from 'lucide-react';

const AdminProfile = () => {
    const [formData, setFormData] = useState({
        fullName: 'Admin User',
        email: 'admin@sathigro.com',
        phone: '+1 234 567 890',
        role: 'Super Admin',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-3">
            <h4 className="fw-bold mb-4">Admin Profile</h4>

            <Row>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="text-center p-4">
                            <div className="position-relative d-inline-block mb-3">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', fontSize: '3rem' }}>
                                    <User size={60} className="text-secondary" />
                                </div>
                                <Button variant="primary" size="sm" className="position-absolute bottom-0 end-0 rounded-circle p-2">
                                    <Camera size={16} />
                                </Button>
                            </div>
                            <h5 className="fw-bold mb-1">{formData.fullName}</h5>
                            <p className="text-muted small mb-3">{formData.role}</p>
                            <div className="d-grid">
                                <Button variant="outline-primary" size="sm">Change Photo</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">Security Settings</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted">Current Password</Form.Label>
                                <div className="position-relative">
                                    <Lock size={16} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                    <Form.Control type="password" name="currentPassword" onChange={handleChange} className="ps-4 h-auto py-2" />
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted">New Password</Form.Label>
                                <div className="position-relative">
                                    <Lock size={16} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                    <Form.Control type="password" name="newPassword" onChange={handleChange} className="ps-4 h-auto py-2" />
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-muted">Confirm New Password</Form.Label>
                                <div className="position-relative">
                                    <Lock size={16} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                    <Form.Control type="password" name="confirmPassword" onChange={handleChange} className="ps-4 h-auto py-2" />
                                </div>
                            </Form.Group>
                            <Button variant="primary" className="w-100">Update Password</Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">Personal Information</h6>
                            <Button variant="primary" size="sm" className="d-flex align-items-center gap-2">
                                <Save size={16} /> Save Changes
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Full Name</Form.Label>
                                            <div className="position-relative">
                                                <User size={18} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                                <Form.Control
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="ps-4 shadow-none"
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Email Address</Form.Label>
                                            <div className="position-relative">
                                                <Mail size={18} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="ps-4 shadow-none"
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Phone Number</Form.Label>
                                            <div className="position-relative">
                                                <Phone size={18} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                                <Form.Control
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="ps-4 shadow-none"
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Role</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.role}
                                                disabled
                                                className="bg-light shadow-none"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2">Notification Preferences</h6>
                                <Form.Check
                                    type="switch"
                                    id="email-notif"
                                    label="Email notifications for new orders"
                                    defaultChecked
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="switch"
                                    id="sms-notif"
                                    label="SMS notifications for critical alerts"
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="switch"
                                    id="browser-notif"
                                    label="Browser notifications for support tickets"
                                    defaultChecked
                                />
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfile;
