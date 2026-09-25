import { useState } from 'react';
import * as categoriesApi from '../../api/categories';
import * as adminApi from '../../api/admin';
import { getErrorMessage, getFieldErrors, isConflictError } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Field from '../../components/Field';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

function CategoryModal({ category, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: category?.name || '', description: category?.description || '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErrors({ name: 'Name is required' });
    setSaving(true);
    setApiError('');
    const payload = { name: form.name.trim(), description: form.description.trim() || null };
    try {
      if (category) await adminApi.updateCategory(category.id, payload);
      else await adminApi.createCategory(payload);
      toast.success(category ? 'Category updated' : 'Category created');
      onSaved();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(isConflictError(err) ? { ...fieldErrors, name: getErrorMessage(err) } : fieldErrors);
      setApiError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal title={category ? 'Edit category' : 'Add category'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Alert>{apiError}</Alert>
        <Field label="Name *" id="cname" error={errors.name}>
          <input id="cname" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description" id="cdesc" error={errors.description}>
          <textarea id="cdesc" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="btn-row end">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ManageCategories() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => categoriesApi.listCategories(), []);
  const [editing, setEditing] = useState(null); // null | {} (new) | category
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteCategory(toDelete.id);
      toast.success('Category deleted');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="section-head">
        <h1>Manage categories</h1>
        <button className="btn btn-primary" onClick={() => setEditing({})}>➕ Add category</button>
      </div>
      {loading && !data ? <Loader /> : error ? <Alert>{error}</Alert> : data.length === 0 ? (
        <EmptyState icon="🏷️" title="No categories yet" message="Create a category before adding books." />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td className="muted">{c.description || '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setToDelete(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <CategoryModal category={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {toDelete && <ConfirmDialog title="Delete category" danger loading={deleting} confirmLabel="Delete"
        message={`Delete "${toDelete.name}"? Categories that still contain books cannot be deleted.`} onCancel={() => setToDelete(null)} onConfirm={remove} />}
    </>
  );
}
