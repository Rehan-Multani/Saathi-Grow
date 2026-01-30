import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { Plus, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const BANNERS_MOCK = [
    { title: 'Black Friday Sale', image: 'https://via.placeholder.com/600x200?text=Black+Friday', link: '/categories/electronics', status: 'Active' },
    { title: 'New Arrivals', image: 'https://via.placeholder.com/600x200?text=New+Arrivals', link: '/categories/fashion', status: 'Active' },
    { title: 'Grocery Bundle', image: 'https://via.placeholder.com/600x200?text=Grocery+Deal', link: '/products/bundle', status: 'Inactive' },
];

const Banners = () => {
    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Promotional Banners</h5>
                    <Link to="/admin/banners/add" className="btn btn-primary d-flex align-items-center gap-2">
                        <Plus size={18} /> Add Banner
                    </Link>
                </Card.Body>
            </Card>

            <Row className="g-4">
                {BANNERS_MOCK.map((b, idx) => (
                    <Col md={6} lg={4} key={idx}>
                        <Card className="border-0 shadow-sm h-100 overflow-hidden">
                            <div className="position-relative">
                                <img src={b.image} className="card-img-top" alt={b.title} style={{ height: '150px', objectFit: 'cover' }} />
                                <Badge bg={b.status === 'Active' ? 'success' : 'secondary'} className="position-absolute top-0 end-0 m-2">
                                    {b.status}
                                </Badge>
                            </div>
                            <Card.Body>
                                <h6 className="fw-bold mb-1">{b.title}</h6>
                                <div className="text-muted small mb-3">Links to: <span className="text-primary">{b.link}</span></div>
                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-1">
                                        <Trash2 size={14} /> Remove
                                    </Button>
                                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-1">
                                        <ExternalLink size={14} /> Edit
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Banners;
