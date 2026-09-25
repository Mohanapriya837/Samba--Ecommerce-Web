import { useState } from 'react';
import * as adminApi from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatPrice, NEXT_STATUSES, ORDER_STATUSES, PAYMENT_LABELS } from '../../utils/format';

function OrderModal({ orderId, onClose, onChanged }) {
  const toast = useToast();
  const { data: order, loading, error, reload } = useFetch(() => adminApi.getOrder(orderId), [orderId]);
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);

  const update = async (status = next) => {
    setSaving(true);
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success(`Order #${orderId} marked ${status}`);
      setNext('');
      reload();
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const options = order ? NEXT_STATUSES[order.status] : [];

  return (
    <Modal title={`Order #${orderId}`} onClose={onClose} wide>
      {loading && !order ? <Loader /> : error ? <Alert>{error}</Alert> : (
        <>
          <div className="two-col compact">
            <dl className="meta">
              <dt>Customer</dt><dd>{order.customerName} ({order.customerEmail})</dd>
              <dt>Placed</dt><dd>{formatDate(order.createdAt)}</dd>
              <dt>Status</dt><dd><StatusBadge status={order.status} /></dd>
            </dl>
            <dl className="meta">
              <dt>Ship to</dt><dd>{order.shippingAddress}</dd>
              <dt>Phone</dt><dd>{order.phone}</dd>
              <dt>Payment</dt><dd>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</dd>
            </dl>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Book</th><th className="num">Price</th><th>Qty</th><th className="num">Subtotal</th></tr></thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}><td>{i.bookTitle}</td><td className="num">{formatPrice(i.unitPrice)}</td><td>{i.quantity}</td><td className="num">{formatPrice(i.subtotal)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan="3">Total</td><td className="num">{formatPrice(order.totalAmount)}</td></tr></tfoot>
            </table>
          </div>
          <div className="order-control-panel">
            <div><span className="section-kicker">ORDER WORKFLOW</span><h3>Move this order forward</h3><p className="muted">Pending → Confirmed → Shipped → Delivered. You can also cancel while the order is pending/confirmed.</p></div>
            <div className="status-actions">{options.map((s) => <button key={s} className={`status-action ${s.toLowerCase()}`} disabled={saving} onClick={() => update(s)}>{s === 'CONFIRMED' ? '✓ Confirm' : s === 'SHIPPED' ? '🚚 Mark shipped' : s === 'DELIVERED' ? '✓ Mark delivered' : 'Cancel order'}</button>)}</div>
            {options.length === 0 && <p className="muted">This order is {order.status.toLowerCase()} and has no further admin transitions.</p>}
          </div>
          {next === 'CANCELLED' && <p className="field-hint">Cancelling returns the books to stock.</p>}
        </>
      )}
    </Modal>
  );
}

export default function ManageOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const { data, loading, error, reload } = useFetch(() => adminApi.listOrders({ status, page, size: 10 }), [status, page]);

  return (
    <>
      <h1>Orders</h1>
      <div className="toolbar">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading && !data ? <Loader /> : error ? <Alert>{error}</Alert> : data.content.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" />
      ) : (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="num">Total</th><th /></tr></thead>
              <tbody>
                {data.content.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customerName}<p className="muted small">{o.customerEmail}</p></td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="num">{formatPrice(o.totalAmount)}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(o.id)}>Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
      {selected && <OrderModal orderId={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  );
}
