import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Phone, Star, Truck, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeliveryPartnerEditModal from '../admin/components/delivery/DeliveryPartnerEditModal';
import Swal from 'sweetalert2';
import * as api from '../admin/api/adminDeliveryApi';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';

const ManagerDeliveryPartners = () => {
  const { managerUser } = useStoreManagerAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await api.getDeliveryPartners();
      setPartners(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load delivery partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (partner) => {
    setSelectedPartner(partner);
    setShowEditModal(true);
  };

  const handleSave = async (updatedPartner) => {
    try {
      const apiRes = await api.updateDeliveryPartnerStatus(updatedPartner._id, updatedPartner.authStatus);
      setPartners(partners.map(p => p._id === apiRes._id ? apiRes : p));
      Swal.fire({
        title: 'Updated!',
        text: 'Partner status updated successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setShowEditModal(false);
    } catch (e) {
      Swal.fire('Error', 'Failed to save changes', 'error');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Fleet Management</h4>
          <p className="text-muted small">Managing delivery partners for <strong>{managerUser?.branchId?.name}</strong></p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={fetchPartners} disabled={loading}>
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden mb-4">
        <Card.Header className="bg-white py-3 border-0">
          <InputGroup className="max-w-md shadow-none">
            <InputGroup.Text className="bg-light border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Search partners by name, ID or phone..."
              className="bg-light border-0 shadow-none ps-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase fw-bold">
                <tr>
                  <th className="ps-4 border-0 py-3">Partner Info</th>
                  <th className="border-0 py-3">Vehicle</th>
                  <th className="border-0 py-3">Duty Status</th>
                  <th className="border-0 py-3">Rating</th>
                  <th className="border-0 py-3">Auth Status</th>
                  <th className="border-0 py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
                ) : filtered.length > 0 ? filtered.map((p) => (
                  <tr key={p._id} className="border-bottom">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary p-2 rounded-lg">
                          <Truck size={20} />
                        </div>
                        <div>
                          <div className="fw-bold text-slate-700">{p.name}</div>
                          <div className="text-slate-400 small flex align-items-center gap-1">
                            <Phone size={10} /> {p.phone} ₹ {p.uniqueId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border fw-normal px-2 py-1">
                        {p.vehicleType} {p.vehicleNumber && `(${p.vehicleNumber})`}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.dutyStatus === 'Online' ? 'bg-success' : 'bg-secondary'}`}></div>
                        <span className="small fw-medium">{p.dutyStatus}</span>
                        {p.assignmentStatus === 'Busy' && <Badge bg="warning-subtle" className="text-warning small fw-normal ms-1">On Delivery</Badge>}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-warning fw-bold small">
                        <Star size={14} fill="currentColor" /> {p.rating || '5.0'}
                      </div>
                    </td>
                    <td>
                      <Badge bg={p.authStatus === 'Active' ? 'success' : 'danger'} className="rounded-pill px-2 py-1 fw-normal">
                        {p.authStatus}
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <Button variant="light" size="sm" className="border-0 shadow-none text-primary" onClick={() => handleEdit(p)}>
                        <Edit size={16} />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-4 text-muted small">No delivery partners active in your terminal.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <DeliveryPartnerEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        partner={selectedPartner}
        onSave={handleSave}
      />
    </div>
  );
};

export default ManagerDeliveryPartners;
