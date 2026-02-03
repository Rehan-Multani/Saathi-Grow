import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { Plus, Image as ImageIcon, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import BannerEditModal from '../../components/offers/BannerEditModal';

const INITIAL_BANNERS = [
    { id: '1', title: 'Black Friday Sale', image: 'https://via.placeholder.com/600x200?text=Black+Friday', link: '/categories/electronics', status: 'Active' },
    { id: '2', title: 'New Arrivals', image: 'https://via.placeholder.com/600x200?text=New+Arrivals', link: '/categories/fashion', status: 'Active' },
    { id: '3', title: 'Grocery Bundle', image: 'https://via.placeholder.com/600x200?text=Grocery+Deal', link: '/products/bundle', status: 'Inactive' },
];

const Banners = () => {
    const [banners, setBanners] = useState(INITIAL_BANNERS);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);

    const handleDelete = (id, title) => {
        Swal.fire({
            title: 'Remove Banner?',
            text: `Are you sure you want to delete "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setBanners(banners.filter(b => b.id !== id));
                Swal.fire('Removed!', 'Banner has been deleted.', 'success');
            }
        });
    };

    const handleEdit = (banner) => {
        setSelectedBanner(banner);
        setShowEditModal(true);
    };

    const handleSave = (updatedBanner) => {
        setBanners(banners.map(b => b.id === updatedBanner.id ? updatedBanner : b));
        Swal.fire({
            title: 'Updated!',
            text: 'Banner has been updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    return (
        <div className="p-3 p-md-4">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-primary d-none d-md-flex">
                            <ImageIcon size={20} />
                        </div>
                        <h5 className="mb-0 fw-bold text-nowrap">Promotional Banners</h5>
                    </div>
                    <div className="d-flex justify-content-end flex-grow-1">
                        <Link to="/admin/banners/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm px-4 py-2">
                            <Plus size={18} /> <span className="fw-bold">Add Banner</span>
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Row className="g-4">
                {banners.length > 0 ? banners.map((b) => (
                    <Col md={6} lg={4} key={b.id}>
                        <Card className="border-0 shadow-sm h-100 overflow-hidden group">
                            <div className="position-relative overflow-hidden" style={{ height: '160px' }}>
                                <img src={b.image} className="w-100 h-100 object-fit-cover transition-transform duration-300 group-hover-scale-105" alt={b.title} />
                                <Badge bg={b.status === 'Active' ? 'success' : 'secondary'} className="position-absolute top-0 end-0 m-3 shadow-sm py-1 px-3 rounded-pill fw-normal">
                                    {b.status}
                                </Badge>
                            </div>
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-2 text-dark">{b.title}</h6>
                                <div className="text-muted small mb-4 d-flex align-items-center gap-2">
                                    <ExternalLink size={14} className="text-primary" />
                                    <span className="text-truncate">{b.link}</span>
                                </div>
                                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="btn-icon-soft text-primary border shadow-none px-3 d-flex align-items-center gap-2"
                                        onClick={() => handleEdit(b)}
                                    >
                                        <Edit size={14} /> <span className="small fw-bold">Edit</span>
                                    </Button>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="btn-icon-soft text-danger border shadow-none px-2"
                                        onClick={() => handleDelete(b.id, b.title)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )) : (
                    <Col xs={12}>
                        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                            <ImageIcon size={48} className="text-muted mb-3 opacity-20" />
                            <p className="text-muted mb-0">No banners found. Start by adding one!</p>
                        </div>
                    </Col>
                )}
            </Row>

            <BannerEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                banner={selectedBanner}
                onSave={handleSave}
            />
        </div>
    );
};

export default Banners;
