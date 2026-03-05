import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Spinner } from 'react-bootstrap';
import { Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const StockOverview = () => {
    const { adminUser } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(adminUser.token, { limit: 200 }),
                    getCategories(adminUser.token)
                ]);
                setProducts(productsData.products || []);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) fetchData();
    }, [adminUser]);

    // Calculate metrics
    const totalStock = products.reduce((acc, p) => acc + (p.branchStocks?.reduce((sum, bs) => sum + bs.stock, 0) || 0), 0);
    const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    // Group stock by category
    const stockByCategory = categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat.name);
        const totalCatStock = catProducts.reduce((acc, p) => acc + (p.branchStocks?.reduce((sum, bs) => sum + bs.stock, 0) || 0), 0);
        return {
            name: cat.name,
            stock: totalCatStock,
            capacity: 1000 // Placeholder for capacity
        };
    }).filter(cat => cat.stock > 0);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading stock overview...</p>
            </div>
        );
    }

    return (
        <div className="p-2 p-md-4">
            <h4 className="fw-bold mb-4">Stock Overview</h4>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-0 opacity-75">Total Stock Items</p>
                                    <h3 className="fw-bold">{totalStock.toLocaleString()}</h3>
                                </div>
                                <Package size={24} className="opacity-75" />
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
                                    <h3 className="fw-bold text-danger">{lowStockCount}</h3>
                                </div>
                                <AlertTriangle size={24} className="text-danger" />
                            </div>
                            <div className="small text-muted mt-3">
                                Needs attention
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Stock by Category</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={stockByCategory}
                                    layout={isMobile ? "horizontal" : "vertical"}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                                        width={isMobile ? 40 : 120}
                                        tick={{ fontSize: 10 }}
                                        hide={false}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="stock" fill="#3b82f6" radius={isMobile ? [4, 4, 0, 0] : [0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StockOverview;

