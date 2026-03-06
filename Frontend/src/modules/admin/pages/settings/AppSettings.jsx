import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Badge, Image } from 'react-bootstrap';
import { Save, Globe, Smartphone, Mail, Layout, Palette, Upload } from 'lucide-react';

const AppSettings = () => {
    return (
        <div className="p-3">
            <h4 className="fw-bold mb-4">Application Settings</h4>

            <Row className="g-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">General Setup</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">App Name</Form.Label>
                                            <Form.Control type="text" defaultValue="SathiGro" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">Store Slogan</Form.Label>
                                            <Form.Control type="text" defaultValue="Organic Excellence at Your Doorstep" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">Support Email</Form.Label>
                                            <Form.Control type="email" defaultValue="support@sathigro.com" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">Contact Number</Form.Label>
                                            <Form.Control type="text" defaultValue="+1 800-GROCERY" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-0">
                                    <Form.Label className="small text-muted fw-bold">Physical Address</Form.Label>
                                    <Form.Control as="textarea" rows={2} defaultValue="123 Agro Plaza, Fresh Valley, NY 10001" />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">System Configuration</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold small d-block">Default Currency</Form.Label>
                                        <Form.Select className="w-100" defaultValue="INR (₹)">
                                            <option>INR (₹)</option>
                                            <option>USD ($)</option>
                                            <option>EUR (₹)</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="fw-bold small d-block">Time Zone</Form.Label>
                                        <Form.Select className="w-100">
                                            <option>(GMT-05:00) Eastern Time</option>
                                            <option>(GMT+05:30) Mumbai, Kolkata</option>
                                            <option>(GMT+00:00) UTC</option>
                                        </Form.Select>
                                    </Col>
                                </Row>
                                <div className="border-top pt-4">
                                    <h6 className="small fw-bold text-muted text-uppercase mb-3">Feature Toggles</h6>
                                    <Form.Check
                                        type="switch"
                                        id="maintenance-mode"
                                        label="Maintenance Mode (Close Store for public)"
                                        className="mb-0"
                                    />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end mt-2">
                        <Button variant="primary" size="lg" className="px-5 d-flex align-items-center justify-content-center gap-2">
                            <Save size={20} /> Save All Settings
                        </Button>
                    </div>
                </Col>


            </Row>
        </div>
    );
};

export default AppSettings;
