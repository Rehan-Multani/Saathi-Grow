import React, { useState } from 'react';
import { Card, Table, Button, Badge, Row, Col, Modal, Form } from 'react-bootstrap';
import { Shield, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ROLES_MOCK = [
    { id: 1, name: 'Super Admin', users: 2, permissions: 'All Access', status: 'Active' },
    { id: 2, name: 'Branch Manager', users: 5, permissions: 'Branch specific', status: 'Active' },
    { id: 3, name: 'Support Staff', users: 8, permissions: 'Support & Helpdesk', status: 'Active' },
    { id: 4, name: 'Content Manager', users: 3, permissions: 'Products & Banners', status: 'Inactive' },
];

const RolesAndPermissions = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Roles & Permissions</h4>
                <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add New Role
                </Button>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4 border-0 py-3">Role Name</th>
                                        <th className="border-0 py-3">Assigned Users</th>
                                        <th className="border-0 py-3">Permissions Scope</th>
                                        <th className="border-0 py-3">Status</th>
                                        <th className="border-0 py-3 text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ROLES_MOCK.map((role, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Shield size={18} className="text-primary" />
                                                    <span className="fw-bold text-dark">{role.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="light" text="dark" className="border">
                                                    {role.users} Users
                                                </Badge>
                                            </td>
                                            <td className="text-muted small">{role.permissions}</td>
                                            <td>
                                                <Badge bg={role.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                                    {role.status}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" className="btn-icon-soft text-primary">
                                                        <Edit size={16} />
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
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm bg-primary text-white mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Permission Levels Information</h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-2">
                                    <CheckCircle size={18} className="text-white mt-1 flex-shrink-0" />
                                    <div className="small"><strong>Full Control:</strong> Access to all modules including financial reports and user management.</div>
                                </div>
                                <div className="d-flex align-items-start gap-2">
                                    <CheckCircle size={18} className="text-white mt-1 flex-shrink-0" />
                                    <div className="small"><strong>Read/Write:</strong> Can manage products and orders but cannot access sensitive settings.</div>
                                </div>
                                <div className="d-flex align-items-start gap-2">
                                    <CheckCircle size={18} className="text-white mt-1 flex-shrink-0" />
                                    <div className="small"><strong>Read Only:</strong> Viewing access for monitoring and reporting purposes.</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Quick Analytics</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Total Roles</span>
                                <span className="fw-bold">4</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted small">Active Permissions</span>
                                <span className="fw-bold text-success">85%</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add Role Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Create New Admin Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Role Name</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Sales Manager" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2">Module Permissions</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Check type="checkbox" label="Manage Orders" className="mb-2" />
                                <Form.Check type="checkbox" label="Manage Products" className="mb-2" />
                                <Form.Check type="checkbox" label="View Reports" className="mb-2" />
                            </Col>
                            <Col md={6}>
                                <Form.Check type="checkbox" label="Manage Customers" className="mb-2" />
                                <Form.Check type="checkbox" label="Support Desk Access" className="mb-2" />
                                <Form.Check type="checkbox" label="System Settings" className="mb-2" />
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary">Create Role</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RolesAndPermissions;
