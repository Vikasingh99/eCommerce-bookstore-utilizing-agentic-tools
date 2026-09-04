export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: '4rem' }}>{icon}</div>
      <h5 className="mt-3 fw-bold text-dark">{title}</h5>
      {message && <p className="text-muted">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
