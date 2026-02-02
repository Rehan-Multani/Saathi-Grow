import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { Save, Eye } from 'lucide-react';

const PrivacyPolicy = () => {
    const [policyContent, setPolicyContent] = useState(`
## Privacy Policy

**Effective Date:** January 1, 2024

**1. Introduction**
Welcome to SathiGro. We are committed to protecting your personal information and your right to privacy.

**2. Information We Collect**
We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.

**3. How We Use Your Information**
We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
    `);

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Privacy Policy</h4>
                <div className="d-flex gap-2 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                    <Button variant="outline-dark" size="sm" className="d-flex align-items-center gap-2 flex-grow-1 flex-sm-grow-0 justify-content-center">
                        <Eye size={16} /> <span className="d-none d-sm-inline">Preview</span>
                        <span className="d-inline d-sm-none">View</span>
                    </Button>
                    <Button variant="primary" size="sm" className="d-flex align-items-center gap-2 flex-grow-1 flex-sm-grow-0 justify-content-center">
                        <Save size={16} /> <span className="d-none d-sm-inline">Save Changes</span>
                        <span className="d-inline d-sm-none">Save</span>
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Policy Content (Markdown Supported)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={20}
                            value={policyContent}
                            onChange={(e) => setPolicyContent(e.target.value)}
                            className="font-monospace"
                            style={{ fontSize: '0.9rem', lineHeight: '1.6' }}
                        />
                    </Form.Group>
                    <div className="text-muted small">
                        * Changes usually take 1-2 hours to reflect on the live website.
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PrivacyPolicy;
