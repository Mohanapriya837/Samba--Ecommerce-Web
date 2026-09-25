import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import BookCover from '../components/BookCover';
import QtyStepper from '../components/QtyStepper';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cart, ready, updateItem, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const act = async (id, fn) => {
    setBusyId(id);
    await fn();
    setBusyId(null);
  };

  if (!ready) return <div className="container section"><Loader /></div>;
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container section">
        <EmptyState icon="🛒" title="Your cart is empty" message="Find something to read and add it to your cart."
          action={<Link to="/books" className="btn btn-primary">Browse books</Link>} />
      </div>
    );
  }

  const overStock = items.filter((i) => i.quantity > i.availableStock);

  return (
    <div className="container section">
      <div className="section-head">
        <h1>Shopping cart</h1>
        <button className="btn btn-outline btn-sm" onClick={() => setConfirmClear(true)}>Clear cart</button>
      </div>
      {overStock.length > 0 && <Alert>Some items exceed available stock. Please adjust quantities before checkout.</Alert>}

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((i) => (
            <div key={i.id} className="cart-row card">
              <Link to={`/books/${i.bookId}`} className="cart-cover"><BookCover id={i.bookId} title={i.title} author={i.author} imageUrl={i.imageUrl} /></Link>
              <div className="cart-info">
                <Link to={`/books/${i.bookId}`} className="book-title">{i.title}</Link>
                <p className="muted">{i.author}</p>
                <p>{formatPrice(i.unitPrice)} each</p>
                {i.quantity > i.availableStock && <p className="field-error">Only {i.availableStock} available</p>}
              </div>
              <QtyStepper value={i.quantity} max={i.availableStock} disabled={busyId === i.id}
                onChange={(q) => act(i.id, () => updateItem(i.id, q))} />
              <strong className="cart-subtotal">{formatPrice(i.subtotal)}</strong>
              <button className="icon-btn danger" aria-label={`Remove ${i.title}`} disabled={busyId === i.id} onClick={() => act(i.id, () => removeItem(i.id))}>🗑</button>
            </div>
          ))}
        </div>

        <aside className="card summary">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Items</span><span>{cart.totalItems}</span></div>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(cart.totalAmount)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{formatPrice(cart.totalAmount)}</span></div>
          <button className="btn btn-primary btn-block btn-lg" disabled={overStock.length > 0} onClick={() => navigate('/checkout')}>Proceed to checkout</button>
          <Link to="/books" className="btn btn-outline btn-block">Continue shopping</Link>
        </aside>
      </div>

      {confirmClear && (
        <ConfirmDialog title="Clear cart" message="Remove all items from your cart?" confirmLabel="Clear cart" danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={async () => { await clear(); setConfirmClear(false); }} />
      )}
    </div>
  );
}
