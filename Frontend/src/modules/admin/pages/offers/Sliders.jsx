import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Image, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDERS_MOCK = [
    { id: '1', title: 'Main Hero Slider', location: 'Home Page - Top', slides: 3, status: 'Active' },
    { id: '2', title: 'Seasonal Promotions', location: 'Home Page - Middle', slides: 2, status: 'Active' },
    { id: '3', title: 'Category Highlight', location: 'Category Page', slides: 1, status: 'Inactive' },
];

const Sliders = () => {
    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">App Sliders</h5>
                    <Link to="/admin/sliders/add" className="btn btn-primary d-flex align-items-center gap-2 ms-auto">
                        <Plus size={18} /> Add New Slider
                    </Link>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Slider Name</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3">Slides Count</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SLIDERS_MOCK.map((s, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Image size={20} />
                                            </div>
                                            <span className="fw-bold text-dark">{s.title}</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{s.location}</td>
                                    <td>{s.slides} Images</td>
                                    <td>
                                        <Badge bg={s.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {s.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="light" size="sm" className="btn-icon-soft text-primary">
                                                <Eye size={16} /> Manage Images
                                            </Button>
                                            <Button variant="light" size="sm" className="btn-icon-soft text-danger">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Sliders;
