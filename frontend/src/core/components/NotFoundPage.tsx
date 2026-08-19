// frontend/src/core/components/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 64 }}>🔍</div>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: 'var(--color-text-muted)' }}>404</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>Page not found.</p>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

