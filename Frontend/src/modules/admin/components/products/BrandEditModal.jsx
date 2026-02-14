import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Image } from 'react-bootstrap';
import { Save, Camera, X } from 'lucide-react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { getCategories } from '../../api/categoryApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const BrandEditModal = ({ show, onHide, brand, onSave }) => {
    const { adminUser } = useAdminAuth();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        status: 'Active',
        website: '',
        description: ''
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempLogo, setTempLogo] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(adminUser.token);
                setCategories(data.filter(c => c.status === 'Active'));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        if (show && adminUser?.token) fetchCategories();
    }, [show, adminUser]);

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name || '',
                category: brand.category || '',
                status: brand.status || 'Active',
                website: brand.website || '',
                description: brand.description || ''
            });
            setLogoPreview(brand.logo || null);
            setLogoFile(null);
        }
    }, [brand]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempLogo(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleCropComplete = (croppedImageBase64) => {
        setLogoPreview(croppedImageBase64);
        const file = dataURLtoFile(croppedImageBase64, 'brand-logo.jpg');
        setLogoFile(file);
        setShowCropper(false);
        setTempLogo(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('status', formData.status);
        data.append('website', formData.website);
        data.append('description', formData.description);

        if (logoFile) {
            data.append('logo', logoFile);
        }

        onSave(data);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="brand-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Edit Brand Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4 pb-4">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={4} className="text-center mb-4 mb-md-0">
                            <div className="position-relative d-inline-block">
                                <div
                                    className="bg-light rounded border d-flex align-items-center justify-content-center overflow-hidden mb-3"
                                    style={{ width: '150px', height: '150px' }}
                                >
                                    {logoPreview ? (
                                        <Image src={logoPreview} className="w-100 h-100 object-fit-contain" />
                                    ) : (
                                        <div className="text-muted small">No Logo</div>
                                    )}
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Camera size={16} />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                            </div>
                            <p className="text-muted small mt-2">Update Brand Logo</p>
                        </Col>

                        <Col md={8}>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="small fw-medium text-muted">Brand Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2"
                                        required
                                    />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="small fw-medium text-muted">Category</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <Form.Label className="small fw-medium text-muted">Website</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                />
                            </div>

                            <div className="mb-3">
                                <Form.Label className="small fw-medium text-muted">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                />
                            </div>

                            <div className="mb-3">
                                <Form.Label className="small fw-medium text-muted">Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm">
                            <Save size={18} /> Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>

            <ImageCropperModal
                show={showCropper}
                imageSrc={tempLogo}
                onCancel={() => { setShowCropper(false); setTempLogo(null); }}
                onCropComplete={handleCropComplete}
                aspect={1}
            />
        </Modal>
    );
};

export default BrandEditModal;
