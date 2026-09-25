export default function Field({ label, id, error, hint, children }) {
  return (
    <div className={error ? 'field has-error' : 'field'}>
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
