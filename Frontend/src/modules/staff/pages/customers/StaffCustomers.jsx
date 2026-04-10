import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as customerApi from '../../../../common/api/customerManagementApi';
import { toast } from 'react-toastify';

// Reuse modals from admin
import CustomerDetailsModal from '../../../../common/components/customers/CustomerDetailsModal';
import SendMessageModal from '../../../../common/components/customers/SendMessageModal';

const StaffCustomers = () => {
  const { staffUser } = useStaffAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messageType, setMessageType] = useState('Message');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = staffUser?.token;
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
  }, [staffUser?.token]);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCustomers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      await customerApi.updateCustomer(staffUser.token, customer._id, formData);
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
            <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 py-1">Branch-ID: {staffUser?.branchId}</Badge>
          </div>
          <div className="d-flex gap-2 flex-grow-1 justify-content-md-end w-100 w-md-auto">
            <InputGroup style={{ maxWidth: '400px' }} className="shadow-none">
              <InputGroup.Text className="bg-light border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
              <Form.Control
                placeholder="Search customers..."
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
                  <th className="border-0 py-3 text-center">Status</th>
                  <th className="border-0 py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {paginatedCustomers.length > 0 ? paginatedCustomers.map((c, idx) => (
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
                        <MapPin size={14} className="text-slate-300" /> {c.addresses?.[0]?.city || 'N/A'}
                      </div>
                    </td>
                    <td className="text-center">
                      <Badge bg={c.isActive ? 'success' : 'danger'} className="rounded-pill px-3 py-1 fw-normal" style={{ fontSize: '11px' }}>
                        {c.isActive ? 'Active' : 'Blocked'}
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
                            <Send size={16} className="text-primary" /> Send Message
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => handleStatusToggle(c)} className={c.isActive ? 'text-danger' : 'text-success'}>
                            {c.isActive ? (
                              <div className="d-flex align-items-center gap-2"><Ban size={16} /> Block User</div>
                            ) : (
                              <div className="d-flex align-items-center gap-2"><CheckCircle size={16} /> Unblock User</div>
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
        {filtered.length > 0 && (
          <Card.Footer className="bg-white border-top-0 py-3 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small font-bold uppercase tracking-wider">
                Showing <span className="text-primary">{Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}</span> to <span className="text-primary">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="text-primary">{filtered.length}</span> customers
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="light" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="border-0 bg-light rounded-2 px-3 hover:bg-primary hover:text-white transition-all shadow-none"
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "light"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`border-0 rounded-2 px-3 font-black transition-all shadow-none ${currentPage === page ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button 
                  variant="light" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="border-0 bg-light rounded-2 px-3 hover:bg-primary hover:text-white transition-all shadow-none"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      <CustomerDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        customer={selectedCustomer}
        onSendMessage={(cust, type) => {
          setShowDetailsModal(false);
          handleSendMessage(cust, type);
        }}
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

export default StaffCustomers;
