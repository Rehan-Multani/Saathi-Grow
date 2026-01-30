import React, { useState } from 'react';
import { Card, Table, Button, Form, Badge, Dropdown } from 'react-bootstrap';
import { Clock, MapPin, UserCheck } from 'lucide-react';

const PENDING_DELIVERIES = [
    { id: 'DEL-101', orderId: 'ORD-8801', address: '123 Main St, New York', time: 'ASAP', status: 'Unassigned' },
    { id: 'DEL-102', orderId: 'ORD-8805', address: '456 Park Ave, New York', time: 'Schedule: 2:00 PM', status: 'Unassigned' },
    { id: 'DEL-103', orderId: 'ORD-8806', address: '789 Broadway, New York', time: 'ASAP', status: 'Unassigned' },
];

const DRIVERS = ['John Doe', 'Mike Ross', 'Harvey Specter', 'FastTrack Agent 1'];

const AssignDeliveries = () => {
    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <h5 className="mb-0 fw-bold">Assign Deliveries</h5>
                    <p className="text-muted small mb-0">Select a driver to assign pending orders.</p>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Order Details</th>
                                <th className="border-0 py-3">Delivery Address</th>
                                <th className="border-0 py-3">Timing</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Assign To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PENDING_DELIVERIES.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-primary">{item.orderId}</div>
                                        <div className="small text-muted">{item.id}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2 text-dark">
                                            <MapPin size={16} className="text-secondary" /> {item.address}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2 text-warning fw-medium">
                                            <Clock size={16} /> {item.time}
                                        </div>
                                    </td>
                                    <td><Badge bg="secondary" className="rounded-pill fw-normal px-3">{item.status}</Badge></td>
                                    <td className="text-end pe-4">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle size="sm" variant="outline-primary" className="d-flex align-items-center gap-2 ms-auto">
                                                <UserCheck size={16} /> Assign Driver
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Header>Available Drivers</Dropdown.Header>
                                                {DRIVERS.map((d, i) => (
                                                    <Dropdown.Item key={i} href="#">{d}</Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
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

export default AssignDeliveries;
