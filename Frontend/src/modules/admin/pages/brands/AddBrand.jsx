import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image, Spinner } from 'react-bootstrap';
import { Save, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createBrand } from '../../api/brandApi';
import { getCategories } from '../../api/categoryApi';
import { toast } from 'react-toastify';

const AddBrand = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        status: 'Active',
        website: '',
        description: ''
    });

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(adminUser.token);
                setCategories(data.filter(c => c.status === 'Active'));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        if (adminUser?.token) fetchCategories();
    }, [adminUser]);

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempLogo, setTempLogo] = useState(null);

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

    // Helper to convert base64 to file
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.category) {
            return toast.error('Name and Category are required');
        }

        setLoading(true);
        try {
            const brandData = new FormData();
            brandData.append('name', formData.name);
            brandData.append('category', formData.category);
            brandData.append('status', formData.status);
            brandData.append('website', formData.website);
            brandData.append('description', formData.description);
            if (logoFile) {
                brandData.append('logo', logoFile);
            }

            await createBrand(adminUser.token, brandData);
            toast.success('Brand created successfully!');
            navigate('/admin/brands');
        } catch (error) {
            toast.error(error.message || 'Failed to create brand');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add New Brand</h4>
                <Button variant="light" onClick={() => navigate('/admin/brands')} disabled={loading}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Brand Details</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Brand Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Nike"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Website (Optional)</Form.Label>
                                    <Form.Control
                                        type="url"
                                        placeholder="https://example.com"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Tell us about the brand..."
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Brand Logo</h6>
                                <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative">
                                    {logoPreview ? (
                                        <div className="position-relative">
                                            <Image src={logoPreview} fluid rounded style={{ maxHeight: '150px' }} />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                                                onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-muted">
                                            <Upload className="mb-2" size={32} />
                                            <p className="small mb-0">Upload Logo</p>
                                        </div>
                                    )}
                                    <Form.Control
                                        type="file"
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                        onChange={handleLogoChange}
                                        accept="image/*"
                                        disabled={!!logoPreview || loading}
                                    />
                                    <ImageCropperModal
                                        show={showCropper}
                                        imageSrc={tempLogo}
                                        onCancel={() => { setShowCropper(false); setTempLogo(null); }}
                                        onCropComplete={handleCropComplete}
                                        aspect={1}
                                    />
                                </div>
                                <p className="text-center text-muted small">Square logo recommended (e.g. 512x512)</p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Status</h6>
                                <Form.Select name="status" value={formData.status} onChange={handleChange} disabled={loading}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {loading ? 'Saving...' : 'Save Brand'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AddBrand;
