import { Link } from 'react-router-dom';
import * as adminApi from '../../api/admin';
import useFetch from '../../hooks/useFetch';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatPrice } from '../../utils/format';

export default function AdminDashboard() {
  const { data, loading, error } = useFetch(() => adminApi.getDashboard(), []);
  if (loading) return <Loader />;
  if (error) return <Alert>{error}</Alert>;

  const maxStatus = Math.max(1, ...Object.values(data.ordersByStatus));

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat"><span>Revenue</span><strong>{formatPrice(data.totalRevenue)}</strong></div>
        <div className="stat"><span>Orders</span><strong>{data.totalOrders}</strong></div>
        <div className="stat"><span>Books</span><strong>{data.totalBooks}</strong></div>
        <div className="stat"><span>Users</span><strong>{data.totalUsers}</strong></div>
        <div className="stat warn"><span>Low stock (≤5)</span><strong>{data.lowStockBooks}</strong></div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Orders by status</h3>
          {Object.entries(data.ordersByStatus).map(([status, n]) => (
            <div key={status} className="bar-row">
              <span className="bar-label">{status}</span>
              <div className="bar-track"><div className={`bar-fill badge-${status.toLowerCase()}`} style={{ width: `${(n / maxStatus) * 100}%` }} /></div>
              <span className="bar-value">{n}</span>
            </div>
          ))}
          <p className="muted small">Revenue excludes cancelled orders.</p>
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <div className="btn-col">
            <Link to="/admin/books/new" className="btn btn-primary">➕ Add a book</Link>
            <Link to="/admin/orders" className="btn btn-outline">Manage orders</Link>
            <Link to="/admin/learning" className="btn btn-outline">Add videos & notes</Link>
            <Link to="/admin/categories" className="btn btn-outline">Manage categories</Link>
            <Link to="/admin/users" className="btn btn-outline">View users</Link>
          </div>
        </div>
      </div>

      <div className="card table-wrap">
        <h3>Recent orders</h3>
        {data.recentOrders.length === 0 ? <p className="muted">No orders yet.</p> : (
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="num">Total</th></tr></thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id}><td>#{o.id}</td><td>{o.customerName}</td><td>{formatDate(o.createdAt)}</td><td><StatusBadge status={o.status} /></td><td className="num">{formatPrice(o.totalAmount)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
