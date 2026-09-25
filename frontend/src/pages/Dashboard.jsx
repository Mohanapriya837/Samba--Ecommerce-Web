import { Link } from 'react-router-dom';
import * as ordersApi from '../api/orders';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatPrice } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const { cart } = useCart();
  const { data, loading, error } = useFetch(() => ordersApi.listMyOrders(0, 5), []);

  return (
    <div className="container section">
      <h1>Hello, {user.fullName.split(' ')[0]} 👋</h1>
      <div className="stat-grid">
        <div className="stat"><span>Total orders</span><strong>{data ? data.totalElements : '…'}</strong></div>
        <div className="stat"><span>Items in cart</span><strong>{cart ? cart.totalItems : '…'}</strong></div>
        <div className="stat"><span>Cart value</span><strong>{cart ? formatPrice(cart.totalAmount) : '…'}</strong></div>
      </div>

      <div className="quick-links">
        <Link to="/learning" className="btn btn-primary">My Learning</Link>
        <Link to="/books" className="btn btn-outline">Browse books</Link>
        <Link to="/cart" className="btn btn-outline">View cart</Link>
        <Link to="/orders" className="btn btn-outline">All orders</Link>
        <Link to="/profile" className="btn btn-outline">Edit profile</Link>
      </div>

      <h2>Recent orders</h2>
      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : data.content.length === 0 ? (
        <p className="muted">You haven't placed any orders yet.</p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Date</th><th>Status</th><th className="num">Total</th><th /></tr></thead>
            <tbody>
              {data.content.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td><td>{formatDate(o.createdAt)}</td><td><StatusBadge status={o.status} /></td>
                  <td className="num">{formatPrice(o.totalAmount)}</td>
                  <td><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
