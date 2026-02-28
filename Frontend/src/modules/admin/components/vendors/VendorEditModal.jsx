import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Image } from 'react-bootstrap';
import { Save, Store, User, Phone, Mail, MapPin, Camera, X } from 'lucide-react';
import { updateVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../common/GoogleMapsInput';

const VendorEditModal = ({ show, onHide, vendor, onSave }) => {
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        status: 'Pending'
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (vendor) {
            setFormData({
                storeName: vendor.storeName || '',
                ownerName: vendor.ownerName || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address && typeof vendor.address === 'object' ? vendor.address : {
                    street: vendor.address || '',
                    city: '',
                    state: '',
                    zipCode: '',
                    location: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                },
                description: vendor.description || '',
                status: vendor.status || 'Pending'
            });
            setLogoPreview(vendor.logo || null);
            setLogoFile(null);
        }
    }, [vendor]);

    useEffect(() => {
        if (show) {
            const style = document.createElement('style');
            style.innerHTML = `.pac-container { z-index: 10000 !important; }`;
            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (locData) => {
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
    };

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

            await updateVendor(adminUser.token, vendor._id, data);
            toast.success('Vendor updated successfully');
            onSave();
            onHide();
        } catch (error) {
            toast.error(error.message || 'Failed to update vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="vendor-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Store className="text-primary" size={24} /> Edit Vendor Profile
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4 pb-4">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Store Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Owner Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                            </Row>

                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase">Phone Number</Form.Label>
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
                            <Form.Label className="small fw-bold text-muted uppercase">Store Logo</Form.Label>
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
                            <Form.Label className="small fw-bold text-muted uppercase">Store Address (Search on Map)</Form.Label>
                            <GoogleMapsInput
                                onLocationSelect={handleLocationSelect}
                                defaultValue={typeof formData.address === 'object' ? formData.address.street : formData.address}
                                placeholder="Search for new location..."
                            />

                            <div className="mt-3 p-3 bg-light rounded border">
                                <Row className="g-2">
                                    <Col md={12}>
                                        <Form.Label className="small fw-bold text-muted uppercase">Street</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value }
                                            })}
                                            className="bg-white border-0 py-2 shadow-none"
                                            required
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-bold text-muted uppercase">City</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value }
                                            })}
                                            className="bg-white border-0 py-2 shadow-none"
                                            required
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-bold text-muted uppercase">State</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value }
                                            })}
                                            className="bg-white border-0 py-2 shadow-none"
                                            required
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-bold text-muted uppercase">Zip Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, zipCode: e.target.value }
                                            })}
                                            className="bg-white border-0 py-2 shadow-none"
                                            required
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                            >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium border shadow-none" disabled={loading}>
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                            {loading ? 'Updating...' : 'Update Vendor'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default VendorEditModal;
