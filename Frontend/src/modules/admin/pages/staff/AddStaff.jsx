import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { User, Mail, Phone, Lock, Briefcase, Save, ArrowLeft, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AddStaff = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        confirmPassword: '',
        status: 'Active',
        permissions: []
    });

    const [validated, setValidated] = useState(false);

    const ROLES = [
        'Store Manager',
        'Sales Associate',
        'Inventory Manager',
        'Support Agent',
        'Delivery Coordinator',
        'Admin'
    ];

    const PERMISSIONS_LIST = [
        { id: 'dashboard_view', label: 'View Dashboard' },
        { id: 'orders_manage', label: 'Manage Orders' },
        { id: 'products_manage', label: 'Manage Products' },
        { id: 'customers_view', label: 'View Customers' },
        { id: 'staff_manage', label: 'Manage Staff' },
        { id: 'settings_edit', label: 'Edit Settings' },
        { id: 'returns_approve', label: 'Return Policy: Approve/Deny' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (permId) => {
        setFormData(prev => {
            const currentPerms = prev.permissions;
            if (currentPerms.includes(permId)) {
                return { ...prev, permissions: currentPerms.filter(id => id !== permId) };
            } else {
                return { ...prev, permissions: [...currentPerms, permId] };
            }
        });
    };

    const handleSubmit = (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Logic to submit data to backend would go here
        console.log("Submitting Staff Data:", formData);

        // Simulating success
        alert("Staff member added successfully!");
        navigate('/admin/staff');
    };

    return (
        <div className="p-3">
            <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Add New Staff Member</h4>
                    <p className="text-muted small mb-0">Create a new account for your team member.</p>
                </div>
                <Link to="/admin/staff" className="btn btn-light d-flex align-items-center gap-2 shadow-sm">
                    <ArrowLeft size={18} /> Back to List
                </Link>
            </div>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="g-4">
                    {/* Left Column: Personal Info & Login */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <User size={18} /> Personal Information
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                placeholder="Enter first name"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                            <Form.Control.Feedback type="invalid">First name is required.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                placeholder="Enter last name"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Email Address</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text><Mail size={16} /></InputGroup.Text>
                                                <Form.Control
                                                    required
                                                    type="email"
                                                    placeholder="name@company.com"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                                <Form.Control.Feedback type="invalid">Please provide a valid email.</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Phone Number</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text><Phone size={16} /></InputGroup.Text>
                                                <Form.Control
                                                    required
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr className="my-4 text-muted opacity-25" />

                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <Lock size={18} /> Account Security
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                placeholder="••••••••"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={8}
                                            />
                                            <Form.Text className="text-muted small">Min. 8 characters</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                placeholder="••••••••"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                isInvalid={formData.confirmPassword && formData.password !== formData.confirmPassword}
                                            />
                                            <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column: Role & Permissions */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4 h-100">
                            <Card.Body className="p-4 d-flex flex-column">
                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <Briefcase size={18} /> Role & Access
                                </h6>

                                <Form.Group className="mb-4">
                                    <Form.Label>Assign Role</Form.Label>
                                    <Form.Select
                                        required
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="mb-2"
                                    >
                                        <option value="">Select a role...</option>
                                        {ROLES.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Account Status</Form.Label>
                                    <div className="d-flex gap-3">
                                        <Form.Check
                                            type="radio"
                                            label="Active"
                                            name="status"
                                            id="statusActive"
                                            className="fw-medium"
                                            checked={formData.status === 'Active'}
                                            onChange={() => setFormData({ ...formData, status: 'Active' })}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Inactive"
                                            name="status"
                                            id="statusInactive"
                                            className="fw-medium text-muted"
                                            checked={formData.status === 'Inactive'}
                                            onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                                        />
                                    </div>
                                </Form.Group>

                                <div className="mt-2">
                                    <Form.Label className="d-flex align-items-center gap-2 mb-3">
                                        <Shield size={16} /> Specific Permissions
                                    </Form.Label>
                                    <div className="bg-light p-3 rounded custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {PERMISSIONS_LIST.map(perm => (
                                            <Form.Check
                                                key={perm.id}
                                                type="switch"
                                                id={`perm-${perm.id}`}
                                                label={perm.label}
                                                className="mb-2 small"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => handlePermissionChange(perm.id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    <Button type="submit" variant="primary" size="lg" className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm">
                                        <Save size={20} /> Create Account
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AddStaff;
