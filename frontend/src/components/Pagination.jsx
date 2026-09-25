export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  const pages = [];
  for (let i = start; i < end; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => onChange(page - 1)}>‹ Prev</button>
      {pages.map((p) => (
        <button key={p} className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
          {p + 1}
        </button>
      ))}
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next ›</button>
    </nav>
  );
}
