import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import * as api from '../../api/adminDeliveryApi';

const AddDeliveryPartner = () => {
    const { t } = useTranslation();
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
            Swal.fire(t('common.error'), t('common.fill_required'), 'error');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (profileImage) data.append('profileImage', profileImage);

        try {
            setLoading(true);
            const res = await api.addDeliveryPartner(data);

            Swal.fire({
                title: t('delivery.add_partner.title_success', { defaultValue: 'Driver Created!' }),
                html: `
                    <div class="text-start">
                        <p><strong>${t('delivery.add_partner.full_name')}:</strong> ${formData.name}</p>
                        <p><strong>${t('delivery.add_partner.mobile')}:</strong> ${formData.phone}</p>
                        <p class="text-success fw-bold">${t('delivery.add_partner.login_otp', { defaultValue: 'Login enabled via OTP' })}</p>
                        <p class="text-muted small mt-3">* ${t('delivery.add_partner.login_help', { defaultValue: 'The driver can now log into the Delivery App using their phone number and OTP.' })}</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: t('delivery.partners.title')
            }).then(() => {
                navigate('/admin/delivery/partners');
            });

        } catch (err) {
            Swal.fire(t('common.error'), err?.response?.data?.message || t('common.failed_to_create'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm border bg-white"
                        onClick={() => navigate(-1)}
                    >
                        <X size={16} />
                    </Button>
                    <div>
                        <h4 className="fw-black mb-0 text-nowrap tracking-tight">{t('delivery.add_partner.title', { defaultValue: 'Add New Rider' })}</h4>
                        <p className="text-muted small mb-0 uppercase tracking-widest opacity-60 font-bold">{t('delivery.add_partner.subtitle', { defaultValue: 'Logistics Onboarding' })}</p>
                    </div>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto gap-2">
                    <Button variant="light" onClick={() => navigate('/admin/delivery/partners')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center px-4 rounded-xl font-bold text-xs uppercase tracking-wider">
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={(e) => handleSubmit(e)} 
                        disabled={loading} 
                        className="d-flex align-items-center gap-2 shadow-lg shadow-blue-500/20 justify-content-center px-4 rounded-xl font-black text-xs uppercase tracking-wider border-0"
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                        {loading ? 'Saving...' : t('delivery.add_partner.create_btn', { defaultValue: 'Register Rider' })}
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={9}>
                    <Card className="border-0 shadow-sm mb-4 rounded-3xl overflow-hidden">
                        <Card.Body className="p-4 p-md-5">
                            <h6 className="fw-black mb-4 text-primary border-bottom pb-2 uppercase tracking-widest text-xs opacity-75">{t('delivery.add_partner.credentials_info', { defaultValue: 'Authentication & Contact' })}</h6>
                            <Form onSubmit={handleSubmit}>
                                <Row className="g-4">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-black text-muted mb-2 uppercase tracking-tight">{t('delivery.add_partner.full_name', { defaultValue: 'Full Legal Name' })} <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={t('delivery.add_partner.full_name_placeholder', { defaultValue: 'e.g. Rahul Sharma' })}
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                pattern="^[a-zA-Z\s\.]{3,50}$"
                                                title="Full name should be 3-50 characters long and contain only letters"
                                                className="py-3 shadow-none border-light-subtle bg-light-subtle rounded-2xl font-black text-sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-black text-muted mb-2 uppercase tracking-tight">{t('delivery.add_partner.mobile', { defaultValue: 'Mobile Number' })} <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder={t('delivery.add_partner.mobile_placeholder', { defaultValue: '10-digit number' })}
                                                name="phone"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phone: val });
                                                }}
                                                required
                                                pattern="^[6-9]\d{9}$"
                                                title="Enter a valid 10-digit Indian mobile number starting with 6-9"
                                                className="py-3 shadow-none border-light-subtle bg-light-subtle rounded-2xl font-black text-sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-black text-muted mb-2 uppercase tracking-tight">{t('delivery.add_partner.email', { defaultValue: 'Email Address' })} <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder={t('delivery.add_partner.email_placeholder', { defaultValue: 'rider@sathigro.com' })}
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="py-3 shadow-none border-light-subtle bg-light-subtle rounded-2xl font-black text-sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <div className="p-4 bg-primary bg-opacity-5 rounded-3xl border border-primary border-opacity-10 mt-2">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h6 className="fw-black mb-1 text-primary small uppercase tracking-wider">Login Credentials</h6>
                                                    <p className="text-muted x-small mb-0 italic">Generated for first-time profile creation</p>
                                                </div>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    onClick={handleGeneratePassword}
                                                    className="rounded-pill px-3 py-1.5 text-[10px] fw-black uppercase tracking-widest border-0"
                                                >
                                                    {formData.password ? 'Regenerate' : 'Create Password'}
                                                </Button>
                                            </div>
                                            {formData.password && (
                                                <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-2xl border shadow-sm">
                                                    <code className="text-primary fw-black text-md tracking-wider">{formData.password}</code>
                                                    <span className="text-success x-small fw-bold uppercase tracking-tight">Ready for login</span>
                                                </div>
                                            )}
                                            {!formData.password && (
                                                <p className="text-muted text-center py-2 x-small opacity-50 mb-0 font-bold">Standard OTP-only login will be enabled if no password is set</p>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mt-2">
                                            <Form.Label className="small fw-black text-muted mb-2 uppercase tracking-tight">{t('delivery.add_partner.profile_photo', { defaultValue: 'Verification Photo' })}</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="py-3 shadow-none border-light-subtle bg-light-subtle rounded-2xl font-bold text-xs"
                                            />
                                            <Form.Text className="text-muted x-small italic mt-2 opacity-75">{t('delivery.add_partner.profile_photo_help', { defaultValue: 'Clear face photo for app profile.' })}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="fw-black mt-5 mb-4 text-primary border-bottom pb-2 uppercase tracking-widest text-xs opacity-75">{t('delivery.add_partner.logistics_profile', { defaultValue: 'Resource Mapping' })}</h6>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-black text-muted mb-2 uppercase tracking-tight">{t('delivery.add_partner.vehicle_type', { defaultValue: 'Vehicle Type' })}</Form.Label>
                                            <Form.Select 
                                                name="vehicleType" 
                                                value={formData.vehicleType} 
                                                onChange={handleChange}
                                                className="py-3 shadow-none border-light-subtle bg-light-subtle rounded-2xl font-black text-sm cursor-pointer"
                                            >
                                                <option value="Bike">{t('delivery.add_partner.vehicle_types.bike', { defaultValue: 'Motorcycle / Bike' })}</option>
                                                <option value="EV">{t('delivery.add_partner.vehicle_types.ev', { defaultValue: 'Electric Vehicle (EV)' })}</option>
                                                <option value="Cycle">{t('delivery.add_partner.vehicle_types.cycle', { defaultValue: 'Bicycle / Cycle' })}</option>
                                                <option value="Other">{t('delivery.add_partner.vehicle_types.other', { defaultValue: 'Other Medium' })}</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-black text-muted mb-2 uppercase tracking-tight">{t('delivery.add_partner.license_plate', { defaultValue: 'Vehicle Registration No.' })}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={t('delivery.add_partner.license_plate_placeholder', { defaultValue: 'e.g. MP09AB1234' })}
                                                name="vehicleNumber"
                                                value={formData.vehicleNumber}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                    setFormData({ ...formData, vehicleNumber: val });
                                                }}
                                                pattern="^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$"
                                                title="Enter a valid vehicle number (e.g. MP09AB1234)"
                                                className="py-3 shadow-none border-light-subtle bg-light-subtle rounded-2xl font-black text-sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddDeliveryPartner;
