import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import AddToCartButton from './AddToCartButton';
import { formatPrice } from '../utils/format';

export default function BookCard({ book }) {
  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-card-cover">
        <BookCover id={book.id} title={book.title} author={book.author} imageUrl={book.imageUrl} />
      </Link>
      <div className="book-card-body">
        <span className="chip chip-sm">{book.categoryName}</span>
        <h3 className="book-title"><Link to={`/books/${book.id}`}>{book.title}</Link></h3>
        <p className="muted">{book.author}</p>
        <div className="book-card-footer">
          <strong className="price">{formatPrice(book.price)}</strong>
          {book.stock <= 0 ? <span className="badge badge-cancelled">Sold out</span> : book.stock <= 5 ? <span className="badge badge-pending">Only {book.stock} left</span> : null}
        </div>
        <AddToCartButton book={book} block />
      </div>
    </article>
  );
}
