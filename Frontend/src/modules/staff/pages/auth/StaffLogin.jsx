import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { UserCheck } from 'lucide-react';

const StaffLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { staffLogin } = useStaffAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await staffLogin(email, password);
            navigate('/staff/dashboard');
        } catch (err) {
            setError(err.message);
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
                            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <UserCheck size={32} />
                            </div>
                            <h3 className="fw-bold text-dark">Staff Portal</h3>
                            <p className="text-muted">Sign in to access your dashboard</p>
                        </div>
                        <Card className="border-0 shadow-sm rounded-lg">
                            <Card.Body className="p-4">
                                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold small text-uppercase">Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            size="lg"
                                            className="bg-light border-0"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-uppercase">Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            size="lg"
                                            className="bg-light border-0"
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" size="lg" className="w-100 fw-bold shadow-sm" disabled={loading}>
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </Form>
                                <div className="mt-4 text-center">
                                    <small className="text-muted">
                                        Forgot password? Contact your System Administrator.
                                    </small>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-white border-top-0 py-3 text-center">
                                <small className="text-muted">Demo: staff@sathigro.com / staff123</small>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default StaffLogin;
