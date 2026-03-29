import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Image } from 'react-bootstrap';
import { Save, X, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../api/categoryApi';

const SubCategoryEditModal = ({ show, onHide, subCategory, onSave }) => {
    const { t } = useTranslation();
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
                // We need the admin token here, but for simple dropdowns we might have it in a context 
                // However, the caller should pass the token or we get it from context
                // For now let's assume getCategories can be called with null or the modal is wrapped in a way it has access to context
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        if (show) fetchCategories();
    }, [show]);

    useEffect(() => {
        if (subCategory) {
            setFormData({
                name: subCategory.name || '',
                slug: subCategory.slug || '',
                category: subCategory.category?._id || subCategory.category || '',
                status: subCategory.status || 'Active',
                description: subCategory.description || ''
            });
            setImagePreview(subCategory.image || null);
            setImageFile(null);
        }
    }, [subCategory]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            await onSave(data);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">{t('subcategories.edit_title', { defaultValue: 'Edit Subcategory' })}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col md={7}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Subcategory Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Slug</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none font-monospace"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Visibility Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-0">
                                <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={5} className="border-start">
                            <Form.Label className="small fw-bold text-muted">Subcategory Image</Form.Label>
                            <div
                                className="text-center p-4 border border-dashed rounded-xl bg-light position-relative overflow-hidden mb-3"
                                style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {imagePreview ? (
                                    <div className="position-relative w-100">
                                        <Image src={imagePreview} fluid className="rounded shadow-sm" style={{ maxHeight: '150px' }} />
                                        <label className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle cursor-pointer shadow">
                                            <Upload size={14} />
                                            <input type="file" className="d-none" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer py-4 d-block w-100">
                                        <Upload size={30} className="text-muted mb-2" />
                                        <div className="small text-muted">Upload Image</div>
                                        <input type="file" className="d-none" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} disabled={loading} className="px-4 py-2 text-secondary fw-medium shadow-sm border">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading} className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2">
                            {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SubCategoryEditModal;
