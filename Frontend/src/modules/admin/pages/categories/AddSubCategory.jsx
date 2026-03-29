import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Image as BSImage, Spinner, Badge } from 'react-bootstrap';
import { Save, X, Upload, Image as ImageIcon, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createSubCategory } from '../../api/subcategoryApi';
import { getCategories } from '../../api/categoryApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AddSubCategory = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category: '',
        status: 'Active',
        description: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(adminUser.token);
                setCategories(data.filter(c => c.status === 'Active'));
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load parent categories');
            } finally {
                setCategoriesLoading(false);
            }
        };
        if (adminUser?.token) fetchCategories();
    }, [adminUser.token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Image size should be less than 2MB');
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.category) {
            return toast.error('Subcategory name and parent category are required');
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('category', formData.category);
            data.append('status', formData.status);
            data.append('description', formData.description);

            if (imageFile) {
                data.append('image', imageFile);
            }

            await createSubCategory(adminUser.token, data);
            toast.success('Subcategory created successfully!');
            navigate('/admin/subcategories');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to create subcategory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <h4 className="fw-bold mb-0">Add New Subcategory</h4>
                    <PageInfoTooltip data={pageInfoData.addSubCategory || { title: 'Add Subcategory', description: 'Create a new nested subcategory.' }} />
                </div>
                <Button variant="light" onClick={() => navigate('/admin/subcategories')} className="shadow-sm border d-flex align-items-center gap-1 px-3 py-2" disabled={loading}>
                    <X size={16} /> <span className="fw-medium text-sm">Cancel</span>
                </Button>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <span className="p-2 bg-primary bg-opacity-10 rounded text-primary"><Layers size={18} /></span>
                                    Hierarchy Selection
                                </h6>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">Parent Category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                        disabled={categoriesLoading || loading}
                                    >
                                        <option value="">Select Parent Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </Form.Select>
                                    {categoriesLoading && <Form.Text className="text-primary small">Loading categories...</Form.Text>}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">Subcategory Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Fresh Vegetables"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">Slug (URL) - Optional</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. fresh-vegetables"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none font-monospace"
                                    />
                                    <Form.Text className="text-muted small">Auto-generated from name if left empty.</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-0">
                                    <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of the subcategory..."
                                        className="bg-light border-0 py-2 shadow-none"
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <span className="p-2 bg-green-50 rounded text-green-600"><ImageIcon size={18} /></span>
                                    Subcategory Image
                                </h6>

                                <div
                                    className="text-center mb-4 p-4 border border-dashed rounded-xl bg-light position-relative overflow-hidden shadow-inner"
                                    style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {imagePreview ? (
                                        <div className="position-relative w-100">
                                            <div
                                                className="rounded-xl overflow-hidden shadow-sm mx-auto d-flex align-items-center justify-content-center bg-white"
                                                style={{
                                                    width: '180px',
                                                    height: '180px',
                                                    padding: '15px'
                                                }}
                                            >
                                                <BSImage
                                                    src={imagePreview}
                                                    fluid
                                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 m-0 rounded-circle shadow p-1"
                                                onClick={() => { setImagePreview(null); setImageFile(null); }}
                                                style={{ transform: 'translate(10px, -10px)', zIndex: 5 }}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-muted py-4">
                                            <div className="bg-white rounded-circle shadow-sm p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                                                <Upload className="text-primary" size={32} />
                                            </div>
                                            <p className="small mb-1 fw-bold">Upload Subcategory Image</p>
                                            <p className="text-[10px] text-uppercase tracking-wider">PNG, JPG or WebP</p>
                                        </div>
                                    )}
                                    <Form.Control
                                        type="file"
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        disabled={!!imagePreview || loading}
                                    />
                                </div>

                                <Card className="bg-light border-0 shadow-none overflow-hidden mt-4">
                                    <Card.Body className="p-3">
                                        <div className="p-3 border-bottom bg-white rounded-3 shadow-sm mb-3">
                                            <h6 className="fw-bold mb-0 small uppercase tracking-wider text-muted font-mono mb-3">Publishing</h6>
                                            <Form.Label className="small fw-bold text-muted">Visibility Status</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className="bg-light border-0 py-2 shadow-none mb-4"
                                                disabled={loading}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </Form.Select>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                disabled={loading || categoriesLoading}
                                            >
                                                {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                                                {loading ? 'Creating...' : 'Save Subcategory'}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AddSubCategory;
