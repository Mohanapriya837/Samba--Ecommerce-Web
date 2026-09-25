import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const onLogout = () => {
    logout();
    navigate('/');
  };
  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">📚 <span>Samba</span></Link>
        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '☰'}
        </button>
        <nav className={open ? 'nav-menu open' : 'nav-menu'}>
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/books" className={linkClass}>Books</NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}

          {user && !isAdmin && (
            <>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/learning" className={linkClass}>My Learning</NavLink>
              <NavLink to="/orders" className={linkClass}>My Orders</NavLink>
              <NavLink to="/cart" className={linkClass}>
                🛒 Cart {count > 0 && <span className="cart-badge">{count}</span>}
              </NavLink>
            </>
          )}

          {isAdmin && <NavLink to="/admin" className={linkClass}>Admin Panel</NavLink>}

          {user && (
            <>
              <NavLink to="/profile" className={linkClass}>👤 {user.fullName.split(' ')[0]}</NavLink>
              <button type="button" className="btn btn-outline btn-sm" onClick={onLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
