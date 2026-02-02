import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Table } from 'react-bootstrap';
import { CreditCard, IndianRupee, Receipt, Info, Plus } from 'lucide-react';

const BillingSettings = () => {
    return (
        <div className="p-3">
            <h4 className="fw-bold mb-4">Tax & Billing Settings</h4>

            <Row className="g-4">
                <Col lg={7}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">Tax Information</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Organization TIN/GSTIN</Form.Label>
                                            <Form.Control type="text" defaultValue="GST29AABCS1234Z" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Tax ID Type</Form.Label>
                                            <Form.Select>
                                                <option>GST (India)</option>
                                                <option>VAT (UK/EU)</option>
                                                <option>Sales Tax (US)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Default Tax Rate (%)</Form.Label>
                                            <Form.Control type="number" defaultValue="18" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Tax Calculation</Form.Label>
                                            <Form.Select>
                                                <option>Exclusive</option>
                                                <option>Inclusive</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant="primary" className="mt-2">Update Tax Profile</Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">Payment Methods (Incoming)</h6>
                            <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-1">
                                <Plus size={14} /> Add Method
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0">
                                <thead>
                                    <tr className="bg-light small">
                                        <th className="ps-4">Method</th>
                                        <th>Provider</th>
                                        <th>Status</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-middle">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <CreditCard size={18} className="text-primary" />
                                                <span className="fw-medium">UPI / GPay</span>
                                            </div>
                                        </td>
                                        <td>Razorpay</td>
                                        <td><span className="badge bg-success-soft text-success rounded-pill px-3">Connected</span></td>
                                        <td className="text-end pe-4">
                                            <Button variant="link" size="sm" className="text-muted">Configure</Button>
                                        </td>
                                    </tr>
                                    <tr className="align-middle">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <Receipt size={18} className="text-primary" />
                                                <span className="fw-medium">Cards Checkout</span>
                                            </div>
                                        </td>
                                        <td>Stripe</td>
                                        <td><span className="badge bg-warning-soft text-warning rounded-pill px-3">Setup Required</span></td>
                                        <td className="text-end pe-4">
                                            <Button variant="link" size="sm" className="text-primary">Connect</Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="border-0 shadow-sm bg-light mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                    <IndianRupee size={24} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Platform Wallet Balance</h6>
                                    <h3 className="fw-bold mb-0 text-primary">₹45,280.50</h3>
                                </div>
                            </div>
                            <Button variant="primary" className="w-100 py-2 mb-2">Withdraw to Bank</Button>
                            <p className="text-muted small text-center mb-0">Bank processing takes 2-3 business days.</p>
                        </Card.Body>
                    </Card>

                    <Alert variant="info" className="border-0 shadow-sm">
                        <div className="d-flex gap-2">
                            <Info size={20} className="flex-shrink-0" />
                            <div className="small">
                                <strong>Auto-Invoicing is enabled.</strong> Invoices are automatically generated and sent to customers upon order completion.
                            </div>
                        </div>
                    </Alert>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">Recent Invoices Generated</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush small">
                                <div className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 border-0">
                                    <div>
                                        <div className="fw-bold">INV-9821</div>
                                        <div className="text-muted">John Doe - ₹120.00</div>
                                    </div>
                                    <Button variant="outline-dark" size="sm">PDF</Button>
                                </div>
                                <div className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 border-0">
                                    <div>
                                        <div className="fw-bold">INV-9820</div>
                                        <div className="text-muted">Sarah Smith - ₹45.00</div>
                                    </div>
                                    <Button variant="outline-dark" size="sm">PDF</Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BillingSettings;
