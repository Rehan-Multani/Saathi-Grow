import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { Save, User, Mail, Phone, Lock, Camera, Loader2 } from 'lucide-react';
import { useStaffAuth } from '../modules/staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../modules/store-manager/context/StoreManagerAuthContext';
import { useAdminAuth } from '../modules/admin/context/AdminAuthContext';
import { toast } from 'react-toastify';

const ProfileSettings = ({ type = 'staff' }) => {
  // Determine which auth to use
  const staffAuth = useStaffAuth();
  const managerAuth = useStoreManagerAuth();
  const adminAuth = useAdminAuth();

  const auth = type === 'staff' ? staffAuth : (type === 'manager' ? managerAuth : adminAuth);
  const user = type === 'staff' ? staffAuth.staffUser : (type === 'manager' ? managerAuth.managerUser : adminAuth.adminUser);
  const updateProfile = type === 'staff' ? staffAuth.staffUpdateProfile : (type === 'manager' ? managerAuth.managerUpdateProfile : adminAuth.adminUpdateProfile);

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

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        newPassword: '',
        confirmPassword: ''
      });
      setImagePreview(user.profileImage || null);
    }
  }, [user]);

  const validateField = (name, value) => {
    let error = '';
    const nameRegex = /^[a-zA-Z\s\u0900-\u097F]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6789]\d{9}$/;

    if (name === 'name' && !nameRegex.test(value)) {
      error = 'Enter a valid name (letters and spaces only, 2-50 chars)';
    } else if (name === 'email' && !emailRegex.test(value)) {
      error = 'Please enter a valid email address';
    } else if (name === 'phone' && !phoneRegex.test(value)) {
      error = 'Enter a valid 10-digit mobile number';
    } else if (name === 'newPassword' && value.length < 8) {
      error = 'Password must be at least 8 characters';
    } else if (name === 'confirmPassword' && value !== formData.newPassword) {
      error = 'Passwords do not match';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'name') {
      finalValue = value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, ''); // keep only English/Hindi letters and spaces
    }
    setFormData({ ...formData, [name]: finalValue });
    validateField(name, finalValue);
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
    
    // Final validation check
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phone', formData.phone);

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      return toast.error('Please fix the errors before saving');
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);

      if (selectedFile) {
        data.append('profileImage', selectedFile);
      }

      await updateProfile(data);
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
    const isPasswordValid = validateField('newPassword', formData.newPassword);
    const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);

    if (!isPasswordValid || !isConfirmValid) {
      return toast.error('Please fix password errors');
    }

    setLoading(true);
    try {
      await updateProfile({
        password: formData.newPassword
      });
      toast.success('Password changed successfully!');
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setErrors(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1">
      <div className="mb-4 text-start">
        <h4 className="fw-bold mb-1 text-slate-800">Account Settings</h4>
        <p className="text-muted small">Manage your personal information and security preferences</p>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4 rounded-xl overflow-hidden">
            <Card.Body className="text-center p-4">
              <div className="position-relative d-inline-block mb-3">
                <div className="bg-slate-50 rounded-circle d-flex align-items-center justify-content-center overflow-hidden border border-slate-100 shadow-sm" style={{ width: '120px', height: '120px' }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <div className="text-primary fw-bold text-4xl">{(formData.name || 'U').charAt(0)}</div>
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
                  <Camera size={16} />
                </Button>
              </div>
              <h5 className="fw-bold mb-1 text-slate-800">{formData.name}</h5>
              <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 py-1 mb-3 text-uppercase tracking-wider small fw-bold">
                {formData.role}
              </Badge>
              <div className="d-grid mt-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill py-2 font-medium"
                  onClick={() => fileInputRef.current.click()}
                >
                  Change Profile Photo
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="mb-0 fw-bold text-slate-700 small d-flex align-items-center gap-2">
                <Lock size={16} className="text-primary" /> Update Password
              </h6>
            </Card.Header>
            <Card.Body className="p-4 pt-2">
              <Form onSubmit={handleUpdatePassword}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label className="small text-muted fw-bold mb-1">NEW PASSWORD</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.newPassword}
                    className="bg-white border-slate-200 py-2 shadow-none rounded-lg"
                    placeholder="Enter new password"
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                  {!errors.newPassword && <Form.Text className="text-muted" style={{ fontSize: '10px' }}>Min. 8 characters</Form.Text>}
                </Form.Group>
                <Form.Group className="mb-4 text-start">
                  <Form.Label className="small text-muted fw-bold mb-1">CONFIRM PASSWORD</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    className="bg-white border-slate-200 py-2 shadow-none rounded-lg"
                    placeholder="Confirm password"
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 rounded-pill py-2 font-medium d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  disabled={loading || !formData.newPassword || !!errors.newPassword || !!errors.confirmPassword}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Securely'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100 rounded-xl overflow-hidden">
            <Form onSubmit={handleUpdatePersonal} className="h-100 flex flex-col">
              <Card.Header className="bg-white py-4 px-4 border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 fw-bold text-slate-800 d-flex align-items-center gap-2">
                    <User size={18} className="text-primary" /> Profile Information
                  </h6>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-pill px-4 py-2 font-medium d-flex align-items-center gap-2 shadow-sm"
                  disabled={saving || !!errors.name || !!errors.email || !!errors.phone}
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
                </Button>
              </Card.Header>
              <Card.Body className="p-4 pt-0">
                <hr className="mt-0 mb-4 opacity-50" />
                <Row className="g-4 mb-4 text-start">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold text-uppercase mb-2 tracking-wide">Full Display Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        className="bg-white border-slate-200 py-2 px-3 shadow-none rounded-lg"
                        required
                      />
                      <Form.Control.Feedback type="invalid" className="small font-bold">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold text-uppercase mb-2 tracking-wide">Primary Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        className="bg-white border-slate-200 py-2 px-3 shadow-none rounded-lg"
                        required
                      />
                      <Form.Control.Feedback type="invalid" className="small font-bold">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-4 text-start">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold text-uppercase mb-2 tracking-wide">Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        isInvalid={!!errors.phone}
                        className="bg-white border-slate-200 py-2 px-3 shadow-none rounded-lg"
                        required
                      />
                      <Form.Control.Feedback type="invalid" className="small font-bold">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold text-uppercase mb-2 tracking-wide">Portal Role</Form.Label>
                      <div className="bg-slate-100 text-slate-500 py-2.5 px-3 rounded-lg border border-slate-200 small font-black uppercase tracking-wider">
                        {formData.role}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Simple wrapper components for easy route usage
export const StaffProfile = () => <ProfileSettings type="staff" />;
export const ManagerProfile = () => <ProfileSettings type="manager" />;

export default ProfileSettings;
