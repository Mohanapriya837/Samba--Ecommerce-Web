import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>📚 Samba</strong>
          <p className="muted">Books for every reader.</p>
        </div>
        <div className="footer-links">
          <Link to="/books">Browse books</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Create account</Link>
        </div>
        <p className="muted">© {new Date().getFullYear()} Samba Book Store</p>
      </div>
    </footer>
  );
}
