'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { processPayment } from '@/services/paymentService';

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentContent />
    </ProtectedRoute>
  );
}

const PAYMENT_METHODS = [
  { value: 'CARD', label: '💳 Credit / Debit Card' },
  { value: 'UPI', label: '📱 UPI' },
  { value: 'NET_BANKING', label: '🏦 Net Banking' },
];

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [method, setMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!orderId) {
      router.replace('/cart');
    }
  }, [orderId, router]);

  async function handlePay() {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const data = await processPayment(parseInt(orderId, 10), method);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!orderId) return null;

  if (result) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '16px' }}>
              <div style={{ fontSize: '4rem' }}>✅</div>
              <h4 className="fw-bold mt-3 mb-2" style={{ color: '#1a7a4a' }}>Payment Successful!</h4>
              <p className="text-muted mb-4">{result.message}</p>

              <div
                className="rounded-3 p-4 mb-4 text-start"
                style={{ backgroundColor: '#f0faf5', border: '1px solid #c6f0d7' }}
              >
                <div className="row g-2 small">
                  <div className="col-6 text-muted">Order ID</div>
                  <div className="col-6 fw-semibold">#{result.orderId}</div>

                  <div className="col-6 text-muted">Payment Reference</div>
                  <div className="col-6 fw-semibold" style={{ wordBreak: 'break-all' }}>
                    {result.paymentReference}
                  </div>

                  <div className="col-6 text-muted">Payment Status</div>
                  <div className="col-6">
                    <span
                      className="badge"
                      style={{ backgroundColor: '#1a7a4a', color: '#fff', fontSize: '0.75rem' }}
                    >
                      {result.paymentStatus}
                    </span>
                  </div>

                  <div className="col-6 text-muted">Order Status</div>
                  <div className="col-6">
                    <span
                      className="badge"
                      style={{ backgroundColor: '#1a56db', color: '#fff', fontSize: '0.75rem' }}
                    >
                      {result.orderStatus}
                    </span>
                  </div>

                  <div className="col-6 text-muted">Amount Paid</div>
                  <div className="col-6 fw-bold" style={{ color: '#1a1a2e', fontSize: '1rem' }}>
                    ₹{parseFloat(result.amount).toFixed(2)}
                  </div>

                  <div className="col-6 text-muted">Payment Method</div>
                  <div className="col-6 fw-semibold">{result.paymentMethod}</div>
                </div>
              </div>

              <div className="d-flex gap-3 justify-content-center">
                <Link
                  href={`/orders/${result.orderId}`}
                  className="btn fw-semibold"
                  style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px' }}
                >
                  View Order
                </Link>
                <Link
                  href="/catalogue"
                  className="btn fw-semibold"
                  style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>💳</div>
              <h4 className="fw-bold mt-2 mb-1">Complete Payment</h4>
              <p className="text-muted small">Order #{orderId}</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 py-2 small mb-3" role="alert">
                {error}
              </div>
            )}

            <p className="fw-semibold small mb-3">Select Payment Method</p>
            <div className="d-flex flex-column gap-3 mb-4">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className="d-flex align-items-center gap-3 p-3 rounded-3 cursor-pointer"
                  style={{
                    border: `2px solid ${method === m.value ? '#e94560' : '#e5e7eb'}`,
                    backgroundColor: method === m.value ? '#fff5f7' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="form-check-input mt-0"
                    style={{ width: '1.1rem', height: '1.1rem', accentColor: '#e94560' }}
                  />
                  <span className="fw-semibold small">{m.label}</span>
                </label>
              ))}
            </div>

            <div
              className="rounded-2 p-3 mb-4 small"
              style={{ backgroundColor: '#fffbea', border: '1px solid #fde68a' }}
            >
              <span style={{ color: '#92400e' }}>
                🔒 This is a simulated payment. No real transaction will occur.
              </span>
            </div>

            <button
              className="btn w-100 fw-bold py-3"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.05rem' }}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
              ) : (
                '💳 Pay Now'
              )}
            </button>

            <Link
              href={`/checkout`}
              className="btn btn-sm w-100 mt-2 text-muted"
              style={{ background: 'none', border: 'none' }}
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
