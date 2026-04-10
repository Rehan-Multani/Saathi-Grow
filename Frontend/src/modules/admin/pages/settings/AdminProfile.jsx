import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, User, Mail, Phone, Lock, Camera, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AdminProfile = () => {
    const { adminUser, adminUpdateProfile } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (adminUser) {
            setFormData({
                name: adminUser.name || '',
                email: adminUser.email || '',
                phone: adminUser.phone || '',
                role: adminUser.role || '',
                newPassword: '',
                confirmPassword: ''
            });
            setImagePreview(adminUser.profileImage || null);
        }
    }, [adminUser]);

    const validateForm = () => {
        const newErrors = {};
        
        // Name validation: 2-50 chars, letters and spaces only
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        if (!nameRegex.test(formData.name)) {
            newErrors.name = 'Please enter a valid name (2-50 characters, letters only)';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please provide a valid email address (e.g., name@gmail.com)';
        }

        // Phone validation: 10 digit Indian mobile
        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit mobile number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Image size should be less than 2MB');
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePersonal = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);

            if (selectedFile) {
                data.append('profileImage', selectedFile);
            }

            await adminUpdateProfile(data);
            toast.success('Profile updated successfully!');
            setSelectedFile(null);
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (formData.newPassword.length < 8) {
            return toast.error('Password must be at least 8 characters');
        }

        setLoading(true);
        try {
            await adminUpdateProfile({
                password: formData.newPassword
            });
            toast.success('Password changed successfully!');
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            <div className="d-flex align-items-center gap-2 mb-4">
                <h4 className="fw-bold mb-0">Admin Profile</h4>
                <PageInfoTooltip info={pageInfoData.adminProfile} />
            </div>

            <Row className="g-4">
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4 overflow-hidden rounded-4">
                        <Card.Body className="text-center p-4">
                            <div className="position-relative d-inline-block mb-3">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center overflow-hidden border-4 border-white shadow-sm" style={{ width: '140px', height: '140px' }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <div className="bg-indigo-50 w-100 h-100 d-flex align-items-center justify-content-center">
                                            <User size={60} className="text-indigo-200" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="d-none"
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow-lg border-2 border-white"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Camera size={18} />
                                </Button>
                            </div>
                            <h5 className="fw-bold mb-1">{formData.name || 'Super Admin'}</h5>
                            <p className="text-indigo-600 bg-indigo-50 d-inline-block px-3 py-1 rounded-pill small fw-bold text-uppercase tracking-wider mb-3">
                                {formData.role}
                            </p>
                            <div className="d-grid mt-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-3 py-2"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Change Profile Photo
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold text-uppercase small tracking-wide text-indigo-600">Security Settings</h6>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <Form onSubmit={handleUpdatePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-bold">New Password</Form.Label>
                                    <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                                        <InputGroup.Text className="bg-light border-0 pe-0">
                                            <Lock size={16} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="bg-light border-0 shadow-none py-2"
                                            placeholder="Min. 8 characters"
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small text-muted fw-bold">Confirm Password</Form.Label>
                                    <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                                        <InputGroup.Text className="bg-light border-0 pe-0">
                                            <Lock size={16} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="bg-light border-0 shadow-none py-2"
                                            placeholder="Repeat password"
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading || !formData.newPassword}
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Form onSubmit={handleUpdatePersonal} noValidate>
                            <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center border-bottom">
                                <h6 className="mb-0 fw-bold text-uppercase small tracking-wide text-indigo-600">Personal Information</h6>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="d-flex align-items-center gap-2 px-4 rounded-3 shadow-sm"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-4 mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Full Name</Form.Label>
                                            <InputGroup className={`rounded-3 overflow-hidden border ${errors.name ? 'border-danger' : 'border-light bg-light'}`}>
                                                <InputGroup.Text className="bg-transparent border-0 pe-0">
                                                    <User size={18} className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.name}
                                                    className="bg-transparent border-0 shadow-none py-2"
                                                    placeholder="Enter full name"
                                                    required
                                                />
                                            </InputGroup>
                                            {errors.name && <div className="text-danger small mt-1 ml-1">{errors.name}</div>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Email Address</Form.Label>
                                            <InputGroup className={`rounded-3 overflow-hidden border ${errors.email ? 'border-danger' : 'border-light bg-light'}`}>
                                                <InputGroup.Text className="bg-transparent border-0 pe-0">
                                                    <Mail size={18} className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.email}
                                                    className="bg-transparent border-0 shadow-none py-2"
                                                    placeholder="admin@example.com"
                                                    required
                                                />
                                            </InputGroup>
                                            {errors.email && <div className="text-danger small mt-1 ml-1">{errors.email}</div>}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="g-4 mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Phone Number</Form.Label>
                                            <InputGroup className={`rounded-3 overflow-hidden border ${errors.phone ? 'border-danger' : 'border-light bg-light'}`}>
                                                <InputGroup.Text className="bg-transparent border-0 pe-0">
                                                    <Phone size={18} className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.phone}
                                                    className="bg-transparent border-0 shadow-none py-2"
                                                    placeholder="10-digit mobile"
                                                    required
                                                />
                                            </InputGroup>
                                            {errors.phone && <div className="text-danger small mt-1 ml-1">{errors.phone}</div>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Access Role</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.role}
                                                disabled
                                                className="bg-light border-0 shadow-none py-2 text-uppercase fw-bold small text-muted rounded-3"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="mt-5">
                                    <h6 className="fw-bold mb-3 text-uppercase small tracking-wide text-indigo-600 border-bottom pb-2">System Preferences</h6>
                                    <div className="bg-light p-3 rounded-4">
                                        <Form.Check
                                            type="switch"
                                            id="email-notif"
                                            label="Email alerts for system updates"
                                            defaultChecked
                                            className="mb-3 custom-switch"
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="sms-notif"
                                            label="SMS alerts for high-priority incidents"
                                            className="custom-switch"
                                        />
                                    </div>
                                </div>
                            </Card.Body>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfile;
