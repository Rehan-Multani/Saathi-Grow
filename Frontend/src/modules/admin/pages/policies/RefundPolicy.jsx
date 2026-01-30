import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { Save, Eye } from 'lucide-react';

const RefundPolicy = () => {
    const [policyContent, setPolicyContent] = useState(`
## Refund Policy

**Last Updated:** February 14, 2024

**1. General**
Thank you for shopping at SathiGro. If, for any reason, You are not completely satisfied with a purchase We invite You to review our policy on refunds and returns.

**2. Returns**
We do not accept returns on perishable goods (such as fresh fruits, vegetables, dairy, etc.). For non-perishable items, you have 15 days to return an item from the date you received it.
To be eligible for a return, your item must be unused and in the same condition that you received it.

**3. Refunds**
Once we receive your return, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
If your refund is approved, we will initiate a refund to your credit card (or original method of payment).
    `);

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Refund Policy</h4>
                <div className="d-flex gap-2">
                    <Button variant="outline-dark" size="sm" className="d-flex align-items-center gap-2">
                        <Eye size={16} /> Preview
                    </Button>
                    <Button variant="primary" size="sm" className="d-flex align-items-center gap-2">
                        <Save size={16} /> Save Changes
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

export default RefundPolicy;
