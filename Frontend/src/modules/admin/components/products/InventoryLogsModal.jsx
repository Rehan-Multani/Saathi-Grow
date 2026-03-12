import React, { useState, useEffect } from 'react';
import { Modal, Table, Spinner, Badge } from 'react-bootstrap';
import { History, ArrowUpRight, ArrowDownRight, Info, User } from 'lucide-react';
import { getInventoryLogs } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { format } from 'date-fns';

const InventoryLogsModal = ({ show, onHide, product }) => {
  const adminContext = useAdminAuth();
  const staffContext = useStaffAuth();
  const managerContext = useStoreManagerAuth();

  const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && product) {
      fetchLogs();
    }
  }, [show, product]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getInventoryLogs(adminUser.token, product._id);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'Addition': return 'success';
      case 'Sale': return 'primary';
      case 'Deduction': return 'danger';
      case 'Damage': return 'warning';
      case 'Return': return 'info';
      case 'Audit': return 'secondary';
      default: return 'light';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <History size={24} className="text-primary" />
          Inventory History: {product?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Fetching history...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-3 border-0 small text-uppercase text-muted">Date</th>
                  <th className="border-0 small text-uppercase text-muted">Branch</th>
                  <th className="border-0 small text-uppercase text-muted">Type</th>
                  <th className="border-0 small text-uppercase text-muted">Change</th>
                  <th className="border-0 small text-uppercase text-muted">Stock</th>
                  <th className="border-0 small text-uppercase text-muted">User</th>
                  <th className="border-0 small text-uppercase text-muted">Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-3">
                      <div className="small fw-medium">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</div>
                    </td>
                    <td>
                      <div className="small fw-bold text-primary">
                        {log.branchId?.name || log.vendorId?.storeName || 'Main'}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getBadgeVariant(log.type)} className="text-uppercase" style={{ fontSize: '10px' }}>
                        {log.type}
                      </Badge>
                    </td>
                    <td>
                      <div className={`d-flex align-items-center gap-1 fw-bold ${log.changeAmount >= 0 ? 'text-success' : 'text-danger'}`}>
                        {log.changeAmount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(log.changeAmount)}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <span className="text-muted">{log.previousStock}</span>
                        <span className="mx-1 text-muted">→</span>
                        <span className="fw-bold text-dark">{log.newStock}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small text-truncate" style={{ maxWidth: '100px' }}>
                        <User size={12} className="text-muted" />
                        {log.admin?.name || 'System'}
                      </div>
                    </td>
                    <td>
                      <div className="small text-muted text-wrap" style={{ maxWidth: '150px' }}>
                        {log.reason || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <Info className="mb-2" />
            <p>No inventory movements recorded yet.</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default InventoryLogsModal;
