import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, User, Mail, Phone, Lock, Camera, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <div className="p-3">
            <h4 className="fw-bold mb-4">Admin Profile</h4>

            <Row>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="text-center p-4">
                            <div className="position-relative d-inline-block mb-3">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center overflow-hidden border" style={{ width: '120px', height: '120px' }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <User size={60} className="text-secondary" />
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
                                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Camera size={16} />
                                </Button>
                            </div>
                            <h5 className="fw-bold mb-1">{formData.name}</h5>
                            <p className="text-muted small mb-3 text-uppercase tracking-wider">{formData.role}</p>
                            <div className="d-grid">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Change Photo
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold text-uppercase small tracking-wide">Security Settings</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleUpdatePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-bold">New Password</Form.Label>
                                    <div className="position-relative">
                                        <Lock size={16} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                        <Form.Control
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="ps-4 h-auto py-2"
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small text-muted fw-bold">Confirm Password</Form.Label>
                                    <div className="position-relative">
                                        <Lock size={16} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="ps-4 h-auto py-2"
                                        />
                                    </div>
                                </Form.Group>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading || !formData.newPassword}
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Form onSubmit={handleUpdatePersonal}>
                            <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold text-uppercase small tracking-wide">Personal Information</h6>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    className="d-flex align-items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Full Name</Form.Label>
                                            <div className="position-relative">
                                                <User size={18} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="ps-4 shadow-none py-2"
                                                    required
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
                                                    className="ps-4 shadow-none py-2"
                                                    required
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
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
                                                    className="ps-4 shadow-none py-2"
                                                    required
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold text-uppercase">Access Role</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.role}
                                                disabled
                                                className="bg-light shadow-none py-2 text-uppercase fw-bold small"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mt-5 mb-3 border-bottom pb-2 text-uppercase small tracking-wide">System Preferences</h6>
                                <Form.Check
                                    type="switch"
                                    id="email-notif"
                                    label="Email alerts for system updates"
                                    defaultChecked
                                    className="mb-3"
                                />
                                <Form.Check
                                    type="switch"
                                    id="sms-notif"
                                    label="SMS alerts for high-priority incidents"
                                    className="mb-3"
                                />
                            </Card.Body>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfile;
