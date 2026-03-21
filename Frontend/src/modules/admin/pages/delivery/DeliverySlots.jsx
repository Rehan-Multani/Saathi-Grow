import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Spinner, Modal } from 'react-bootstrap';
import { Plus, Edit, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import * as api from '../../api/deliverySlotApi';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const DeliverySlots = () => {
    const { t } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    label: '',
    isActive: true
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminDeliverySlots();
      setSlots(data);
    } catch (error) {
      Swal.fire(t('common.error'), error.response?.data?.message || t('delivery.slots.alerts.load_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOpenModal = (slot = null) => {
    if (slot) {
      setSelectedSlot(slot);
      setFormData({
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label,
        isActive: slot.isActive
      });
    } else {
      setSelectedSlot(null);
      setFormData({
        startTime: '',
        endTime: '',
        label: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedSlot) {
        await api.updateDeliverySlot(selectedSlot._id, formData);
        Swal.fire({ icon: 'success', title: t('common.updated'), text: t('delivery.slots.alerts.update_success'), timer: 1500, showConfirmButton: false });
      } else {
        await api.createDeliverySlot(formData);
        Swal.fire({ icon: 'success', title: t('common.created'), text: t('delivery.slots.alerts.create_success'), timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchSlots();
    } catch (error) {
      Swal.fire(t('common.error'), error.response?.data?.message || t('delivery.slots.alerts.action_failed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: t('delivery.slots.alerts.delete_confirm_title'),
      text: t('delivery.slots.alerts.delete_confirm_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: t('delivery.slots.alerts.delete_btn')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.deleteDeliverySlot(id);
          fetchSlots();
          Swal.fire(t('common.deleted'), t('delivery.slots.alerts.delete_success'), 'success');
        } catch (error) {
          Swal.fire(t('common.error'), t('delivery.slots.alerts.delete_error'), 'error');
        }
      }
    });
  };

  return (
    <div className="p-3 p-md-4">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
              <Clock size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold">{t('delivery.slots.title')}</h5>
                  <PageInfoTooltip info={pageInfoData.deliverySlots} />
              </div>
              <p className="text-muted small mb-0">{t('delivery.slots.subtitle')}</p>
            </div>
          </div>
          <Button
            variant="primary"
            className="d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2 rounded-3"
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> <span>{t('delivery.slots.add_btn')}</span>
          </Button>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden mt-2">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle text-center">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 border-0 py-3 text-start">{t('delivery.slots.table.label')}</th>
                <th className="border-0 py-3">{t('delivery.slots.table.window')}</th>
                <th className="border-0 py-3">{t('delivery.slots.table.status')}</th>
                <th className="border-0 py-3 text-end pe-4">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-2 text-muted small">{t('delivery.slots.fetching')}</div>
                  </td>
                </tr>
              ) : slots.length > 0 ? slots.slice((page - 1) * limit, page * limit).map((slot) => (
                <tr key={slot._id}>
                  <td className="ps-4 text-start">
                    <div className="fw-bold text-dark">{slot.label}</div>
                    <div className="small text-muted">ID: {slot._id.substring(0, 8)}...</div>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border fw-normal px-3 py-1">
                      {slot.startTime} - {slot.endTime}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={slot.isActive ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3 py-1">
                      {slot.isActive ? t('delivery.slots.active') : t('delivery.slots.disabled')}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="light" size="sm" className="btn-icon-soft text-warning border shadow-none"
                        onClick={() => handleOpenModal(slot)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="light" size="sm" className="btn-icon-soft text-danger border shadow-none"
                        onClick={() => handleDelete(slot._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted small">
                    {t('delivery.slots.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>

        {/* Pagination Controls */}
        {!loading && slots.length > 0 && (
          <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
            <div className="text-secondary small">
              {t('delivery.slots.pagination.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('delivery.slots.pagination.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, slots.length)}</span> {t('delivery.slots.pagination.of')} <span className="fw-semibold text-dark">{slots.length}</span> {t('delivery.slots.pagination.items')}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="light"
                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </Button>

              <div className="d-flex align-items-center gap-1">
                {(() => {
                  const totalPages = Math.ceil(slots.length / limit);
                  return [...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                      return (
                        <Button
                          key={p}
                          variant={page === p ? 'primary' : 'light'}
                          className={`rounded shadow-sm ${page === p ? 'fw-bold' : 'text-secondary border'}`}
                          style={{ width: '36px', height: '36px', padding: 0 }}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    } else if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="text-muted px-1">...</span>;
                    }
                    return null;
                  });
                })()}
              </div>

              <Button
                variant="light"
                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === Math.ceil(slots.length / limit) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setPage(p => Math.min(Math.ceil(slots.length / limit), p + 1))}
                disabled={page === Math.ceil(slots.length / limit)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{selectedSlot ? t('delivery.slots.modal.edit_title') : t('delivery.slots.modal.add_title')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="py-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">{t('delivery.slots.modal.name_label')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('delivery.slots.modal.name_placeholder')}
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="shadow-none py-2"
              />
            </Form.Group>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <Form.Group>
                  <Form.Label className="small fw-bold">{t('delivery.slots.modal.start_time')}</Form.Label>
                  <Form.Control
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="shadow-none py-2"
                  />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label className="small fw-bold">{t('delivery.slots.modal.end_time')}</Form.Label>
                  <Form.Control
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="shadow-none py-2"
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Check
              type="switch"
              id="slot-active-switch"
              label={t('delivery.slots.modal.active_label')}
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mt-2"
            />
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowModal(false)} className="px-4 border" disabled={submitting}>
              {t('delivery.slots.modal.cancel')}
            </Button>
            <Button variant="primary" type="submit" className="px-4" disabled={submitting}>
              {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              {selectedSlot ? t('delivery.slots.modal.save') : t('delivery.slots.modal.create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DeliverySlots;
