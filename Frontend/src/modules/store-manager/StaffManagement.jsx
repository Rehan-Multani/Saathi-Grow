import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Modal, InputGroup, Spinner } from 'react-bootstrap';
import { Search, UserPlus, Mail, Phone, Edit, Trash2, Key, Shield } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: []
  });

  const AVAILABLE_PERMISSIONS = [
    { id: 'VIEW_DASHBOARD', label: 'Dashboard Access' },
    { id: 'VIEW_PRODUCTS', label: 'View Products' },
    { id: 'MANAGE_PRODUCTS', label: 'Manage Products' },
    { id: 'MANAGE_INVENTORY', label: 'Adjust Inventory' },
    { id: 'VIEW_ORDERS', label: 'View Orders' },
    { id: 'MANAGE_ORDERS', label: 'Update Orders' }
  ];

  const getAuthToken = () => {
    const admin = JSON.parse(localStorage.getItem('sathiGro_admin'));
    const manager = JSON.parse(localStorage.getItem('sathiGro_manager'));
    return admin?.token || manager?.token;
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const { data } = await axios.get('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handlePermissionToggle = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      if (editingStaff) {
        await axios.put(`/api/admin/staff/${editingStaff._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Updated!', 'Staff member updated successfully', 'success');
      } else {
        await axios.post('/api/admin/staff', { ...formData, role: 'Staff' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Created!', 'New staff member added', 'success');
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This staff member will be permanently removed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, remove them'
    });

    if (result.isConfirmed) {
      try {
        const token = getAuthToken();
        await axios.delete(`/api/admin/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Staff member removed', 'success');
        fetchStaff();
      } catch (error) {
        Swal.fire('Error', 'Failed to remove staff', 'error');
      }
    }
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      password: '',
      permissions: member.permissions || []
    });
    setShowModal(true);
  };

  const filteredStaff = (Array.isArray(staff) ? staff : []).filter(s =>
    (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Staff Management</h4>
        <Button variant="primary" onClick={() => { setEditingStaff(null); setFormData({ name: '', email: '', phone: '', password: '', permissions: [] }); setShowModal(true); }}>
          <UserPlus size={18} className="me-2" /> Add Staff
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <Card.Header className="bg-white py-3">
          <InputGroup className="max-w-md">
            <InputGroup.Text className="bg-light border-0"><Search size={18} /></InputGroup.Text>
            <Form.Control
              placeholder="Search staff by name or email..."
              className="bg-light border-0 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light text-muted small uppercase">
                <tr>
                  <th className="ps-4">Staff Member</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                ) : filteredStaff.map(member => (
                  <tr key={member._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary rounded-circle p-2 font-bold w-10 h-10 d-flex align-items-center justify-content-center">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold">{member.name}</div>
                          <div className="text-muted small">Role: Staff</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm"><Mail size={14} className="me-1" /> {member.email}</div>
                      <div className="text-muted small"><Phone size={14} className="me-1" /> {member.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <Badge bg="success" className="rounded-pill">Active</Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {member.permissions?.slice(0, 2).map(p => (
                          <Badge key={p} bg="secondary" className="fw-normal">{p}</Badge>
                        ))}
                        {member.permissions?.length > 2 && <Badge bg="secondary">+{member.permissions.length - 2}</Badge>}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="light" size="sm" onClick={() => openEditModal(member)}><Edit size={16} /></Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(member._id)}><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="py-4">
            <div className="row g-3">
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold">Full Name</Form.Label>
                  <Form.Control required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" />
                </Form.Group>
              </div>
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold">Email Address</Form.Label>
                  <Form.Control required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                </Form.Group>
              </div>
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold">Phone Number</Form.Label>
                  <Form.Control value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 0000000000" />
                </Form.Group>
              </div>
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold">Password {editingStaff && '(Leave blank to keep current)'}</Form.Label>
                  <Form.Control type="password" required={!editingStaff} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                </Form.Group>
              </div>
              <div className="col-12 text-start">
                <hr />
                <Form.Label className="small fw-bold mb-3 d-flex align-items-center gap-2">
                  <Shield size={16} className="text-primary" /> Assign Permissions
                </Form.Label>
                <div className="row g-2">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <div key={perm.id} className="col-md-4">
                      <div
                        className={`p-2 border rounded-lg cursor-pointer transition-all text-sm ${formData.permissions.includes(perm.id) ? 'bg-primary-subtle border-primary' : 'bg-light'}`}
                        onClick={() => handlePermissionToggle(perm.id)}
                      >
                        <div className="form-check m-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => { }} // Controlled via parent click
                          />
                          <label className="form-check-label cursor-pointer">{perm.label}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingStaff ? 'Update Staff' : 'Save Member'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
