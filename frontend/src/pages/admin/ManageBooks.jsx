import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as booksApi from '../../api/books';
import * as categoriesApi from '../../api/categories';
import * as adminApi from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import BookCover from '../../components/BookCover';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatPrice } from '../../utils/format';

function StockCell({ book, onSaved }) {
  const toast = useToast();
  const [value, setValue] = useState(String(book.stock));
  const [saving, setSaving] = useState(false);
  const changed = value !== String(book.stock);
  const valid = /^\d+$/.test(value);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateStock(book.id, Number(value));
      toast.success(`Stock updated for "${book.title}"`);
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stock-cell">
      <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} aria-label={`Stock for ${book.title}`} />
      {changed && <button className="btn btn-primary btn-sm" disabled={!valid || saving} onClick={save}>{saving ? '…' : 'Save'}</button>}
    </div>
  );
}

export default function ManageBooks() {
  const toast = useToast();
  const [kw, setKw] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const keyword = useDebounce(kw);

  const cats = useFetch(() => categoriesApi.listCategories(), []);
  const { data, loading, error, reload } = useFetch(
    () => booksApi.listBooks({ keyword, categoryId, page, size: 10, sortBy: 'title', direction: 'asc' }),
    [keyword, categoryId, page]
  );

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteBook(toDelete.id);
      toast.success(`"${toDelete.title}" deleted`);
      setToDelete(null);
      if (data.content.length === 1 && page > 0) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="section-head">
        <h1>Manage books</h1>
        <Link to="/admin/books/new" className="btn btn-primary">➕ Add book</Link>
      </div>
      <div className="toolbar">
        <input type="search" placeholder="Search title, author, ISBN…" value={kw} onChange={(e) => { setKw(e.target.value); setPage(0); }} />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}>
          <option value="">All categories</option>
          {(cats.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading && !data ? <Loader /> : error ? <Alert>{error}</Alert> : data.content.length === 0 ? (
        <EmptyState icon="📖" title="No books found" action={<Link to="/admin/books/new" className="btn btn-primary">Add a book</Link>} />
      ) : (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Book</th><th>Category</th><th className="num">Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {data.content.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="table-book">
                        <BookCover id={b.id} title={b.title} imageUrl={b.imageUrl} className="cover-sm" />
                        <div><strong>{b.title}</strong><p className="muted small">{b.author}</p></div>
                      </div>
                    </td>
                    <td>{b.categoryName}</td>
                    <td className="num">{formatPrice(b.price)}</td>
                    <td><StockCell key={`${b.id}-${b.stock}`} book={b} onSaved={reload} /></td>
                    <td>
                      <div className="btn-row">
                        <Link to={`/admin/books/${b.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setToDelete(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      {toDelete && (
        <ConfirmDialog title="Delete book" danger loading={deleting} confirmLabel="Delete"
          message={`Delete "${toDelete.title}"? It will be removed from the catalogue and from all carts. Past orders are kept.`}
          onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
      )}
    </>
  );
}
