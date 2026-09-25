import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as booksApi from '../../api/books';
import * as categoriesApi from '../../api/categories';
import * as adminApi from '../../api/admin';
import { getErrorMessage, getFieldErrors, isConflictError } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import Field from '../../components/Field';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import BookCover from '../../components/BookCover';

const EMPTY = { title: '', author: '', isbn: '', categoryId: '', price: '', stock: '0', publisher: '', imageUrl: '', description: '' };

/** Used for both "Add book" (/admin/books/new) and "Edit book" (/admin/books/:id/edit). */
export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const cats = useFetch(() => categoriesApi.listCategories(), []);
  const existing = useFetch(() => (isEdit ? booksApi.getBook(id) : Promise.resolve(null)), [id]);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const b = existing.data;
    if (b) {
      setForm({
        title: b.title, author: b.author, isbn: b.isbn || '', categoryId: String(b.categoryId), price: String(b.price),
        stock: String(b.stock), publisher: b.publisher || '', imageUrl: b.imageUrl || '', description: b.description || '',
      });
    }
  }, [existing.data]);

  if (cats.loading || existing.loading) return <Loader />;
  if (existing.error) return <Alert>{existing.error}</Alert>;
  if (cats.error) return <Alert>{cats.error}</Alert>;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const v = {};
    if (!form.title.trim()) v.title = 'Title is required';
    if (!form.author.trim()) v.author = 'Author is required';
    if (!form.categoryId) v.categoryId = 'Select a category';
    if (!(Number(form.price) >= 0.01)) v.price = 'Price must be at least 0.01';
    else if (!/^\d{1,8}(\.\d{1,2})?$/.test(form.price)) v.price = 'Use up to 2 decimal places';
    if (!/^\d+$/.test(form.stock)) v.stock = 'Stock must be 0 or more (whole number)';
    return v;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    const payload = {
      title: form.title.trim(), author: form.author.trim(), isbn: form.isbn.trim() || null,
      description: form.description.trim() || null, price: Number(form.price), stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || null, publisher: form.publisher.trim() || null, categoryId: Number(form.categoryId),
    };
    setSaving(true);
    setApiError('');
    try {
      if (isEdit) await adminApi.updateBook(id, payload);
      else await adminApi.createBook(payload);
      toast.success(isEdit ? 'Book updated' : 'Book added');
      navigate('/admin/books');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(isConflictError(err) ? { ...fieldErrors, isbn: getErrorMessage(err) } : fieldErrors);
      setApiError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <>
      <p className="breadcrumb"><Link to="/admin/books">Books</Link> / {isEdit ? 'Edit' : 'Add'}</p>
      <h1>{isEdit ? 'Edit book' : 'Add a new book'}</h1>
      {cats.data.length === 0 && (
        <Alert type="info">
          No categories exist yet. <Link to="/admin/categories">Create a category</Link> before adding a book.
        </Alert>
      )}
      <form className="card" onSubmit={onSubmit} noValidate>
        <Alert>{apiError}</Alert>
        <div className="book-form">
          <div className="form-grid">
            <Field label="Title *" id="title" error={errors.title}><input id="title" name="title" value={form.title} onChange={onChange} /></Field>
            <Field label="Author *" id="author" error={errors.author}><input id="author" name="author" value={form.author} onChange={onChange} /></Field>
            <Field label="Category *" id="categoryId" error={errors.categoryId}>
              <select id="categoryId" name="categoryId" value={form.categoryId} onChange={onChange}>
                <option value="">Select category…</option>
                {cats.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="ISBN" id="isbn" error={errors.isbn}><input id="isbn" name="isbn" value={form.isbn} onChange={onChange} /></Field>
            <Field label="Price *" id="price" error={errors.price}><input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={onChange} /></Field>
            <Field label="Stock *" id="stock" error={errors.stock}><input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={onChange} /></Field>
            <Field label="Publisher" id="publisher" error={errors.publisher}><input id="publisher" name="publisher" value={form.publisher} onChange={onChange} /></Field>
            <Field label="Image URL" id="imageUrl" error={errors.imageUrl} hint="Link to a cover image (optional)"><input id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={onChange} /></Field>
          </div>
          <div className="book-form-preview">
            <p className="muted small">Cover preview</p>
            <BookCover key={form.imageUrl} id={Number(form.categoryId) || 0} title={form.title || 'Untitled'} author={form.author} imageUrl={form.imageUrl} />
          </div>
        </div>
        <Field label="Description" id="description" error={errors.description}>
          <textarea id="description" name="description" rows="5" maxLength="2000" value={form.description} onChange={onChange} />
        </Field>
        <div className="btn-row">
          <button className="btn btn-primary" disabled={saving || cats.data.length === 0}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add book'}</button>
          <Link to="/admin/books" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </>
  );
}
