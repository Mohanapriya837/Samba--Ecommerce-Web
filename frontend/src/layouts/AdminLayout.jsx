import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const links = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/books', label: '📖 Books' },
  { to: '/admin/categories', label: '🏷️ Categories' },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/orders', label: '📦 Orders' },
  { to: '/admin/learning', label: '🎬 Learning' },
];

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="admin-shell container">
        <aside className="admin-sidebar">
          <p className="sidebar-title">Admin</p>
          <nav>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'side-link active' : 'side-link')}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="admin-content"><Outlet /></section>
      </div>
    </div>
  );
}
