import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STOCK_DATA = [
    { name: 'Electronics', stock: 450, capacity: 1000 },
    { name: 'Groceries', stock: 850, capacity: 1500 },
    { name: 'Clothing', stock: 320, capacity: 500 },
    { name: 'Home', stock: 200, capacity: 800 },
];

const StockOverview = () => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="p-2 p-md-4">
            <h4 className="fw-bold mb-4">Stock Overview</h4>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-0 opacity-75">Total Items</p>
                                    <h3 className="fw-bold">1,820</h3>
                                </div>
                                <Package size={24} className="opacity-75" />
                            </div>
                            <div className="small opacity-75 mt-3">
                                <TrendingUp size={14} className="me-1" /> +5% from last month
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted mb-0">Low Stock Items</p>
                                    <h3 className="fw-bold text-danger">12</h3>
                                </div>
                                <AlertTriangle size={24} className="text-danger" />
                            </div>
                            <div className="small text-muted mt-3">
                                Needs attention
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                {/* More cards can be added */}
            </Row>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Stock by Category</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={STOCK_DATA}
                                    layout={isMobile ? "horizontal" : "vertical"}
                                    margin={isMobile ? { top: 20, right: 20, left: 0, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={isMobile} vertical={!isMobile} />
                                    <XAxis
                                        type={isMobile ? "category" : "number"}
                                        dataKey={isMobile ? "name" : undefined}
                                        hide={!isMobile}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        type={isMobile ? "number" : "category"}
                                        dataKey={isMobile ? undefined : "name"}
                                        width={isMobile ? 40 : 80}
                                        tick={{ fontSize: 10 }}
                                        hide={false}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="stock" fill="#3b82f6" radius={isMobile ? [4, 4, 0, 0] : [0, 4, 4, 0]} barSize={isMobile ? 40 : 20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Warehouse Capacity</h5>
                            {STOCK_DATA.map((item, idx) => (
                                <div key={idx} className="mb-4">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="fw-medium text-dark">{item.name}</span>
                                        <span className="text-muted small">{item.stock} / {item.capacity}</span>
                                    </div>
                                    <ProgressBar
                                        now={(item.stock / item.capacity) * 100}
                                        variant={
                                            (item.stock / item.capacity) > 0.8 ? 'warning' : 'success'
                                        }
                                        style={{ height: '6px' }}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StockOverview;
