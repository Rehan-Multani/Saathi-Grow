import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Upload, Download, Send } from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import * as customerApi from '../admin/api/customerManagementApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// We reuse modals from admin but they might need prop adaptation if they use context
import CustomerDetailsModal from '../admin/components/customers/CustomerDetailsModal';
import SendMessageModal from '../admin/components/customers/SendMessageModal';

const ManagerCustomers = () => {
  const { managerUser } = useStoreManagerAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messageType, setMessageType] = useState('Message');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = managerUser?.token;
      if (!token) return;
      const data = await customerApi.getAllCustomers(token);
      setCustomers(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch customer list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [managerUser?.token]);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleSendMessage = (customer, type) => {
    setSelectedCustomer(customer);
    setMessageType(type);
    setShowMessageModal(true);
  };

  const handleStatusToggle = async (customer) => {
    try {
      const formData = new FormData();
      formData.append('isActive', !customer.isActive);
      await customerApi.updateCustomer(managerUser.token, customer._id, formData);
      setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(`User ${customer.isActive ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-h-[400px]">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="border-0 shadow-sm mb-4 rounded-xl overflow-hidden">
        <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 bg-white p-4">
          <div className="d-flex align-items-center gap-3">
            <h4 className="mb-0 fw-bold text-slate-800">Branch Customers</h4>
            <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 py-1">Branch-ID: {managerUser?.branchId}</Badge>
          </div>
          <div className="d-flex gap-2 flex-grow-1 justify-content-md-end w-100 w-md-auto">
            <InputGroup style={{ maxWidth: '400px' }} className="shadow-none">
              <InputGroup.Text className="bg-light border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
              <Form.Control
                placeholder="Search by name, email or mobile..."
                className="bg-light border-0 shadow-none ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-slate-50 text-slate-500 small text-uppercase fw-bold">
                <tr>
                  <th className="ps-4 border-0 py-3">Customer Profile</th>
                  <th className="border-0 py-3">Contact Information</th>
                  <th className="border-0 py-3">Location</th>
                  <th className="border-0 py-3 text-center">Wallet</th>
                  <th className="border-0 py-3 text-center">Status</th>
                  <th className="border-0 py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filtered.length > 0 ? filtered.map((c, idx) => (
                  <tr key={idx} className="border-bottom">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        {c.profileImage ? (
                          <img src={c.profileImage} alt={c.name} className="rounded-circle" style={{ width: 42, height: 42, objectFit: 'cover' }} />
                        ) : (
                          <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-lg" style={{ width: 42, height: 42 }}>
                            {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="fw-bold text-slate-700">{c.name || 'Anonymous User'}</div>
                          <div className="text-slate-400 small" style={{ fontSize: '10px' }}>ID: {c._id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2 text-slate-600 small font-medium">
                          <Mail size={14} className="text-slate-400" /> {c.email || 'No email'}
                        </div>
                        <div className="d-flex align-items-center gap-2 text-slate-600 small font-medium">
                          <Phone size={14} className="text-slate-400" /> +91 {c.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-slate-500 small">
                        <MapPin size={14} className="text-slate-300" /> {c.addresses?.[0]?.city || 'Location N/A'}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="fw-bold text-slate-700">₹{c.walletBalance || 0}</div>
                    </td>
                    <td className="text-center">
                      <Badge bg={c.isActive ? 'success' : 'danger'} className="rounded-pill px-3 py-1 fw-normal" style={{ fontSize: '11px' }}>
                        {c.isActive ? 'Active' : 'Restricted'}
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" className="btn-sm border-0 shadow-none no-caret p-1">
                          <MoreHorizontal size={18} className="text-slate-400" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="border-0 shadow-lg rounded-xl">
                          <Dropdown.Item className="d-flex align-items-center gap-2 py-2" onClick={() => handleViewProfile(c)}>
                            <Eye size={16} className="text-primary" /> View Profile
                          </Dropdown.Item>
                          <Dropdown.Item className="d-flex align-items-center gap-2 py-2" onClick={() => handleSendMessage(c, 'Email')}>
                            <Mail size={16} className="text-info" /> Send Email
                          </Dropdown.Item>
                          <Dropdown.Item className="d-flex align-items-center gap-2 py-2" onClick={() => handleSendMessage(c, 'Message')}>
                            <Send size={16} className="text-primary" /> SMS Alert
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => handleStatusToggle(c)} className={c.isActive ? 'text-danger' : 'text-success'}>
                            {c.isActive ? (
                              <div className="d-flex align-items-center gap-2"><Ban size={16} /> Block Member</div>
                            ) : (
                              <div className="d-flex align-items-center gap-2"><CheckCircle size={16} /> Unblock Member</div>
                            )}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-5 text-slate-400">No customers found for your branch yet.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <CustomerDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        customer={selectedCustomer}
      />

      <SendMessageModal
        show={showMessageModal}
        onHide={() => setShowMessageModal(false)}
        customer={selectedCustomer}
        type={messageType}
      />
    </div>
  );
};

export default ManagerCustomers;
