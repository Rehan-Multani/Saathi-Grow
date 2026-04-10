import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Spinner, Image } from 'react-bootstrap';
import { Save, Store, User, Phone, Mail, MapPin, Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';
import { useCallback } from 'react';

const EditBranchModal = ({ show, onHide, branch, onSave }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        isActive: true,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        }
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || '',
                code: branch.code || '',
                phone: branch.phone || '',
                email: branch.email || '',
                isActive: branch.isActive ?? true,
                address: branch.address && typeof branch.address === 'object' ? branch.address : {
                    street: branch.address || '',
                    city: '',
                    state: '',
                    zipCode: '',
                    location: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                }
            });
            setLogoPreview(branch.logo || null);
            setLogoFile(null);
        }
    }, [branch, show]);

    useEffect(() => {
        if (show) {
            const style = document.createElement('style');
            style.innerHTML = `.pac-container { z-index: 10000 !important; }`;
            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleLocationSelect = React.useCallback((locData) => {
        setFormData(prev => ({
            ...prev,
            address: {
                street: locData.street || locData.fullAddress,
                city: locData.city,
                state: locData.state,
                zipCode: locData.zipCode,
                location: {
                    type: 'Point',
                    coordinates: [locData.lng, locData.lat]
                }
            }
        }));
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'address') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });
            if (logoFile) {
                data.append('logo', logoFile);
            }

            await onSave(data);
            onHide();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="branch-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Store className="text-primary" size={24} /> Edit Branch Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4 pb-4">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Branch Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Branch Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none text-uppercase"
                                        required
                                    />
                                </Col>
                            </Row>

                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Branch Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Contact Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                            </Row>
                        </Col>

                        <Col md={4} className="border-start">
                            <Form.Label className="small fw-bold text-muted uppercase">Branch Logo</Form.Label>
                            <div className="text-center p-3 border border-dashed rounded bg-light position-relative">
                                {logoPreview ? (
                                    <div className="position-relative">
                                        <Image src={logoPreview} fluid rounded style={{ maxHeight: '120px' }} />
                                        <label className="position-absolute bottom-0 end-0 bg-primary text-white p-1 rounded-circle cursor-pointer shadow-sm translate-x-1/2 translate-y-1/2">
                                            <Camera size={14} />
                                            <input type="file" className="d-none" onChange={handleLogoChange} accept="image/*" />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer py-4 d-block">
                                        <Camera size={30} className="text-muted mb-2" />
                                        <div className="small text-muted">Update Logo</div>
                                        <input type="file" className="d-none" onChange={handleLogoChange} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={12}>
                            <Form.Label className="small fw-bold text-muted uppercase">Branch Address (Search on Map)</Form.Label>
                            <GoogleMapsInput
                                onLocationSelect={handleLocationSelect}
                                defaultValue={formData.address.street}
                                placeholder="Search for branch location..."
                            />

                            <Row className="g-3 mt-1">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Street</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.address.street}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, street: e.target.value }
                                        })}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, city: e.target.value }
                                        })}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, state: e.target.value }
                                        })}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Zip Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.address.zipCode}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, zipCode: e.target.value }
                                        })}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Check
                                type="switch"
                                id="branch-active-switch"
                                label="Branch Active"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="fw-medium mt-2"
                            />
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium border shadow-none" disabled={loading}>
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                            {loading ? 'Updating...' : 'Update Branch'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditBranchModal;
