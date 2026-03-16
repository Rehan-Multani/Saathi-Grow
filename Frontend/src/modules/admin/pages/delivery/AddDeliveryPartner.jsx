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
                <h4 className="fw-bold mb-0 text-nowrap">{t('delivery.add_partner.title')}</h4>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/delivery/partners')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center">
                        <X size={18} /> {t('delivery.add_partner.cancel')}
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">{t('delivery.add_partner.credentials_info')}</h6>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('delivery.add_partner.full_name')} <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={t('delivery.add_partner.full_name_placeholder')}
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('delivery.add_partner.mobile')} <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder={t('delivery.add_partner.mobile_placeholder')}
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('delivery.add_partner.email')}</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder={t('delivery.add_partner.email_placeholder')}
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('delivery.add_partner.profile_photo')}</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <Form.Text className="text-muted">{t('delivery.add_partner.profile_photo_help')}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mt-4 mb-3 text-primary border-bottom pb-2">{t('delivery.add_partner.logistics_profile')}</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('delivery.add_partner.vehicle_type')}</Form.Label>
                                            <Form.Select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                                                <option value="Bike">{t('delivery.add_partner.vehicle_types.bike')}</option>
                                                <option value="EV">{t('delivery.add_partner.vehicle_types.ev')}</option>
                                                <option value="Cycle">{t('delivery.add_partner.vehicle_types.cycle')}</option>
                                                <option value="Other">{t('delivery.add_partner.vehicle_types.other')}</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('delivery.add_partner.license_plate')}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={t('delivery.add_partner.license_plate_placeholder')}
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
                                    {t('delivery.add_partner.create_btn')}
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
