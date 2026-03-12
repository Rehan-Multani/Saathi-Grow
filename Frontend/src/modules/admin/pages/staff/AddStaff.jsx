import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { User, Mail, Phone, Lock, Briefcase, Save, ArrowLeft, Shield, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createStaff } from '../../api/adminApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const AddStaff = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Staff',
        branchId: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        permissions: []
    });

    const [validated, setValidated] = useState(false);

    const isBranchManager = adminUser.role === 'Branch Manager';
    const ROLES = isBranchManager ? ['Staff'] : ['Admin', 'Branch Manager', 'Staff'];

    const PERMISSIONS_LIST = [
        { id: 'VIEW_DASHBOARD', label: 'View Dashboard Analytics' },
        { id: 'VIEW_ORDERS', label: 'View Orders List' },
        { id: 'MANAGE_ORDERS', label: 'Manage/Change Order Status' },
        { id: 'MANAGE_REFUNDS_RETURNS', label: 'Approve Refunds & Returns' },
        { id: 'VIEW_PRODUCTS', label: 'View Products Catalog' },
        { id: 'MANAGE_PRODUCTS', label: 'Add/Edit/Delete Products' },
        { id: 'MANAGE_CATEGORIES_BRANDS', label: 'Add/Edit Categories & Brands' },
        { id: 'MANAGE_INVENTORY', label: 'Update Stock/Inventory' },
        { id: 'MANAGE_DELIVERY', label: 'Manage Delivery Partners' },
        { id: 'VIEW_CUSTOMERS', label: 'View Customer Info' },
        { id: 'MANAGE_CUSTOMERS', label: 'Block/Unblock/Wallet Edit' },
        { id: 'MANAGE_STAFF', label: 'Create/Edit Staff' },
        { id: 'MANAGE_POS_BILLING', label: 'Handle POS Billing & Terminal' },
        { id: 'MANAGE_BRANCHES', label: 'Manage Branch Locations' },
        { id: 'MANAGE_VENDORS', label: 'Manage Vendors & Payouts' },
        { id: 'MANAGE_SETTINGS', label: 'App Global Settings (Taxes, Delivery)' }
    ];

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await getBranches(adminUser.token);
                setBranches(data);

                // If branch manager, pre-set their branch
                if (isBranchManager && adminUser.branchId) {
                    setFormData(prev => ({ ...prev, branchId: adminUser.branchId }));
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, [adminUser.token, isBranchManager, adminUser.branchId]);

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

    const handleSubmit = async (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const staffData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                permissions: formData.permissions,
                branchId: isBranchManager ? adminUser.branchId : (formData.branchId || null)
            };
            await createStaff(adminUser.token, staffData);
            toast.success("Staff member created successfully!");
            navigate('/admin/staff');
        } catch (error) {
            toast.error(error.message || "Failed to create staff member");
        } finally {
            setLoading(false);
        }
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
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <User size={18} /> Personal Information
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">First Name</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                placeholder="Enter first name"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">First name is required.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Last Name</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                placeholder="Enter last name"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">Last name is required.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Email Address</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text className="bg-light border-light-subtle"><Mail size={16} /></InputGroup.Text>
                                                <Form.Control
                                                    required
                                                    type="email"
                                                    placeholder="name@company.com"
                                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="shadow-none border-light-subtle bg-light-subtle"
                                                />
                                                <Form.Control.Feedback type="invalid">Please provide a valid email address (e.g., name@gmail.com).</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Phone Number</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text className="bg-light border-light-subtle"><Phone size={16} /></InputGroup.Text>
                                                <Form.Control
                                                    required
                                                    type="tel"
                                                    placeholder="10-digit mobile number"
                                                    pattern="^[6-9]\d{9}$"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="shadow-none border-light-subtle bg-light-subtle"
                                                />
                                                <Form.Control.Feedback type="invalid">Please enter a valid 10-digit Indian phone number.</Form.Control.Feedback>
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
                                            <Form.Label className="small fw-bold">Password</Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                placeholder="********"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={8}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">Password must be at least 8 characters long.</Form.Control.Feedback>
                                            <Form.Text className="text-muted small">Min. 8 characters</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                placeholder="********"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                isInvalid={formData.confirmPassword && formData.password !== formData.confirmPassword}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4 h-100">
                            <Card.Body className="p-4 d-flex flex-column">
                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <Briefcase size={18} /> Role & Access
                                </h6>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Assign Role</Form.Label>
                                    <Form.Select
                                        required
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={isBranchManager}
                                        className="mb-3 shadow-none border-light-subtle bg-light-subtle"
                                    >
                                        {ROLES.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold d-flex align-items-center gap-2">
                                        <Store size={16} /> Assign Branch
                                    </Form.Label>
                                    <Form.Select
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        disabled={isBranchManager}
                                        className="shadow-none border-light-subtle bg-light-subtle"
                                    >
                                        {!isBranchManager && <option value="">Global / No Branch</option>}
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted small italic">Select the branch this staff belongs to.</Form.Text>
                                </Form.Group>

                                <div className="mt-2">
                                    <Form.Label className="d-flex align-items-center gap-2 mb-3 small fw-bold">
                                        <Shield size={16} /> Specific Permissions
                                    </Form.Label>
                                    <div className="bg-light p-3 rounded custom-scrollbar border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {PERMISSIONS_LIST.filter(perm => {
                                            const RESTRICTED_IDS = [
                                                'VIEW_DASHBOARD',
                                                'MANAGE_PRODUCTS',
                                                'MANAGE_CATEGORIES_BRANDS',
                                                'MANAGE_DELIVERY',
                                                'MANAGE_DELIVERY_BOYS',
                                                'MANAGE_CUSTOMERS',
                                                'MANAGE_STAFF',
                                                'MANAGE_BRANCHES',
                                                'MANAGE_VENDORS',
                                                'MANAGE_SETTINGS'
                                            ];
                                            if (formData.role === 'Admin') return true;
                                            return !RESTRICTED_IDS.includes(perm.id);
                                        }).map(perm => (
                                            <Form.Check
                                                key={perm.id}
                                                type="switch"
                                                id={`perm-${perm.id}`}
                                                label={perm.label}
                                                className="mb-2 small fw-medium"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => handlePermissionChange(perm.id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    <Button type="submit" variant="primary" size="lg" className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />} Create Account
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
