import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, Facebook, Twitter, Instagram, Linkedin, Globe, MessageCircle } from 'lucide-react';

const SocialProfile = () => {
    return (
        <div className="p-3">
            <h4 className="fw-bold mb-4">Social Media Profiles</h4>

            <Row className="g-0">
                <Col xs={12}>
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-gradient-to-r from-blue-50 to-white py-4 px-4 border-b border-gray-100 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0 fw-black text-gray-900 uppercase tracking-tight">Connect Your Platforms</h6>
                                <p className="text-gray-400 text-[10px] fw-bold uppercase tracking-widest mt-1 opacity-60">Social Media & Contact Assets</p>
                            </div>
                            <Button variant="primary" size="sm" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold">
                                <Save size={16} /> Save Links
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5">
                            <Form>
                                <p className="text-muted small mb-4">These links will be displayed in your store footer and "Contact Us" pages.</p>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Facebook URL</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Facebook size={18} className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
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
                                            placeholder="https://twitter.com/yourstore"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">LinkedIn URL</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Linkedin size={18} className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="https://linkedin.com/company/yourstore"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">WhatsApp Support Number</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <MessageCircle size={18} className="text-success" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="+1 234 567 890"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">Enter number with country code for "Chat on WhatsApp" feature.</Form.Text>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className="small fw-bold">Official Website</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <Globe size={18} className="text-secondary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="https://www.yourstore.com"
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SocialProfile;
