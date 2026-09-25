import { Link, useParams } from 'react-router-dom';
import * as ordersApi from '../api/orders';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatPrice, PAYMENT_LABELS } from '../utils/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order, loading, error } = useFetch(() => ordersApi.getOrder(id), [id]);

  if (loading) return <div className="container section"><Loader /></div>;
  if (error) return <div className="container section"><Alert>{error}</Alert></div>;

  return (
    <div className="container section narrow">
      <div className="card success-card">
        <div className="success-icon">✓</div>
        <h1>Thank you! Your order is placed</h1>
        <p className="muted">Order #{order.id} · {formatDate(order.createdAt)}</p>
        <p><StatusBadge status={order.status} /></p>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Book</th><th>Qty</th><th className="num">Subtotal</th></tr></thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}><td>{i.bookTitle}</td><td>{i.quantity}</td><td className="num">{formatPrice(i.subtotal)}</td></tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan="2">Total</td><td className="num">{formatPrice(order.totalAmount)}</td></tr></tfoot>
          </table>
        </div>
        <p className="muted">Shipping to: {order.shippingAddress}<br />Payment: {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
        <div className="btn-row">
          <Link to={`/orders/${order.id}`} className="btn btn-primary">View order</Link>
          <Link to="/books" className="btn btn-outline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
