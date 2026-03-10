import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner, Modal } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Shield, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAllLegalPages, createLegalPage, updateLegalPage, deleteLegalPage } from '../../api/legalApi';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';

const LegalManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    targetAudience: [],
    isActive: true
  });

  const audienceOptions = ['User', 'Vendor', 'Delivery Partner', 'Staff', 'Store Manager'];

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllLegalPages();
      setPages(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load legal pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleEdit = (page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      targetAudience: page.targetAudience,
      isActive: page.isActive
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      targetAudience: [],
      isActive: true
    });
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    const result = await showDeleteConfirmation('Delete Legal Page?', `Are you sure you want to remove "${title}"?`);
    if (result.isConfirmed) {
      try {
        await deleteLegalPage(id);
        setPages(pages.filter(p => p._id !== id));
        toast.success('Page deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete page');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.targetAudience.length === 0) {
      return toast.warning('Please select at least one target audience');
    }

    try {
      if (selectedPage) {
        const updated = await updateLegalPage(selectedPage._id, formData);
        setPages(pages.map(p => p._id === updated._id ? updated : p));
        toast.success('Page updated successfully');
      } else {
        const created = await createLegalPage(formData);
        setPages([created, ...pages]);
        toast.success('Page created successfully');
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save page');
    }
  };

  const toggleAudience = (role) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(role)
        ? prev.targetAudience.filter(r => r !== role)
        : [...prev.targetAudience, role]
    }));
  };

  const filtered = pages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || p.targetAudience.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-2 p-md-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
            <Shield size={24} />
          </div>
          <div>
            <h4 className="fw-bold mb-1 text-dark">Legal & Policies</h4>
            <p className="text-muted small mb-0">Manage legal documents across all platform modules.</p>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
          <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
            <Form.Control
              placeholder="Search policies..."
              className="border-start-0 ps-0 shadow-none py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={handleAdd} className="d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2 text-nowrap">
            <Plus size={18} /> <span className="small fw-bold">Add Policy</span>
          </Button>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mb-4 bg-white p-3 rounded-3 shadow-sm border border-gray-100">
        <div className="d-flex align-items-center me-3 text-muted small fw-bold text-uppercase">
          Filter by Role:
        </div>
        {['All', ...audienceOptions].map(role => (
          <Button
            key={role}
            size="sm"
            variant={selectedRole === role ? 'primary' : 'light'}
            onClick={() => setSelectedRole(role)}
            className={`rounded-pill px-4 py-2 border shadow-none transition-all fw-bold ${selectedRole === role ? 'shadow-sm' : 'text-secondary bg-light border-0'}`}
          >
            {role === 'All' ? 'View All' : role}
          </Button>
        ))}
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="grow" variant="primary" />
              <p className="mt-2 text-muted small">Loading policies...</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase fw-bold">
                <tr>
                  <th className="ps-4 py-3 border-0">Policy Title</th>
                  <th className="py-3 border-0">Roles</th>
                  <th className="py-3 border-0 text-center">Status</th>
                  <th className="py-3 border-0 text-center">Last Updated</th>
                  <th className="pe-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((page) => (
                  <tr key={page._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 bg-light rounded text-secondary">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="fw-black text-dark tracking-tight" style={{ fontSize: '14px' }}>{page.title}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '10px' }}>/{page.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {page.targetAudience.map(role => (
                          <Badge key={role} bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 fw-normal">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-center">
                      {page.isActive ? (
                        <Badge bg="success" className="bg-opacity-10 text-success border-0 px-2 py-1">
                          <CheckCircle size={12} className="me-1" /> Active
                        </Badge>
                      ) : (
                        <Badge bg="danger" className="bg-opacity-10 text-danger border-0 px-2 py-1">
                          <XCircle size={12} className="me-1" /> Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="text-center text-muted small">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="light" size="sm" onClick={() => handleEdit(page)} className="text-warning border-0">
                          <Edit size={16} />
                        </Button>
                        <Button variant="light" size="sm" onClick={() => handleDelete(page._id, page.title)} className="text-danger border-0">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted small">
                      No policies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{selectedPage ? 'Edit Policy' : 'Add New Policy'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold">Policy Title</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g. Terms of Service"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="py-2 shadow-none border-gray-200"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold">URL Slug (lowercase, no spaces)</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g. terms-of-service"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="py-2 shadow-none border-gray-200"
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold d-block">Target Audience (Select Roles)</Form.Label>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {audienceOptions.map(role => (
                    <Button
                      key={role}
                      type="button"
                      size="sm"
                      variant={formData.targetAudience.includes(role) ? 'primary' : 'light'}
                      onClick={() => toggleAudience(role)}
                      className="rounded-pill px-3 py-1 border shadow-none"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="small fw-bold">Policy Content (Markdown/HTML Supported)</Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={12}
                    placeholder="Paste your legal content here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="font-monospace py-2 shadow-none border-gray-200"
                    style={{ fontSize: '13px' }}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Check
                  type="switch"
                  id="policy-status"
                  label="Active (Visible on platform)"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="fw-bold small cursor-pointer"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowModal(false)} className="fw-bold px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="fw-bold px-4">
              {selectedPage ? 'Update Policy' : 'Create Policy'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default LegalManagement;
