import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { Save, Eye } from 'lucide-react';

const TermsConditions = () => {
    const [policyContent, setPolicyContent] = useState(`
## Terms & Conditions

**Effective Date:** January 1, 2024

**1. Agreement to Terms**
These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and SathiGro ("we," "us" or "our"), concerning your access to and use of the SathiGro website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").

**2. Intellectual Property Rights**
Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
    `);

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Terms & Conditions</h4>
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
                        <Form.Label className="fw-bold">Terms Content (Markdown Supported)</Form.Label>
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

export default TermsConditions;
