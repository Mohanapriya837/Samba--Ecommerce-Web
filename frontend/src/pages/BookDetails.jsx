import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as booksApi from '../api/books';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import BookCover from '../components/BookCover';
import AddToCartButton from '../components/AddToCartButton';
import QtyStepper from '../components/QtyStepper';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { formatPrice } from '../utils/format';

export default function BookDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: book, loading, error } = useFetch(() => booksApi.getBook(id), [id]);
  const [qty, setQty] = useState(1);

  if (loading) return <div className="container section"><Loader /></div>;
  if (error) {
    return (
      <div className="container section">
        <Alert>{error}</Alert>
        <Link to="/books" className="btn btn-outline">← Back to books</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <p className="breadcrumb"><Link to="/books">Books</Link> / <Link to={`/books?categoryId=${book.categoryId}`}>{book.categoryName}</Link> / {book.title}</p>
      <div className="details">
        <div className="details-cover"><BookCover id={book.id} title={book.title} author={book.author} imageUrl={book.imageUrl} /></div>
        <div className="details-info">
          <span className="chip chip-sm">{book.categoryName}</span>
          <h1>{book.title}</h1>
          <p className="muted">by {book.author}</p>
          <p className="price price-lg">{formatPrice(book.price)}</p>
          {book.stock > 0
            ? <span className={book.stock <= 5 ? 'badge badge-pending' : 'badge badge-delivered'}>{book.stock <= 5 ? `Only ${book.stock} left` : 'In stock'}</span>
            : <span className="badge badge-cancelled">Out of stock</span>}
          {book.description && <p className="description">{book.description}</p>}
          <dl className="meta">
            {book.publisher && (<><dt>Publisher</dt><dd>{book.publisher}</dd></>)}
            {book.isbn && (<><dt>ISBN</dt><dd>{book.isbn}</dd></>)}
          </dl>
          {user?.role !== 'ADMIN' && book.stock > 0 && (
            <div className="buy-row">
              <QtyStepper value={qty} max={Math.min(book.stock, 99)} onChange={setQty} />
              <AddToCartButton book={book} quantity={qty} className="btn btn-primary btn-lg" />
            </div>
          )}
          {user?.role === 'ADMIN' && <Link to={`/admin/books/${book.id}/edit`} className="btn btn-outline">Edit this book</Link>}
        </div>
      </div>
    </div>
  );
}
