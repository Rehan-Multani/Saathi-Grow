import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { Search, Plus, MapPin, Archive, Info, Edit, Trash2, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import WarehouseDetailsModal from '../../components/locations/WarehouseDetailsModal';
import EditWarehouseModal from '../../components/locations/EditWarehouseModal';
import Swal from 'sweetalert2';

const INITIAL_WAREHOUSES = [
    { id: '1', name: 'Central Distribution Center', location: 'Industrial Park, Zone A', capacity: '10,000 sqft', stockLevel: '85%', status: 'Active' },
    { id: '2', name: 'Eastside Storage', location: 'East Highway Rd', capacity: '5,000 sqft', stockLevel: '40%', status: 'Active' },
    { id: '3', name: 'Overflow Depot', location: 'Old factory dist', capacity: '2,000 sqft', stockLevel: '0%', status: 'Maintenance' },
];

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    const filtered = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowDetails = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowDetailsModal(true);
    };

    const handleEdit = (id) => {
        const warehouse = warehouses.find(w => w.id === id);
        setSelectedWarehouse(warehouse);
        setShowEditModal(true);
    };

    const handleSaveWarehouse = (updatedWarehouse) => {
        setWarehouses(warehouses.map(w => w.id === updatedWarehouse.id ? updatedWarehouse : w));
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Warehouse?',
            text: `Are you sure you want to remove ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setWarehouses(warehouses.filter(w => w.id !== id));
                Swal.fire('Deleted!', 'Warehouse has been removed.', 'success');
            }
        });
    };

    const handleExport = () => {
        Swal.fire({
            title: 'Exporting Data',
            text: 'Downloading warehouse inventory logs...',
            icon: 'info',
            timer: 1200,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        }).then(() => {
            Swal.fire('Ready!', 'CSV file downloaded.', 'success');
        });
    };

    const handleImport = () => {
        Swal.fire({
            title: 'Import Inventory',
            text: 'Update multiple warehouse stock levels via CSV.',
            icon: 'question',
            showCancelButton: true
        });
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-amber-100 p-3 rounded-3 text-amber-600 d-none d-md-flex">
                        <Archive size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Warehouses</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Stock distribution hubs and storage centers.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search warehouse..."
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
                        <Link to="/admin/locations/warehouses/add" className="btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 px-2 px-lg-4 shadow-sm py-2 text-nowrap">
                            <Plus size={18} /> <span className="small fw-bold">Add New</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Warehouse Name</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3">Capacity</th>
                                <th className="border-0 py-3">Stock Level</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((w) => (
                                <tr key={w.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-amber-50 p-2 rounded text-amber-600">
                                                <Archive size={20} />
                                            </div>
                                            <span className="fw-bold text-dark">{w.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <MapPin size={14} /> {w.location}
                                        </div>
                                    </td>
                                    <td className="text-muted small">{w.capacity}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                                            <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                <div
                                                    className={`progress-bar ${parseInt(w.stockLevel) > 80 ? 'bg-danger' : parseInt(w.stockLevel) > 50 ? 'bg-warning' : 'bg-success'}`}
                                                    style={{ width: w.stockLevel }}
                                                ></div>
                                            </div>
                                            <span className="small fw-bold text-dark">{w.stockLevel}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={w.status === 'Active' ? 'success' : 'warning'} className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {w.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-primary border shadow-none"
                                                onClick={() => handleShowDetails(w)}
                                            >
                                                <Info size={16} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-warning border shadow-none"
                                                onClick={() => handleEdit(w.id)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-danger border shadow-none"
                                                onClick={() => handleDelete(w.id, w.name)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="text-muted">No warehouses found.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <WarehouseDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                warehouse={selectedWarehouse}
                onEdit={handleEdit}
            />

            <EditWarehouseModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                warehouse={selectedWarehouse}
                onSave={handleSaveWarehouse}
            />
        </div>
    );
};

export default Warehouses;
