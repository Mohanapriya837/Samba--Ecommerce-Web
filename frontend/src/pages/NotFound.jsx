import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState icon="🧭" title="Page not found" message="The page you're looking for doesn't exist."
        action={<Link to="/" className="btn btn-primary">Go home</Link>} />
    </div>
  );
}
