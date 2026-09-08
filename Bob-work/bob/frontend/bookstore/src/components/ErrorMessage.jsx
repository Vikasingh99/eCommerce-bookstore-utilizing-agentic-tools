export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert border-0 text-center py-4" style={{ backgroundColor: '#fff5f5', borderRadius: '12px' }}>
      <div style={{ fontSize: '2.5rem' }}>⚠️</div>
      <p className="mt-2 mb-3 text-danger fw-semibold">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button
          className="btn btn-sm"
          style={{ backgroundColor: '#e94560', color: '#fff', border: 'none' }}
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
