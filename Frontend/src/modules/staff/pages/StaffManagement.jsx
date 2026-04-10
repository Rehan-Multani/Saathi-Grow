import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Modal, InputGroup, Spinner, ListGroup } from 'react-bootstrap';
import { Search, UserPlus, Mail, Phone, Edit, Trash2, Key, Shield, Eye, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useStaffAuth } from '../context/StaffAuthContext';
import { API_BASE_URL } from '../../../config/apiConfig';

const StaffManagement = () => {
  const { staffUser } = useStaffAuth();
  const currentUser = staffUser;

  // Permissions and View logic
  const isStaff = currentUser?.role === 'Staff';
  const hasPermission = isStaff;
  const canPerformActions = false; // Staff can't add/edit/delete other staff usually

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: []
  });

  const AVAILABLE_PERMISSIONS = [
    { id: 'VIEW_ORDERS', label: 'View Orders List' },
    { id: 'MANAGE_ORDERS', label: 'Manage/Change Order Status' },
    { id: 'MANAGE_REFUNDS_RETURNS', label: 'Approve Refunds & Returns' },
    { id: 'VIEW_PRODUCTS', label: 'View Products Catalog' },
    { id: 'MANAGE_INVENTORY', label: 'Update Stock/Inventory' },
    { id: 'VIEW_CUSTOMERS', label: 'View Customer Info' },
    { id: 'MANAGE_POS_BILLING', label: 'Handle POS Billing & Terminal' }
  ];

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = currentUser?.token;
      if (!token) return;

      const { data } = await axios.get(`${API_BASE_URL}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(data);
    } catch (error) {
      console.error('Fetch staff error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      fetchStaff();
    }
  }, [currentUser?.token]);

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

    // Password validation for new staff or password update
    if (!editingStaff && formData.password.length < 8) {
      Swal.fire('Error', 'Password must be at least 8 characters long.', 'error');
      return;
    }
    if (editingStaff && formData.password && formData.password.length < 8) {
      Swal.fire('Error', 'New password must be at least 8 characters long.', 'error');
      return;
    }

    try {
      const token = currentUser?.token;
      if (editingStaff) {
        await axios.put(`${API_BASE_URL}/admin/staff/${editingStaff._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Updated!', 'Staff member updated successfully', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/admin/staff`, { ...formData, role: 'Staff' }, {
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
        const token = currentUser?.token;
        await axios.delete(`${API_BASE_URL}/admin/staff/${id}`, {
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

  const openDetailsModal = (member) => {
    setSelectedStaff(member);
    setShowDetails(true);
  };

  // Filter list based on search term (Backend already handles branch scoping)
  const filteredStaff = (Array.isArray(staff) ? staff : [])
    .filter(s =>
      (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!hasPermission) {
    return (
      <div className="p-5 text-center">
        <Shield size={48} className="text-danger mb-3" />
        <h3>Access Denied</h3>
        <p className="text-muted">You do not have the required permissions to manage staff.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0 text-slate-800 text-start">Staff Management</h4>
          <div className="text-muted small text-start">
            {isStaff ? 'Viewing team members for your branch' : 'Manage team members for your branch'}
          </div>
        </div>
        {canPerformActions && (
          <Button variant="primary" onClick={() => { setEditingStaff(null); setFormData({ name: '', email: '', phone: '', password: '', permissions: [] }); setShowModal(true); }} className="rounded-pill px-4">
            <UserPlus size={18} className="me-2" /> Add Staff
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <Card.Header className="bg-white py-4 px-4 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <InputGroup className="max-w-md shadow-none bg-light rounded-pill px-2">
              <InputGroup.Text className="bg-transparent border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
              <Form.Control
                placeholder="Search by name or email..."
                className="bg-transparent border-0 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 py-2 border border-primary-subtle">
              Branch: {currentUser?.branchId?.name || currentUser?.branchId || 'Global'}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 border-0">
              <thead className="bg-slate-50 text-slate-500 small uppercase fw-bold">
                <tr>
                  <th className="ps-4 border-0 py-3">Staff Profile</th>
                  <th className="border-0 py-3">Contact Information</th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 py-3">Permissions</th>
                  <th className="text-end pe-4 border-0 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
                ) : filteredStaff.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No staff members found for this branch.</td></tr>
                ) : filteredStaff.map(member => (
                  <tr key={member._id} className="border-bottom">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary rounded-circle p-2 font-bold w-10 h-10 d-flex align-items-center justify-content-center shadow-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-slate-700">{member.name}</div>
                          <div className="text-muted small">Role: {member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="text-slate-600 small d-flex align-items-center gap-1"><Mail size={12} /> {member.email}</div>
                        <div className="text-slate-500 small d-flex align-items-center gap-1"><Phone size={12} /> {member.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={member.isActive !== false ? 'success' : 'danger'} className="rounded-pill px-3 py-1 fw-normal">
                        {member.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {member.permissions?.slice(0, 3).map(p => (
                          <Badge key={p} bg="light" className="border border-slate-200 fw-normal py-1 shadow-xs" style={{ color: '#334155' }}>{p}</Badge>
                        ))}
                        {member.permissions?.length > 3 && <Badge bg="primary-subtle" className="text-primary border border-primary-subtle py-1 shadow-xs">+{member.permissions.length - 3}</Badge>}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="light" size="sm" onClick={() => openDetailsModal(member)} className="border hover:bg-primary-subtle hover:text-primary transition-all"><Eye size={16} /></Button>
                        {canPerformActions && (
                          <>
                            <Button variant="light" size="sm" onClick={() => openEditModal(member)} className="border"><Edit size={16} className="text-primary" /></Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(member._id)} className="border-danger-subtle"><Trash2 size={16} /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Staff Member Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedStaff && (
            <div className="text-center">
              <div className="bg-primary-subtle text-primary rounded-circle p-4 font-bold w-20 h-20 d-flex align-items-center justify-content-center shadow-sm mx-auto mb-3 text-2xl">
                {selectedStaff.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="fw-bold text-slate-800 mb-1">{selectedStaff.name}</h4>
              <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 mb-4">{selectedStaff.role}</Badge>

              <ListGroup variant="flush" className="text-start border rounded-xl overflow-hidden">
                <ListGroup.Item className="py-3 d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-lg text-primary"><Mail size={18} /></div>
                  <div>
                    <div className="small text-muted fw-bold">Email Address</div>
                    <div className="text-slate-700">{selectedStaff.email}</div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="py-3 d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-lg text-success"><Phone size={18} /></div>
                  <div>
                    <div className="small text-muted fw-bold">Phone Number</div>
                    <div className="text-slate-700">{selectedStaff.phone || 'Not Provided'}</div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="py-3 d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-lg text-info"><MapPin size={18} /></div>
                  <div>
                    <div className="small text-muted fw-bold">Assigned Branch</div>
                    <div className="text-slate-700">{selectedStaff.branchId?.name || selectedStaff.branchId || 'N/A'}</div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="py-3 d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-lg text-warning"><Shield size={18} /></div>
                  <div className="w-100">
                    <div className="small text-muted fw-bold mb-2">Access Privileges</div>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedStaff.permissions?.map(p => (
                        <Badge key={p} bg="light" className="border fw-normal" style={{ color: '#334155' }}>{p}</Badge>
                      )) || <span className="text-muted small italic">No specific permissions assigned</span>}
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="py-3 d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-lg text-purple"><Calendar size={18} /></div>
                  <div>
                    <div className="small text-muted fw-bold">Member Since</div>
                    <div className="text-slate-700">{new Date(selectedStaff.createdAt).toLocaleDateString()}</div>
                  </div>
                </ListGroup.Item>
              </ListGroup>

              <div className="mt-4 d-flex justify-content-center gap-2">
                <div className="d-flex align-items-center gap-1 text-success small fw-bold">
                  <CheckCircle size={14} /> Account Status: Active
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="primary" className="w-100 rounded-pill" onClick={() => setShowDetails(false)}>Close View</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit/Create Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="staff-modal">
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold h5 d-flex align-items-center gap-2">
            <div className="bg-primary-subtle p-2 rounded-lg"><UserPlus className="text-primary" size={20} /></div>
            {editingStaff ? 'Update Staff Member' : 'Register New Staff'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="py-4 px-4">
            <div className="row g-4">
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted uppercase">Full Name</Form.Label>
                  <Form.Control required className="bg-light border-0 py-2 shadow-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" />
                </Form.Group>
              </div>
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted uppercase">Email Address</Form.Label>
                  <Form.Control required type="email" className="bg-light border-0 py-2 shadow-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                </Form.Group>
              </div>
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted uppercase">Phone Number</Form.Label>
                  <Form.Control className="bg-light border-0 py-2 shadow-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 0000000000" />
                </Form.Group>
              </div>
              <div className="col-md-6 text-start">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted uppercase">Password {editingStaff && '(Optional)'}</Form.Label>
                  <InputGroup className="bg-light border-0 py-0 rounded overflow-hidden">
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      required={!editingStaff} 
                      className="bg-transparent border-0 shadow-none py-2" 
                      value={formData.password} 
                      onChange={e => setFormData({ ...formData, password: e.target.value })} 
                      placeholder="••••••••" 
                    />
                    <Button 
                      variant="transparent" 
                      className="border-0 text-muted hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </div>
              <div className="col-12 text-start">
                <hr className="my-2" />
                <Form.Label className="small fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                  <Shield size={16} /> Assign Role Permissions
                </Form.Label>
                <div className="row g-2">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <div key={perm.id} className="col-md-4">
                      <div
                        className={`p-3 border rounded-xl cursor-pointer transition-all text-sm d-flex align-items-center gap-2 ${formData.permissions.includes(perm.id) ? 'bg-primary-subtle border-primary' : 'bg-white hover:bg-light'}`}
                        onClick={() => handlePermissionToggle(perm.id)}
                      >
                        <Form.Check
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => { }} // Controlled via parent click
                          className="m-0 pointer-events-none"
                        />
                        <span className="fw-medium text-slate-700">{perm.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-top-0 px-4 pb-4 pt-0">
            <Button variant="light" onClick={() => setShowModal(false)} className="px-4 py-2 border shadow-none text-secondary fw-medium">Cancel</Button>
            <Button variant="primary" type="submit" className="px-4 py-2 fw-medium shadow-sm">{editingStaff ? 'Save Changes' : 'Create Staff Member'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
