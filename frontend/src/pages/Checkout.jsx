import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as ordersApi from '../api/orders';
import { getErrorMessage, getFieldErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Field from '../components/Field';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatPrice, PAYMENT_LABELS } from '../utils/format';
import { isPhone } from '../utils/validators';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, ready, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shippingAddress: user.address || '', phone: user.phone || '', paymentMethod: 'COD' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return <div className="container section"><Loader /></div>;
  const items = cart?.items || [];
  if (items.length === 0 && !submitting) {
    return (
      <div className="container section">
        <EmptyState icon="🛒" title="Nothing to check out" message="Your cart is empty."
          action={<Link to="/books" className="btn btn-primary">Browse books</Link>} />
      </div>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (form.shippingAddress.trim().length < 10) v.shippingAddress = 'Please enter your full shipping address';
    if (!isPhone(form.phone)) v.phone = 'Enter a valid phone number';
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    setApiError('');
    try {
      const order = await ordersApi.checkout(form);
      navigate(`/order-success/${order.id}`, { replace: true });
      refresh();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setApiError(getErrorMessage(err));
      setSubmitting(false);
      refresh(); // stock may have changed
    }
  };

  return (
    <div className="container section">
      <h1>Checkout</h1>
      <div className="cart-layout">
        <form className="card" onSubmit={onSubmit} noValidate>
          <h3>Shipping details</h3>
          <Alert>{apiError}</Alert>
          <Field label="Shipping address *" id="shippingAddress" error={errors.shippingAddress}>
            <textarea id="shippingAddress" name="shippingAddress" rows="3" value={form.shippingAddress} onChange={onChange} />
          </Field>
          <Field label="Phone *" id="phone" error={errors.phone}>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} />
          </Field>
          <h3>Payment method</h3>
          <div className="radio-group">
            {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
              <label key={value} className={form.paymentMethod === value ? 'radio selected' : 'radio'}>
                <input type="radio" name="paymentMethod" value={value} checked={form.paymentMethod === value} onChange={onChange} />
                {label}
              </label>
            ))}
          </div>
          <p className="field-hint">Payments are not processed online yet — your chosen method is saved with the order.</p>
          <button className="btn btn-primary btn-lg btn-block" disabled={submitting}>{submitting ? 'Placing order…' : `Place order · ${formatPrice(cart.totalAmount)}`}</button>
        </form>

        <aside className="card summary">
          <h3>Your items</h3>
          {items.map((i) => (
            <div key={i.id} className="summary-row">
              <span>{i.title} × {i.quantity}</span>
              <span>{formatPrice(i.subtotal)}</span>
            </div>
          ))}
          <div className="summary-row total"><span>Total</span><span>{formatPrice(cart.totalAmount)}</span></div>
          <Link to="/cart" className="btn btn-outline btn-block">Edit cart</Link>
        </aside>
      </div>
    </div>
  );
}
