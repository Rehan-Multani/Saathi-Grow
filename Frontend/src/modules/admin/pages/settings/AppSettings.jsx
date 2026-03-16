import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Badge, Image } from 'react-bootstrap';
import { Save, Globe, Smartphone, Mail, Layout, Palette, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AppSettings = () => {
    const { t } = useTranslation();

    return (
        <div className="p-3">
            <h4 className="fw-bold mb-4">{t('settings.app.title')}</h4>

            <Row className="g-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">{t('settings.app.general')}</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">{t('settings.app.name')}</Form.Label>
                                            <Form.Control type="text" defaultValue="Saathi-Grow" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">{t('settings.app.slogan')}</Form.Label>
                                            <Form.Control type="text" defaultValue="Organic Excellence at Your Doorstep" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">{t('settings.app.support_email')}</Form.Label>
                                            <Form.Control type="email" defaultValue="support@saathigrow.com" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted fw-bold">{t('settings.app.contact')}</Form.Label>
                                            <Form.Control type="text" defaultValue="+1 800-GROCERY" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-0">
                                    <Form.Label className="small text-muted fw-bold">{t('settings.app.address')}</Form.Label>
                                    <Form.Control as="textarea" rows={2} defaultValue="123 Agro Plaza, Fresh Valley, NY 10001" />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">{t('settings.app.system')}</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold small d-block">{t('settings.app.currency')}</Form.Label>
                                        <Form.Select className="w-100" defaultValue="INR (₹)">
                                            <option>INR (₹)</option>
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="fw-bold small d-block">{t('settings.app.timezone')}</Form.Label>
                                        <Form.Select className="w-100">
                                            <option>(GMT-05:00) Eastern Time</option>
                                            <option>(GMT+05:30) Mumbai, Kolkata</option>
                                            <option>(GMT+00:00) UTC</option>
                                        </Form.Select>
                                    </Col>
                                </Row>
                                <div className="border-top pt-4">
                                    <h6 className="small fw-bold text-muted text-uppercase mb-3">{t('settings.app.feature_toggles')}</h6>
                                    <Form.Check
                                        type="switch"
                                        id="maintenance-mode"
                                        label={t('settings.app.maintenance_desc')}
                                        className="mb-0"
                                    />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end mt-2">
                        <Button variant="primary" size="lg" className="px-5 d-flex align-items-center justify-content-center gap-2">
                            <Save size={20} /> {t('settings.app.save_all')}
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AppSettings;
