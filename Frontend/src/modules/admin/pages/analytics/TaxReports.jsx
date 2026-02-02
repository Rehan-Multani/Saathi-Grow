import React, { useState } from 'react';
import { Card, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Download, FileText, Printer, Calculator, AlertTriangle } from 'lucide-react';
import TaxDocModal from './TaxDocModal';

const TAX_DATA = [
    { id: 'GST-1001', period: 'Nov 2023', taxable: '₹25,000.00', gst: '₹1,250.00', status: 'Filed' },
    { id: 'GST-1002', period: 'Oct 2023', taxable: '₹22,500.00', gst: '₹1,125.00', status: 'Filed' },
    { id: 'GST-1003', period: 'Sep 2023', taxable: '₹18,000.00', gst: '₹900.00', status: 'Audited' },
];

const TaxReports = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleViewDoc = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Tax & GST Reports</h4>
                <div className="w-100 w-sm-auto d-flex justify-content-end">
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm">
                        <Download size={16} /> <span className="d-none d-sm-inline">Download 1099-K</span>
                        <span className="d-inline d-sm-none">Download</span>
                    </Button>
                </div>
            </div>

            <Row className="mb-4 g-3">
                <Col xs={12} lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">Tax Filing History</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4 border-0 py-3">Filing ID</th>
                                        <th className="border-0 py-3">Period</th>
                                        <th className="border-0 py-3">Taxable Sales</th>
                                        <th className="border-0 py-3">Collected Tax</th>
                                        <th className="border-0 py-3">Status</th>
                                        <th className="border-0 py-3 text-end pe-4">Docs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TAX_DATA.map((t, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-bold font-monospace text-primary">{t.id}</td>
                                            <td>{t.period}</td>
                                            <td>{t.taxable}</td>
                                            <td className="fw-bold">{t.gst}</td>
                                            <td>
                                                <span className={`badge bg-${t.status === 'Filed' ? 'success' : 'warning'} rounded-pill fw-normal px-3`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-secondary"
                                                    title="View PDF"
                                                    onClick={() => handleViewDoc(t)}
                                                >
                                                    <FileText size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={4}>
                    <Card className="border-0 shadow-sm bg-light mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <Calculator size={20} className="me-2 text-primary" />
                                <h6 className="fw-bold mb-0">Sales Tax Settings</h6>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted text-uppercase fw-bold">Standard GST Rate (%)</Form.Label>
                                <Form.Control type="number" defaultValue="5.0" />
                            </Form.Group>
                            <Form.Check
                                type="switch"
                                id="auto-tax"
                                label="Automated Tax Calculation"
                                defaultChecked
                                className="mb-3"
                            />
                            <Button variant="primary" size="sm" className="w-100">Update Settings</Button>
                        </Card.Body>
                    </Card>
                    <Alert variant="info" className="border-0 shadow-sm d-flex align-items-start small">
                        <AlertTriangle size={18} className="me-2 mt-1 flex-shrink-0" />
                        <div>
                            <strong>Upcoiming Deadline:</strong> Quarter 4 tax filing is due by Jan 15th. Ensure all sales data is reconciled.
                        </div>
                    </Alert>
                </Col>
            </Row>

            <TaxDocModal
                show={showModal}
                onHide={() => setShowModal(false)}
                doc={selectedDoc}
            />
        </div>
    );
};

export default TaxReports;
