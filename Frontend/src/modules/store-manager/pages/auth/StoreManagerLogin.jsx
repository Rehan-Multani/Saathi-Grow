import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreManagerAuth } from '../../context/StoreManagerAuthContext';
import { Card, Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Store, Eye, EyeOff } from 'lucide-react';

const StoreManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { managerLogin } = useStoreManagerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await managerLogin(email, password);
      navigate('/store-manager/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light d-flex align-items-center justify-content-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <div className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <Store size={32} />
              </div>
              <h3 className="fw-bold text-dark">Branch Manager Portal</h3>
              <p className="text-muted">Sign in to manage your branch</p>
            </div>
            <Card className="border-0 shadow-sm rounded-lg">
              <Card.Body className="p-4">
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small text-uppercase">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="manager@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      size="lg"
                      className="bg-light border-0 text-dark"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold small text-uppercase">Password</Form.Label>
                    <InputGroup size="lg">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-light border-0 text-dark"
                      />
                      <Button 
                        variant="light" 
                        className="bg-light border-0 text-dark"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <Button variant="success" type="submit" size="lg" className="w-100 fw-bold shadow-sm" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </Form>
                <div className="mt-4 text-center">
                  <small className="text-muted">
                    Forgot password? Contact Corporate IT.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StoreManagerLogin;
