import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { Save, Facebook, Twitter, Instagram, Linkedin, Globe, MessageCircle, Mail, Phone, Loader } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as settingApi from '../../api/settingApi';
import { toast } from 'react-toastify';

const SocialProfile = () => {
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        whatsappNumber: '',
        officialWebsite: '',
        supportPhone: '',
        supportEmail: ''
    });

    useEffect(() => {
        if (token) fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        try {
            const data = await settingApi.getAdminSettings(token);
            setSettings({
                facebookUrl: data.facebookUrl || '',
                instagramUrl: data.instagramUrl || '',
                twitterUrl: data.twitterUrl || '',
                linkedinUrl: data.linkedinUrl || '',
                whatsappNumber: data.whatsappNumber || '',
                officialWebsite: data.officialWebsite || '',
                supportPhone: data.supportPhone || '',
                supportEmail: data.supportEmail || ''
            });
        } catch (error) {
            toast.error('Failed to load social profiles.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await settingApi.updateAdminSettings(token, settings);
            toast.success('Social profiles and contact information updated!');
        } catch (error) {
            toast.error('Failed to update settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted fw-bold animate-pulse">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Social & Contact Links</h4>
                <Button 
                    variant="primary" 
                    size="sm" 
                    className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>

            <Row className="g-4">
                <Col lg={7}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <Card.Header className="bg-gradient-to-r from-blue-50 to-white py-3 px-4 border-b border-gray-100">
                            <div>
                                <h6 className="mb-0 fw-black text-gray-900 uppercase tracking-tight">Connect Your Platforms</h6>
                                <p className="text-gray-400 text-[10px] fw-bold uppercase tracking-widest mt-1 opacity-60">Social Media Assets</p>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5">
                            <Form onSubmit={handleSave}>
                                <p className="text-muted small mb-4">These links will be displayed in your store footer and customer pages.</p>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Facebook URL</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Facebook size={18} className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            name="facebookUrl"
                                            value={settings.facebookUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://facebook.com/yourstore"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Instagram URL</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Instagram size={18} className="text-danger" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            name="instagramUrl"
                                            value={settings.instagramUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://instagram.com/yourstore"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Twitter (X) URL</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Twitter size={18} className="text-dark" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            name="twitterUrl"
                                            value={settings.twitterUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://twitter.com/yourstore"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-0">
                                    <Form.Label className="small fw-bold">LinkedIn URL</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Linkedin size={18} className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            name="linkedinUrl"
                                            value={settings.linkedinUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://linkedin.com/company/yourstore"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <Card.Header className="bg-gradient-to-r from-emerald-50 to-white py-3 px-4 border-b border-gray-100">
                            <div>
                                <h6 className="mb-0 fw-black text-emerald-900 uppercase tracking-tight">Direct Contact Info</h6>
                                <p className="text-emerald-400 text-[10px] fw-bold uppercase tracking-widest mt-1 opacity-60">Customer Support Gates</p>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">WhatsApp Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <MessageCircle size={18} className="text-success" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="whatsappNumber"
                                        value={settings.whatsappNumber}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                        className="border-start-0"
                                    />
                                </InputGroup>
                                <Form.Text className="text-muted extra-small">Include country code for direct WhatsApp chat.</Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">Support Phone</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Phone size={18} className="text-blue-500" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="supportPhone"
                                        value={settings.supportPhone}
                                        onChange={handleInputChange}
                                        placeholder="+91 123 456 7890"
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">Support Email</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Mail size={18} className="text-rose-500" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="supportEmail"
                                        value={settings.supportEmail}
                                        onChange={handleInputChange}
                                        placeholder="support@sathigro.com"
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-0">
                                <Form.Label className="small fw-bold">Official Website</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Globe size={18} className="text-secondary" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="officialWebsite"
                                        value={settings.officialWebsite}
                                        onChange={handleInputChange}
                                        placeholder="https://www.yourstore.com"
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SocialProfile;
