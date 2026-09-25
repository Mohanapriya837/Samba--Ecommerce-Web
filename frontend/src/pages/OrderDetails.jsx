import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as ordersApi from '../api/orders';
import { getErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, formatPrice, PAYMENT_LABELS } from '../utils/format';

export default function OrderDetails() {
  const { id } = useParams();
  const toast = useToast();
  const { data: order, loading, error, reload } = useFetch(() => ordersApi.getOrder(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading && !order) return <div className="container section"><Loader /></div>;
  if (error) return <div className="container section"><Alert>{error}</Alert><Link to="/orders" className="btn btn-outline">← My orders</Link></div>;

  const cancel = async () => {
    setBusy(true);
    try {
      await ordersApi.cancelOrder(id);
      toast.success('Order cancelled');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  return (
    <div className="container section">
      <p className="breadcrumb"><Link to="/orders">My orders</Link> / #{order.id}</p>
      <div className="section-head">
        <h1>Order #{order.id} <StatusBadge status={order.status} /></h1>
        {order.status === 'PENDING' && <button className="btn btn-danger" onClick={() => setConfirm(true)}>Cancel order</button>}
      </div>
      <div className="card"><OrderTimeline status={order.status} /></div>

      <div className="two-col">
        <div className="card table-wrap">
          <h3>Items</h3>
          <table className="table">
            <thead><tr><th>Book</th><th className="num">Price</th><th>Qty</th><th className="num">Subtotal</th></tr></thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td><Link to={`/books/${i.bookId}`}>{i.bookTitle}</Link></td>
                  <td className="num">{formatPrice(i.unitPrice)}</td>
                  <td>{i.quantity}</td>
                  <td className="num">{formatPrice(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan="3">Total</td><td className="num">{formatPrice(order.totalAmount)}</td></tr></tfoot>
          </table>
        </div>
        <div className="card">
          <h3>Delivery &amp; payment</h3>
          <dl className="meta">
            <dt>Placed on</dt><dd>{formatDate(order.createdAt)}</dd>
            <dt>Last updated</dt><dd>{formatDate(order.updatedAt)}</dd>
            <dt>Ship to</dt><dd>{order.shippingAddress}</dd>
            <dt>Phone</dt><dd>{order.phone}</dd>
            <dt>Payment</dt><dd>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</dd>
          </dl>
        </div>
      </div>

      {confirm && <ConfirmDialog title="Cancel order" message="Cancel this order? The books will be returned to stock." confirmLabel="Yes, cancel order" danger loading={busy} onCancel={() => setConfirm(false)} onConfirm={cancel} />}
    </div>
  );
}
