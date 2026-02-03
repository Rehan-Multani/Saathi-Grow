import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Search, Plus, User, Shield, Briefcase, Mail, Phone, Edit, Trash2, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_STAFF = [
    { id: 'STF-001', name: 'Alice Williams', role: 'Store Manager', email: 'alice@sathigro.com', phone: '+1 555-0201', status: 'Active', permissions: ['All Access'] },
    { id: 'STF-002', name: 'Bob Smith', role: 'Return Specialist', email: 'bob@sathigro.com', phone: '+1 555-0202', status: 'Active', permissions: ['Return Policy: Approve/Deny', 'Order View'] },
    { id: 'STF-003', name: 'Charlie Brown', role: 'Support Agent', email: 'charlie@sathigro.com', phone: '+1 555-0203', status: 'Active', permissions: ['Support Tickets', 'Chat'] },
    { id: 'STF-004', name: 'Diana Prince', role: 'Inventory Clerk', email: 'diana@sathigro.com', phone: '+1 555-0204', status: 'Inactive', permissions: ['Inventory Edit'] },
];

const AVAILABLE_PERMISSIONS = [
    'All Access',
    'Return Policy: Approve/Deny',
    'Order View',
    'Support Tickets',
    'Chat',
    'Inventory Edit',
    'User Management'
];

const AllStaff = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState(INITIAL_STAFF);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [tempPermissions, setTempPermissions] = useState([]);

    const handleOpenPermissionModal = (staff) => {
        setSelectedStaff(staff);
        setTempPermissions([...staff.permissions]);
        setShowPermissionModal(true);
    };

    const handlePermissionToggle = (perm) => {
        if (tempPermissions.includes(perm)) {
            setTempPermissions(tempPermissions.filter(p => p !== perm));
        } else {
            setTempPermissions([...tempPermissions, perm]);
        }
    };

    const handleSavePermissions = () => {
        if (!selectedStaff) return;

        const updatedStaffList = staffList.map(s => {
            if (s.id === selectedStaff.id) {
                return { ...s, permissions: tempPermissions };
            }
            return s;
        });

        setStaffList(updatedStaffList);
        setShowPermissionModal(false);
    };

    const filtered = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="p-3">
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                        <h5 className="mb-0 fw-bold">Staff Management</h5>
                        <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                            <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                                <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search Staff..."
                                    className="border-start-0 ps-0 shadow-none font-small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                            <Link to="/admin/staff/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                                <Plus size={18} />
                                <span className="d-none d-sm-inline">Add Staff</span>
                                <span className="d-inline d-sm-none">Add</span>
                            </Link>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4 border-0 py-3">Staff Profile</th>
                                    <th className="border-0 py-3">Role</th>
                                    <th className="border-0 py-3">Permissions</th>
                                    <th className="border-0 py-3">Status</th>
                                    <th className="border-0 py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center text-primary font-bold">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{s.name}</div>
                                                    <div className="small text-muted d-flex align-items-center gap-2">
                                                        <span>{s.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Briefcase size={14} className="text-muted" />
                                                <span>{s.role}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {s.permissions.map((perm, i) => (
                                                    <Badge
                                                        key={i}
                                                        bg="light"
                                                        text={perm.includes('Return Policy') ? 'primary' : 'dark'}
                                                        className={`border fw-normal ${perm.includes('Return Policy') ? 'border-primary' : ''}`}
                                                    >
                                                        {perm.includes('Return Policy') ? <Shield size={10} className="me-1" /> : null}
                                                        {perm}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={s.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                                {s.status}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-warning"
                                                    title="Manage Permissions"
                                                    onClick={() => handleOpenPermissionModal(s)}
                                                >
                                                    <Key size={16} />
                                                </Button>
                                                <Button variant="light" size="sm" className="btn-icon-soft text-primary" title="Edit Staff">
                                                    <Edit size={16} />
                                                </Button>
                                                <Button variant="light" size="sm" className="btn-icon-soft text-danger" title="Remove Staff">
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

            {/* Permission Modal */}
            <Modal show={showPermissionModal} onHide={() => setShowPermissionModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="h5 fw-bold">Manage Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStaff && (
                        <div>
                            <div className="mb-4 p-3 bg-light rounded d-flex align-items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary fw-bold border shadow-sm" style={{ width: '40px', height: '40px' }}>
                                    {selectedStaff.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="fw-bold">{selectedStaff.name}</div>
                                    <div className="small text-muted">{selectedStaff.role}</div>
                                </div>
                            </div>

                            <h6 className="fw-bold mb-3 text-muted small text-uppercase">Access Control</h6>
                            <div className="d-flex flex-column gap-2">
                                {AVAILABLE_PERMISSIONS.map((perm) => (
                                    <div key={perm} className="d-flex align-items-center justify-content-between p-2 border rounded hover-bg-light">
                                        <div className="d-flex align-items-center gap-2">
                                            {perm.includes('Return Policy') ?
                                                <Shield size={16} className="text-primary" /> :
                                                <div style={{ width: 16 }} />
                                            }
                                            <span className={perm.includes('Return Policy') ? 'fw-medium text-primary' : 'text-dark'}>
                                                {perm}
                                            </span>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id={`perm-switch-${perm}`}
                                            checked={tempPermissions.includes(perm)}
                                            onChange={() => handlePermissionToggle(perm)}
                                            className="custom-switch"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowPermissionModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSavePermissions}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AllStaff;
