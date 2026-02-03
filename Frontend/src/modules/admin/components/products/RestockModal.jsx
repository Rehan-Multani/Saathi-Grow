import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { Package, Plus, Minus, RefreshCw } from 'lucide-react';

const RestockModal = ({ show, onHide, product, onRestock }) => {
    const [restockAmount, setRestockAmount] = useState(0);
    const [currentStock, setCurrentStock] = useState(0);

    useEffect(() => {
        if (product) {
            setCurrentStock(product.stock || 0);
            setRestockAmount(0);
        }
    }, [product]);

    const handleIncrement = () => setRestockAmount(prev => prev + 1);
    const handleDecrement = () => setRestockAmount(prev => Math.max(0, prev - 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (product && product.id) {
            onRestock(product.id, restockAmount);
        }
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Package className="text-blue-600" size={24} /> Restock Product
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                {product && (
                    <div className="mb-4">
                        <div className="p-3 bg-light rounded-xl border border-gray-100">
                            <div className="text-xs text-uppercase font-bold text-gray-400 mb-1">Product Details</div>
                            <div className="fw-bold text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-500 font-monospace">{product.sku}</div>
                            <hr className="my-2 border-gray-200" />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-sm text-gray-600">Current Stock:</span>
                                <span className={`fw-bold ${currentStock === 0 ? 'text-red-500' : 'text-blue-600'}`}>{currentStock} Units</span>
                            </div>
                        </div>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4 text-center">
                        <Form.Label className="fw-bold text-gray-700 mb-3">Amount to Increase</Form.Label>
                        <div className="d-flex justify-content-center align-items-center gap-3">
                            <Button
                                variant="outline-danger"
                                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                                onClick={handleDecrement}
                            >
                                <Minus size={20} />
                            </Button>

                            <Form.Control
                                type="number"
                                className="text-center fw-bold fs-3 border-0 bg-transparent"
                                style={{ width: '100px', outline: 'none', boxShadow: 'none' }}
                                value={restockAmount}
                                onChange={(e) => setRestockAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            />

                            <Button
                                variant="outline-success"
                                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                                onClick={handleIncrement}
                            >
                                <Plus size={20} />
                            </Button>
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                            New Total: <span className="fw-bold text-dark">{currentStock + restockAmount}</span> Units
                        </div>
                    </Form.Group>

                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="flex-fill py-2 text-secondary fw-medium">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="flex-fill py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
                            disabled={restockAmount <= 0}
                        >
                            <RefreshCw size={18} /> Update Inventory
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RestockModal;
