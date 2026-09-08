export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div
        className="spinner-border mb-3"
        role="status"
        style={{ color: '#e94560', width: '3rem', height: '3rem' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">{message}</p>
    </div>
  );
}
