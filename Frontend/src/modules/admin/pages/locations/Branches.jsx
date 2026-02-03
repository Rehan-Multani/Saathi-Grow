import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { Search, Plus, MapPin, Store, Edit, Trash2, Info, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import BranchDetailsModal from '../../components/locations/BranchDetailsModal';
import EditBranchModal from '../../components/locations/EditBranchModal';
import Swal from 'sweetalert2';

const INITIAL_BRANCHES = [
    { id: '1', name: 'Main Store - Downtown', address: '123 Market St, Downtown', phone: '+91 98765 43210', manager: 'Sarah Connor', status: 'Active' },
    { id: '2', name: 'Northside Branch', address: '456 North Ave, Uptown', phone: '+91 98765 43211', manager: 'Kyle Reese', status: 'Active' },
    { id: '3', name: 'West Mall Kiosk', address: '789 West Mall, Westside', phone: '+91 98765 43212', manager: 'John Connor', status: 'Inactive' },
];

const Branches = () => {
    const [branches, setBranches] = useState(INITIAL_BRANCHES);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const filtered = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.manager.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowDetails = (branch) => {
        setSelectedBranch(branch);
        setShowDetailsModal(true);
    };

    const handleEdit = (id) => {
        const branch = branches.find(b => b.id === id);
        setSelectedBranch(branch);
        setShowEditModal(true);
    };

    const handleSaveBranch = (updatedBranch) => {
        setBranches(branches.map(b => b.id === updatedBranch.id ? updatedBranch : b));
        Swal.fire({
            title: 'Updated!',
            text: 'Branch details have been updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${name}. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setBranches(branches.filter(b => b.id !== id));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Branch has been removed.',
                    icon: 'success',
                    confirmButtonColor: '#0c831f'
                });
            }
        });
    };

    const handleExport = () => {
        Swal.fire({
            title: 'Exporting...',
            text: 'Preparing store branches list...',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        }).then(() => {
            Swal.fire('Exported!', 'The branch list has been downloaded.', 'success');
        });
    };

    const handleImport = () => {
        Swal.fire({
            title: 'Import Branches',
            text: 'Select a file to import branches from.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Choose File'
        });
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <Store size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Store Branches</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Manage your retail locations, managers, and operational status.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search location or manager..."
                            className="border-start-0 ps-0 shadow-none py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <div className="d-flex flex-row gap-2 w-100 w-md-auto">
                        <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 border shadow-sm px-2 px-lg-3 py-2" onClick={handleImport}>
                            <Upload size={18} className="text-success" /> <span className="small fw-medium">Import</span>
                        </Button>
                        <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 border shadow-sm px-2 px-lg-3 py-2" onClick={handleExport}>
                            <Download size={18} className="text-primary" /> <span className="small fw-medium">Export</span>
                        </Button>
                        <Link to="/admin/locations/branches/add" className="btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 px-2 px-lg-4 shadow-sm py-2 text-nowrap">
                            <Plus size={18} /> <span className="small fw-bold">Add Branch</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Branch Details</th>
                                <th className="border-0 py-3">Manager</th>
                                <th className="border-0 py-3">Phone</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((b) => (
                                <tr key={b.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{b.name}</div>
                                                <div className="text-muted small d-flex align-items-center gap-1">
                                                    <MapPin size={12} /> {b.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-medium text-secondary">{b.manager}</td>
                                    <td className="text-muted font-monospace small">{b.phone}</td>
                                    <td>
                                        <Badge
                                            bg={b.status === 'Active' ? 'success' : 'secondary'}
                                            className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                        >
                                            {b.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-primary border shadow-none"
                                                onClick={() => handleShowDetails(b)}
                                                title="View Details"
                                            >
                                                <Info size={16} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-warning border shadow-none"
                                                onClick={() => handleEdit(b.id)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-danger border shadow-none"
                                                onClick={() => handleDelete(b.id, b.name)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="text-muted">No branches found matching your search.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <BranchDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                branch={selectedBranch}
                onEdit={handleEdit}
            />

            <EditBranchModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                branch={selectedBranch}
                onSave={handleSaveBranch}
            />
        </div>
    );
};

export default Branches;
