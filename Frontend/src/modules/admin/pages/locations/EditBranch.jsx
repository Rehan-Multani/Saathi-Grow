import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Image } from 'react-bootstrap';
import { Save, X, ArrowLeft, Upload, Store } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBranchById, updateBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../../../common/components/forms/GoogleMapsInput';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const EditBranch = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        },
        isActive: true
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        const fetchBranch = async () => {
            try {
                const data = await getBranchById(adminUser.token, id);
                setFormData({
                    name: data.name || '',
                    code: data.code || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        location: { type: 'Point', coordinates: [0, 0] }
                    },
                    isActive: data.isActive ?? true
                });
                if (data.logo) {
                    setLogoPreview(data.logo);
                }
            } catch (error) {
                toast.error('Failed to fetch branch details');
                navigate('/admin/locations/branches');
            } finally {
                setFetching(false);
            }
        };

        if (id && adminUser.token) {
            fetchBranch();
        }
    }, [id, adminUser.token, navigate]);

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: val }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }
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

            await updateBranch(adminUser.token, id, data);
            toast.success('Branch updated successfully');
            navigate('/admin/locations/branches');
        } catch (error) {
            toast.error(error.message || 'Failed to update branch');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Form onSubmit={handleSubmit} className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm border bg-white"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} />
                    </Button>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-bold mb-0 text-nowrap">Edit Branch</h4>
                            <PageInfoTooltip info={pageInfoData.addBranch} />
                        </div>
                        <p className="text-muted small mb-0 uppercase tracking-widest opacity-60">Update Location Details</p>
                    </div>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto gap-2">
                    <Button variant="light" onClick={() => navigate('/admin/locations/branches')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center px-4">
                        <X size={18} /> Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading} className="d-flex align-items-center gap-2 shadow-sm justify-content-center px-4">
                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                        {loading ? 'Updating...' : 'Update Branch'}
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4 p-md-5">
                            <h6 className="fw-bold mb-4 text-primary border-bottom pb-2">Branch Information</h6>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Main Store - Downtown"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Code <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="BNH001"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle text-uppercase font-monospace"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Phone <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="+91 00000 00000"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="branch@sathigro.com"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h6 className="fw-bold mb-3 mt-4 text-primary border-bottom pb-2">Location Details</h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Street Address (Search on Map) <span className="text-danger">*</span></Form.Label>
                                        <GoogleMapsInput
                                            onLocationSelect={handleLocationSelect}
                                            defaultValue={formData.address.street}
                                            placeholder="Search for branch location..."
                                        />
                                        <div className="mt-3">
                                            <Form.Control
                                                type="text"
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleChange}
                                                placeholder="123 Market St"
                                                required
                                                className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">City</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">State</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={handleChange}
                                            placeholder="State"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Zip Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address.zipCode"
                                            value={formData.address.zipCode}
                                            onChange={handleChange}
                                            placeholder="000000"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle font-monospace"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Branch Logo</h6>
                            <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {logoPreview ? (
                                    <div className="position-relative w-100">
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
                                    <div className="text-muted py-4">
                                        <Store className="mb-2 opacity-25" size={48} />
                                        <p className="small mb-0">Drag and drop or click to upload logo</p>
                                    </div>
                                )}
                                <Form.Control
                                    type="file"
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                    onChange={handleLogoChange}
                                    accept="image/*"
                                />
                            </div>
                            <Form.Text className="text-muted small">Recommended size: 500x500px. Max: 2MB</Form.Text>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Branch Settings</h6>
                            <Form.Group className="mb-3 d-flex align-items-center justify-content-between">
                                <Form.Label className="small fw-bold mb-0">Branch Status</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="branch-status-switch"
                                    label={formData.isActive ? "Active" : "Inactive"}
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <p className="small text-muted mb-0">Inactive branches won't be visible in the user app and can't process orders.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default EditBranch;
