import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { Edit, ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { deleteCategoryPage, getCategoryPages } from '../../api/categoryPageApi';
import { showDeleteConfirmation, showErrorAlert, showSuccessAlert } from '../../../../common/utils/alertUtils';

const AllCategoryPages = () => {
  const { adminUser } = useAdminAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategoryPages(adminUser.token);
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load category pages');
    } finally {
      setLoading(false);
    }
  }, [adminUser.token]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation('Delete category page?', `This will remove the curated landing page for ${name}.`);
    if (!result.isConfirmed) return;

    try {
      await deleteCategoryPage(adminUser.token, id);
      setPages((prev) => prev.filter((item) => item._id !== id));
      await showSuccessAlert('Deleted', 'Category page removed successfully.');
    } catch (error) {
      showErrorAlert('Delete failed', error.message || 'Failed to remove category page');
    }
  };

  return (
    <div className="p-2 p-md-4">
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-md-flex rounded-3 bg-primary bg-opacity-10 p-3 text-primary">
            <FileText size={22} />
          </div>
          <div>
            <h4 className="mb-1 fw-bold text-dark">Category Landing Pages</h4>
            <p className="mb-0 small text-muted">Curate the big category experience with banners, brand rows, tiles, and product rails.</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/category-pages/add" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <Plus size={18} />
            <span className="fw-bold">Create Page</span>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 mb-0 text-muted">Loading category pages...</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="border-0 ps-4 py-3">Category</th>
                  <th className="border-0 py-3 text-center">Status</th>
                  <th className="border-0 py-3 text-center">Sections</th>
                  <th className="border-0 py-3 text-center">Updated</th>
                  <th className="border-0 py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.length > 0 ? pages.map((page) => (
                  <tr key={page._id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{page.category?.name || 'Unknown category'}</div>
                      <div className="small text-muted font-monospace">/{page.category?.slug || 'missing-slug'}</div>
                    </td>
                    <td className="text-center">
                      <Badge bg={page.status === 'published' ? 'success' : 'secondary'} className="rounded-pill px-3 py-2 text-uppercase">
                        {page.status}
                      </Badge>
                    </td>
                    <td className="text-center fw-bold">{page.sections?.length || 0}</td>
                    <td className="text-center text-muted small">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          as={Link}
                          to={`/category/${page.category?.slug}`}
                          variant="light"
                          size="sm"
                          className="border text-info shadow-none"
                          target="_blank"
                        >
                          <ExternalLink size={16} />
                        </Button>
                        <Button
                          as={Link}
                          to={`/admin/category-pages/edit/${page._id}`}
                          variant="light"
                          size="sm"
                          className="border text-warning shadow-none"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="border text-danger shadow-none"
                          onClick={() => handleDelete(page._id, page.category?.name || 'this category')}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-5 text-center text-muted">
                      No category landing pages created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AllCategoryPages;
