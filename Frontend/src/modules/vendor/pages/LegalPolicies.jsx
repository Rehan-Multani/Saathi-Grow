import React, { useState, useEffect } from 'react';
import { Card, Spinner, ListGroup, Breadcrumb } from 'react-bootstrap';
import { Shield, ChevronRight, FileText, Info, Badge } from 'lucide-react';
import { getPoliciesList, getPolicyContent } from '../../../common/utils/legalUtils';

const LegalPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const list = await getPoliciesList('Vendor');
      setPolicies(list);
      if (list.length > 0) {
        handleSelectPolicy(list[0].slug);
      }
      setLoading(false);
    };
    fetchList();
  }, []);

  const handleSelectPolicy = async (slug) => {
    setSelectedSlug(slug);
    setContentLoading(true);
    const data = await getPolicyContent(slug, 'Vendor');
    setContent(data);
    setContentLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted small uppercase tracking-widest font-bold">Loading Policies...</p>
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4">
      <Breadcrumb className="small mb-4">
        <Breadcrumb.Item href="/vendor/dashboard">Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item active>Legal & Policies</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
          <Shield size={24} />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Vendor Policies</h4>
          <p className="text-muted small mb-0">Legal agreements and guidelines for Saathi-Grow Vendors.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
            <ListGroup variant="flush">
              {policies.map(p => (
                <ListGroup.Item
                  key={p._id}
                  action
                  active={selectedSlug === p.slug}
                  onClick={() => handleSelectPolicy(p.slug)}
                  className="d-flex align-items-center justify-content-between py-3 border-light"
                >
                  <div className="d-flex align-items-center gap-3">
                    <FileText size={18} className={selectedSlug === p.slug ? 'text-white' : 'text-primary'} />
                    <span className="fw-bold small uppercase tracking-tighter">{p.title}</span>
                  </div>
                  <ChevronRight size={16} className={selectedSlug === p.slug ? 'text-white' : 'text-muted'} />
                </ListGroup.Item>
              ))}
              {policies.length === 0 && (
                <ListGroup.Item className="text-center py-4 text-muted small">
                  No policies available.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          <Card className="mt-4 border-0 bg-light shadow-none">
            <Card.Body className="d-flex gap-3 align-items-start">
              <Info size={20} className="text-primary mt-1" />
              <div>
                <h6 className="fw-bold mb-1 small uppercase font-black">Need Help?</h6>
                <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                  If you have questions regarding these policies, please contact vendor support.
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-8">
          <Card className="border-0 shadow-sm rounded-3" style={{ minHeight: '500px' }}>
            <Card.Body className="p-4 p-md-5">
              {contentLoading ? (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center py-5">
                  <Spinner animation="grow" variant="primary" size="sm" />
                  <span className="mt-3 text-muted small font-bold uppercase tracking-widestAlpha">Fetching Content...</span>
                </div>
              ) : content ? (
                <div className="policy-viewer">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <h2 className="fw-black text-dark mb-0">{content.title}</h2>
                    <Badge bg="light" className="text-muted border fw-normal">
                      Last Updated: {new Date(content.updatedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div
                    className="policy-content text-secondary leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
                  >
                    {content.content}
                  </div>
                </div>
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                  <FileText size={48} className="opacity-25 mb-3" />
                  <p className="fw-bold">Select a policy to view content</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <style>{`
                .policy-content { font-size: 0.95rem; }
                .policy-content h1, .policy-content h2, .policy-content h3 { 
                    color: #1a1a1a; 
                    font-weight: 800; 
                    margin-top: 1.5rem; 
                    margin-bottom: 1rem;
                }
                .policy-viewer h2 { font-size: 1.5rem; }
            `}</style>
    </div>
  );
};

export default LegalPolicies;
