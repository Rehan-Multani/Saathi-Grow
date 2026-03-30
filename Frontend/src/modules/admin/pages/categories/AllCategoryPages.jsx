import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { Edit, ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTranslation } from 'react-i18next';
import { deleteCategoryPage, getCategoryPages } from '../../api/categoryPageApi';
import { showDeleteConfirmation, showErrorAlert, showSuccessAlert } from '../../../../common/utils/alertUtils';

const AllCategoryPages = () => {
  const { t } = useTranslation();
  const { adminUser } = useAdminAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategoryPages(adminUser.token);
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || t('category_pages.loading_failed', { defaultValue: 'Failed to load category pages' }));
    } finally {
      setLoading(false);
    }
  }, [adminUser.token]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation(
      t('category_pages.delete_confirm_title', { defaultValue: 'Delete category page?' }),
      t('category_pages.delete_confirm_text', { name, defaultValue: `This will remove the curated landing page for ${name}.` })
    );
    if (!result.isConfirmed) return;

    try {
      await deleteCategoryPage(adminUser.token, id);
      setPages((prev) => prev.filter((item) => item._id !== id));
      await showSuccessAlert(
        t('category_pages.deleted_title', { defaultValue: 'Deleted' }),
        t('category_pages.deleted_text', { defaultValue: 'Category page removed successfully.' })
      );
    } catch (error) {
      showErrorAlert(
        t('dashboard.error_title', { defaultValue: 'Error' }),
        error.message || t('category_pages.delete_failed', { defaultValue: 'Failed to remove category page' })
      );
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
            <h4 className="mb-1 fw-bold text-dark">{t('category_pages.title', { defaultValue: 'Category Landing Pages' })}</h4>
            <p className="mb-0 small text-muted">{t('category_pages.subtitle', { defaultValue: 'Curate the big category experience with banners, brand rows, tiles, and product rails.' })}</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/category-pages/add" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <Plus size={18} />
            <span className="fw-bold">{t('category_pages.create_page', { defaultValue: 'Create Page' })}</span>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 mb-0 text-muted">{t('category_pages.loading', { defaultValue: 'Loading category pages...' })}</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="border-0 ps-4 py-3">{t('category_pages.table.category', { defaultValue: 'Category' })}</th>
                  <th className="border-0 py-3 text-center">{t('category_pages.table.status', { defaultValue: 'Status' })}</th>
                  <th className="border-0 py-3 text-center">{t('category_pages.table.sections', { defaultValue: 'Sections' })}</th>
                  <th className="border-0 py-3 text-center">{t('category_pages.table.updated', { defaultValue: 'Updated' })}</th>
                  <th className="border-0 py-3 text-end pe-4">{t('category_pages.table.actions', { defaultValue: 'Actions' })}</th>
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
                      {t('category_pages.no_pages', { defaultValue: 'No category landing pages created yet.' })}
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
