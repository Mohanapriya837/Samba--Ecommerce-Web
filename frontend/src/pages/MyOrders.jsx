import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as ordersApi from '../api/orders';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatPrice } from '../utils/format';

export default function MyOrders() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useFetch(() => ordersApi.listMyOrders(page, 10), [page]);

  return (
    <div className="container section">
      <h1>My orders</h1>
      {loading && !data ? <Loader /> : error ? <Alert>{error}</Alert> : data.content.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" message="When you place an order it will show up here."
          action={<Link to="/books" className="btn btn-primary">Start shopping</Link>} />
      ) : (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Status</th><th className="num">Total</th><th /></tr></thead>
              <tbody>
                {data.content.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="num">{formatPrice(o.totalAmount)}</td>
                    <td><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
