import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown } from 'react-bootstrap';
import { Search, Plus, MoreHorizontal, Store, Mail, Phone, CheckCircle, Ban, Upload, Download, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import VendorDetailsModal from '../../components/vendors/VendorDetailsModal';
import VendorEditModal from '../../components/vendors/VendorEditModal';
import Swal from 'sweetalert2';


const INITIAL_VENDORS = [
    { id: 'VND-001', name: 'Fresh Farms Ltd', owner: 'Robert Fox', email: 'robert@freshfarms.com', phone: '+1 555-0123', products: 45, status: 'Active', rating: 4.8 },
    { id: 'VND-002', name: 'Tech World', owner: 'Cody Fisher', email: 'cody@techworld.com', phone: '+1 555-0124', products: 120, status: 'Pending', rating: 0 },
    { id: 'VND-003', name: 'Urban Styles', owner: 'Esther Howard', email: 'esther@urban.com', phone: '+1 555-0125', products: 32, status: 'Blocked', rating: 3.5 },
];

const AllVendors = () => {
    const [vendors, setVendors] = useState(INITIAL_VENDORS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const filtered = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowDetailsModal(true);
    };

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setShowEditModal(true);
    };

    const handleSave = (updatedVendor) => {
        setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
        Swal.fire({
            title: 'Success!',
            text: 'Vendor details updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Vendor?',
            text: `Are you sure you want to remove ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setVendors(vendors.filter(v => v.id !== id));
                Swal.fire('Deleted!', 'Vendor has been removed.', 'success');
            }
        });
    };

    return (
        <div className="p-3 p-md-4">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-primary d-none d-md-flex">
                            <Store size={20} />
                        </div>
                        <div className="d-flex align-items-center gap-3 text-nowrap">
                            <h5 className="mb-0 fw-bold">All Vendors</h5>
                            <Badge bg="primary" pill>{filtered.length}</Badge>
                        </div>
                    </div>
                    <div className="d-flex flex-column flex-md-row gap-2 flex-grow-1 justify-content-lg-end">
                        <InputGroup className="w-100" style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name, ID or owner..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <div className="d-flex gap-2 w-100 w-md-auto">
                            <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 border shadow-sm px-3">
                                <Upload size={18} className="text-success" /> <span className="d-none d-sm-inline">Import</span>
                            </Button>
                            <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 border shadow-sm px-3">
                                <Download size={18} className="text-primary" /> <span className="d-none d-sm-inline">Export</span>
                            </Button>
                            <Link to="/admin/vendors/add" className="btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm">
                                <Plus size={18} /> <span>Add New</span>
                            </Link>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Vendor Name</th>
                                <th className="border-0 py-3">Contact Person</th>
                                <th className="border-0 py-3 text-center">Products</th>
                                <th className="border-0 py-3 text-center">Rating</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((v) => (
                                <tr key={v.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/admin/vendors/${v.id}`}
                                                    className="fw-bold text-dark text-decoration-none hover-primary transition-colors d-block"
                                                >
                                                    {v.name}
                                                </Link>
                                                <div className="small text-muted">{v.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1 small text-muted">
                                            <div className="fw-medium text-dark">{v.owner}</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Mail size={12} /> {v.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-bold text-center">{v.products}</td>
                                    <td className="text-center">
                                        <Badge bg="light" text="dark" className="border shadow-none">
                                            ⭐ {v.rating > 0 ? v.rating : 'New'}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={
                                            v.status === 'Active' ? 'success' :
                                                v.status === 'Pending' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {v.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-warning border shadow-none"
                                                onClick={() => handleEdit(v)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-danger border shadow-none"
                                                onClick={() => handleDelete(v.id, v.name)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                            <Dropdown align="end">
                                                <Dropdown.Toggle variant="light" size="sm" className="text-muted border shadow-none p-1 no-caret btn-icon-soft">
                                                    <MoreHorizontal size={18} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="border shadow-sm p-2">
                                                    <Dropdown.Item onClick={() => handleViewDetails(v)} className="rounded">View Info</Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    {v.status !== 'Active' && (
                                                        <Dropdown.Item href="#" className="text-success rounded"><CheckCircle size={16} className="me-2" /> Approve</Dropdown.Item>
                                                    )}
                                                    {v.status !== 'Blocked' && (
                                                        <Dropdown.Item href="#" className="text-danger rounded"><Ban size={16} className="me-2" /> Block</Dropdown.Item>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted small">
                                        No vendors found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <VendorDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                vendor={selectedVendor}
            />

            <VendorEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                vendor={selectedVendor}
                onSave={handleSave}
            />
        </div>
    );
};

export default AllVendors;
