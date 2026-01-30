import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { Container, Button, Dropdown } from 'react-bootstrap';
import { adminSidebarMenu } from './data/sidebarMenu';
import './styles/admin.css';

const AdminLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const location = useLocation();

    // Helper to find current page title
    const getCurrentTitle = () => {
        for (const item of adminSidebarMenu) {
            if (item.path === location.pathname) return item.title;
            if (item.submenu) {
                const subItem = item.submenu.find(sub => sub.path === location.pathname);
                if (subItem) return subItem.title;
            }
        }
        return 'Dashboard'; // Default fallback
    };

    return (
        <div className="admin-body">
            <AdminSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className="admin-main-wrapper">
                <header className="admin-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <Button
                            variant="link"
                            className="text-dark p-0 d-lg-none"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={24} />
                        </Button>
                        <h5 className="mb-0 fw-bold text-dark d-none d-sm-block">{getCurrentTitle()}</h5>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <div className="d-none d-md-block position-relative">
                            <input
                                type="text"
                                className="form-control bg-light border ps-5 rounded-pill"
                                placeholder="Search anything..."
                                style={{ width: '280px', fontSize: '0.9rem' }}
                            />
                            <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                        </div>

                        <Button variant="light" className="rounded-circle p-2 position-relative border">
                            <Bell size={20} className="text-secondary" />
                            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                <span className="visually-hidden">New alerts</span>
                            </span>
                        </Button>

                        <div className="vr mx-1 text-secondary opacity-25" style={{ height: '24px' }}></div>

                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" id="dropdown-profile" className="text-decoration-none p-0 d-flex align-items-center gap-2 shadow-none">
                                <div className="text-end d-none d-sm-block lh-1">
                                    <div className="fw-bold small text-dark">Admin User</div>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Super Admin</div>
                                </div>
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 38, height: 38 }}>
                                    A
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="border-0 shadow-lg mt-3 p-2 rounded-3" style={{ width: '200px' }}>
                                <Dropdown.Header className="fw-bold text-uppercase small text-muted">Account</Dropdown.Header>
                                <Dropdown.Item href="#" className="rounded-2 py-2 small">Profile</Dropdown.Item>
                                <Dropdown.Item href="#" className="rounded-2 py-2 small">Settings</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item href="#" className="text-danger rounded-2 py-2 small">Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </header>

                <main className="admin-content">
                    <Container fluid className="p-0">
                        <Outlet />
                    </Container>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
