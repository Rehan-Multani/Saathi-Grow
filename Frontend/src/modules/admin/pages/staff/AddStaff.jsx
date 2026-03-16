import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { User, Mail, Phone, Lock, Briefcase, Save, ArrowLeft, Shield, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createStaff } from '../../api/adminApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const AddStaff = () => {
    const { t } = useTranslation();
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
        'VIEW_DASHBOARD',
        'VIEW_ORDERS',
        'MANAGE_ORDERS',
        'MANAGE_REFUNDS_RETURNS',
        'VIEW_PRODUCTS',
        'MANAGE_PRODUCTS',
        'MANAGE_CATEGORIES_BRANDS',
        'MANAGE_INVENTORY',
        'MANAGE_DELIVERY',
        'VIEW_CUSTOMERS',
        'MANAGE_CUSTOMERS',
        'MANAGE_STAFF',
        'MANAGE_POS_BILLING',
        'MANAGE_BRANCHES',
        'MANAGE_VENDORS',
        'MANAGE_SETTINGS'
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
            toast.error(t('staff.add_new.validation.password_mismatch'));
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
            toast.success(t('staff.alerts.create_success'));
            navigate('/admin/staff');
        } catch (error) {
            toast.error(error.message || t('staff.errors.create_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <h4 className="fw-bold text-dark mb-1">{t('staff.add_new.title')}</h4>
                    <p className="text-muted small mb-0">{t('staff.add_new.subtitle')}</p>
                </div>
                <Link to="/admin/staff" className="btn btn-light d-flex align-items-center gap-2 shadow-sm">
                    <ArrowLeft size={18} /> {t('staff.add_new.back_to_list')}
                </Link>
            </div>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <User size={18} /> {t('staff.add_new.personal_info')}
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">{t('staff.add_new.first_name')}</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                placeholder={t('staff.add_new.first_name_placeholder')}
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">{t('staff.add_new.validation.first_name_req')}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">{t('staff.add_new.last_name')}</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                placeholder={t('staff.add_new.last_name_placeholder')}
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">{t('staff.add_new.validation.last_name_req')}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">{t('staff.add_new.email')}</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text className="bg-light border-light-subtle"><Mail size={16} /></InputGroup.Text>
                                                <Form.Control
                                                    required
                                                    type="email"
                                                    placeholder={t('staff.add_new.email_placeholder')}
                                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="shadow-none border-light-subtle bg-light-subtle"
                                                />
                                                <Form.Control.Feedback type="invalid">{t('staff.add_new.validation.email_invalid')}</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">{t('staff.add_new.phone')}</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text className="bg-light border-light-subtle"><Phone size={16} /></InputGroup.Text>
                                                <Form.Control
                                                    required
                                                    type="tel"
                                                    placeholder={t('staff.add_new.phone_placeholder')}
                                                    pattern="^[6-9]\d{9}$"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="shadow-none border-light-subtle bg-light-subtle"
                                                />
                                                <Form.Control.Feedback type="invalid">{t('staff.add_new.validation.phone_invalid')}</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr className="my-4 text-muted opacity-25" />

                                <h6 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <Lock size={18} /> {t('staff.add_new.account_security')}
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">{t('staff.add_new.password')}</Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                placeholder={t('staff.add_new.password_placeholder')}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={8}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">{t('staff.add_new.validation.password_req')}</Form.Control.Feedback>
                                            <Form.Text className="text-muted small">{t('staff.add_new.password_min_length')}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">{t('staff.add_new.confirm_password')}</Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                placeholder={t('staff.add_new.password_placeholder')}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                isInvalid={formData.confirmPassword && formData.password !== formData.confirmPassword}
                                                className="shadow-none border-light-subtle bg-light-subtle"
                                            />
                                            <Form.Control.Feedback type="invalid">{t('staff.add_new.validation.password_mismatch')}</Form.Control.Feedback>
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
                                    <Briefcase size={18} /> {t('staff.add_new.role_access')}
                                </h6>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">{t('staff.add_new.assign_role')}</Form.Label>
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
                                        <Store size={16} /> {t('staff.add_new.assign_branch')}
                                    </Form.Label>
                                    <Form.Select
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        disabled={isBranchManager}
                                        className="shadow-none border-light-subtle bg-light-subtle"
                                    >
                                        {!isBranchManager && <option value="">{t('staff.add_new.global_no_branch')}</option>}
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted small italic">{t('staff.add_new.assign_branch_help')}</Form.Text>
                                </Form.Group>

                                <div className="mt-2">
                                    <Form.Label className="d-flex align-items-center gap-2 mb-3 small fw-bold">
                                        <Shield size={16} /> {t('staff.add_new.specific_permissions')}
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
                                            return !RESTRICTED_IDS.includes(permId);
                                        }).map(permId => (
                                            <Form.Check
                                                key={permId}
                                                type="switch"
                                                id={`perm-${permId}`}
                                                label={t(`staff.permission_labels.${permId}`)}
                                                className="mb-2 small fw-medium"
                                                checked={formData.permissions.includes(permId)}
                                                onChange={() => handlePermissionChange(permId)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    <Button type="submit" variant="primary" size="lg" className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />} {t('staff.add_new.create_account')}
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
