'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { getOrderById } from '@/services/orderService';

export default function OrderDetailsPage({ params }) {
  return (
    <ProtectedRoute>
      <OrderContent params={params} />
    </ProtectedRoute>
  );
}

const STATUS_COLORS = {
  PENDING:   { bg: '#fffbea', color: '#92400e', border: '#fde68a' },
  CONFIRMED: { bg: '#f0faf5', color: '#1a7a4a', border: '#c6f0d7' },
  SHIPPED:   { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  DELIVERED: { bg: '#f0faf5', color: '#1a7a4a', border: '#c6f0d7' },
  CANCELLED: { bg: '#fff5f5', color: '#c0392b', border: '#fecaca' },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#f0f2f5', color: '#4a5568', border: '#e5e7eb' };
  return (
    <span
      className="badge px-3 py-2"
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        borderRadius: '20px',
        fontWeight: 600,
        fontSize: '0.8rem',
      }}
    >
      {status}
    </span>
  );
}

function OrderContent({ params }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderById(orderId);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="container py-5"><Loading message="Loading order…" /></div>;
  if (error) return <div className="container py-5"><ErrorMessage message={error} /></div>;
  if (!order) return null;

  const createdDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>Order #{order.id}</h4>
          <p className="text-muted small mb-0">Placed on {createdDate}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="row g-4">
        {/* Order items */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-0">
              <div className="px-4 py-3 border-bottom">
                <h6 className="fw-bold mb-0">Items Ordered</h6>
              </div>
              {order.orderItems?.map((item, idx) => {
                const imgUrl = item.product?.imageUrl ? `${apiBase}${item.product.imageUrl}` : null;
                return (
                  <div
                    key={item.id}
                    className={`p-4 d-flex gap-3 align-items-start ${idx < order.orderItems.length - 1 ? 'border-bottom' : ''}`}
                  >
                    <div
                      className="rounded-2 flex-shrink-0"
                      style={{ width: '70px', height: '88px', backgroundColor: '#f0f2f5', overflow: 'hidden' }}
                    >
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <span style={{ fontSize: '2rem' }}>📖</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">
                        {item.product ? (
                          <Link href={`/products/${item.product.id}`} style={{ color: '#1a1a2e' }}>
                            {item.product.title}
                          </Link>
                        ) : 'Unknown Book'}
                      </h6>
                      {item.product?.author && (
                        <p className="text-muted small mb-2">by {item.product.author}</p>
                      )}
                      <div className="d-flex gap-3 small text-muted">
                        <span>Qty: <strong>{item.quantity}</strong></span>
                        <span>Price at purchase: <strong>₹{parseFloat(item.price).toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="text-end fw-bold" style={{ minWidth: '80px', color: '#1a1a2e' }}>
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
            <h6 className="fw-bold mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Order ID</span>
              <span className="fw-semibold">#{order.id}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Status</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Items</span>
              <span className="fw-semibold">{order.orderItems?.length || 0}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted mb-3">
              <span>Shipping</span>
              <span className="text-success fw-semibold">Free</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold mb-4">
              <span>Total</span>
              <span style={{ color: '#1a1a2e', fontSize: '1.1rem' }}>
                ₹{parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
            <Link
              href="/catalogue"
              className="btn w-100 fw-semibold"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
