export default function Loader({ fullPage = false, label = 'Loading…' }) {
  return (
    <div className={fullPage ? 'loader loader-page' : 'loader'} role="status">
      <div className="spinner" />
      {label && <span>{label}</span>}
    </div>
  );
}
