import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AddToCartButton({ book, quantity = 1, className = 'btn btn-primary', block = false }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  if (user?.role === 'ADMIN') return null;

  const onClick = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBusy(true);
    await addItem(book.id, quantity);
    setBusy(false);
  };

  return (
    <button type="button" className={`${className}${block ? ' btn-block' : ''}`} onClick={onClick} disabled={busy || book.stock <= 0}>
      {book.stock <= 0 ? 'Out of stock' : busy ? 'Adding…' : '🛒 Add to cart'}
    </button>
  );
}
