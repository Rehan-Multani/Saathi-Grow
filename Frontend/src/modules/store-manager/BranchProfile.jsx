import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Store, MapPin, Phone, Mail, Save, RefreshCcw } from 'lucide-react';
import { getMyBranch, updateMyBranch } from './api/branchApi';
import Swal from 'sweetalert2';

const BranchProfile = () => {
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const fetchBranch = async () => {
    try {
      setLoading(true);
      const data = await getMyBranch();
      setBranch(data);
      setFormData({
        phone: data.phone || '',
        email: data.email || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          zipCode: data.address?.zipCode || ''
        }
      });
    } catch (err) {
      setError('Failed to load branch details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranch();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMyBranch(formData);
      Swal.fire({
        title: 'Success!',
        text: 'Branch profile updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      fetchBranch();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex items-center justify-center min-h-[400px]">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Branch Profile</h4>
          <p className="text-muted small">Manage your store's public information and contact details.</p>
        </div>
        <Button variant="outline-primary" size="sm" onClick={fetchBranch}>
          <RefreshCcw size={16} className="me-2" /> Refresh
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-xl mb-4 overflow-hidden">
          <Card.Header className="bg-primary text-white py-3 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Store size={20} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{branch?.name}</h5>
                <span className="opacity-75 small">Branch Code: {branch?.code}</span>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4">
              <Col md={12}>
                <h6 className="fw-bold text-uppercase small text-primary mb-3">Contact Information</h6>
                <Row className="g-3">
                  <Col md={6} className="text-start">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Branch Phone No.</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-0"><Phone size={16} /></InputGroup.Text>
                        <Form.Control
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="bg-light border-0 shadow-none"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="text-start">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Support Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-0"><Mail size={16} /></InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="branch@saathigro.com"
                          className="bg-light border-0 shadow-none"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={12}>
                <hr className="my-2 opacity-50" />
                <h6 className="fw-bold text-uppercase small text-primary mb-3 mt-2">Location Details</h6>
                <Row className="g-3">
                  <Col md={12} className="text-start">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Street Address</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-0"><MapPin size={16} /></InputGroup.Text>
                        <Form.Control
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          placeholder="Enter street address"
                          className="bg-light border-0 shadow-none"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="text-start">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">City</Form.Label>
                      <Form.Control
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="bg-light border-0 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="text-start">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">State</Form.Label>
                      <Form.Control
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="bg-light border-0 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="text-start">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Zip Code</Form.Label>
                      <Form.Control
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        placeholder="Zip"
                        className="bg-light border-0 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer className="bg-light border-0 p-3 d-flex justify-content-end gap-2">
            <Button variant="light" type="button" onClick={() => fetchBranch()}>Reset</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : <><Save size={18} className="me-2" /> Save Profile</>}
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </div>
  );
};

export default BranchProfile;
