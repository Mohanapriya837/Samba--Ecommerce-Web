const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
const LABELS = { PENDING: 'Placed', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered' };

export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return <div className="alert alert-error">This order was cancelled.</div>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="timeline">
      {STEPS.map((s, i) => (
        <li key={s} className={i <= current ? 'done' : ''}>
          <span className="dot">{i <= current ? '✓' : i + 1}</span>
          <span>{LABELS[s]}</span>
        </li>
      ))}
    </ol>
  );
}
