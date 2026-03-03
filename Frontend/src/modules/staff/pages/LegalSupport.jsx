import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge, Button } from 'react-bootstrap';
import { Shield, FileText, ExternalLink } from 'lucide-react';
import { getPoliciesList, getPolicyContent } from '../../../common/utils/legalUtils';

const LegalSupport = ({ role = 'Staff' }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      const list = await getPoliciesList(role);
      setPolicies(list);
      setLoading(false);
    };
    fetchList();
  }, [role]);

  const handleView = async (slug) => {
    const data = await getPolicyContent(slug, role);
    setSelectedPolicy(data);
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3 text-muted small fw-bold">Loading System Policies...</div>
      </div>
    );
  }

  if (selectedPolicy) {
    return (
      <div className="p-2 p-md-4">
        <Button variant="outline-primary" size="sm" onClick={() => setSelectedPolicy(null)} className="mb-4">
          ← Back to List
        </Button>
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h2 className="fw-bold mb-0">{selectedPolicy.title}</h2>
              <Badge bg="light" className="text-muted border">
                Updated: {new Date(selectedPolicy.updatedAt).toLocaleDateString()}
              </Badge>
            </div>
            <div
              className="policy-content text-secondary"
              style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '15px' }}
            >
              {selectedPolicy.content}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 p-md-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-4 text-primary">
          <Shield size={24} />
        </div>
        <div>
          <h4 className="fw-bold mb-0">{role} Legal Center</h4>
          <p className="text-muted small mb-0">Important documents, terms, and guidelines for {role} members.</p>
        </div>
      </div>

      <div className="row g-4">
        {policies.length > 0 ? policies.map(p => (
          <div key={p._id} className="col-md-6 col-lg-4">
            <Card className="border-0 shadow-sm h-100 hover-shadow transition-all cursor-pointer" onClick={() => handleView(p.slug)}>
              <Card.Body className="p-4">
                <FileText size={32} className="text-primary opacity-25 mb-3" />
                <h5 className="fw-bold mb-2">{p.title}</h5>
                <p className="text-muted small mb-3">Learn about our {p.title.toLowerCase()} and how it applies to your role.</p>
                <div className="d-flex align-items-center gap-2 text-primary small fw-bold mt-auto">
                  View Document <ExternalLink size={14} />
                </div>
              </Card.Body>
            </Card>
          </div>
        )) : (
          <div className="col-12 text-center py-5">
            <div className="bg-light p-4 rounded-4 d-inline-block text-muted">
              No policies currently assigned to your role.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalSupport;
