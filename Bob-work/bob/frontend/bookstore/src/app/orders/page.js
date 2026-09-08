'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';
import { getOrders } from '@/services/orderService';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const STATUS_STYLES = {
  PENDING:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  CONFIRMED: { bg: '#dcfce7', color: '#166534', label: 'Confirmed' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const PAYMENT_STYLES = {
  SUCCESS: { bg: '#dcfce7', color: '#166534' },
  PENDING: { bg: '#fef9c3', color: '#854d0e' },
  FAILED:  { bg: '#fee2e2', color: '#991b1b' },
};

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading message="Loading your orders…" />;

  return (
    <div className="container py-5">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>My Orders</h2>
          <p className="text-muted small mb-0">Your complete order history</p>
        </div>
        <Link
          href="/catalogue"
          className="btn btn-sm"
          style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none' }}
        >
          Continue Shopping
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && orders.length === 0 && (
        <EmptyState
          icon="📦"
          title="No orders yet"
          message="You haven't placed any orders. Start shopping!"
          action={
            <Link
              href="/catalogue"
              className="btn"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none' }}
            >
              Browse Catalogue
            </Link>
          }
        />
      )}

      {orders.map((order) => {
        const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
        const payStyle = order.payment ? (PAYMENT_STYLES[order.payment.status] || PAYMENT_STYLES.PENDING) : null;

        return (
          <div
            key={order.id}
            className="card border-0 shadow-sm mb-4"
            style={{ borderRadius: '12px', overflow: 'hidden' }}
          >
            {/* Order header */}
            <div
              className="d-flex flex-wrap align-items-center justify-content-between px-4 py-3 gap-2"
              style={{ backgroundColor: '#f8f9fb', borderBottom: '1px solid #e5e7eb' }}
            >
              <div>
                <span className="fw-bold" style={{ color: '#1a1a2e' }}>Order #{order.id}</span>
                <span className="text-muted small ms-3">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Order status badge */}
                <span
                  className="badge"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {statusStyle.label}
                </span>
                {/* Payment status badge */}
                {payStyle && (
                  <span
                    className="badge"
                    style={{ backgroundColor: payStyle.bg, color: payStyle.color, fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    Payment: {order.payment.status}
                  </span>
                )}
                <Link
                  href={`/orders/${order.id}`}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none', fontSize: '0.8rem' }}
                >
                  View Details →
                </Link>
              </div>
            </div>

            {/* Order items */}
            <div className="px-4 py-3">
              {order.orderItems.map((item) => {
                const imgUrl = item.product?.imageUrl ? `${apiBase}${item.product.imageUrl}` : null;
                return (
                  <div
                    key={item.id}
                    className="d-flex align-items-center gap-3 py-2"
                    style={{ borderBottom: '1px solid #f0f2f5' }}
                  >
                    <div
                      style={{ width: '52px', height: '68px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f0f2f5' }}
                    >
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <span style={{ fontSize: '1.5rem' }}>📖</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <p className="fw-semibold mb-0 text-truncate" style={{ color: '#1a1a2e' }}>
                        {item.product?.title || 'Unknown Product'}
                      </p>
                      {item.product?.author && (
                        <p className="text-muted small mb-0">by {item.product.author}</p>
                      )}
                      <p className="small mb-0 text-muted">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-end">
                      <p className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
                        ₹{parseFloat(item.price).toFixed(2)}
                      </p>
                      <p className="text-muted small mb-0">per unit</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order footer */}
            <div
              className="d-flex flex-wrap align-items-center justify-content-between px-4 py-3 gap-2"
              style={{ backgroundColor: '#f8f9fb', borderTop: '1px solid #e5e7eb' }}
            >
              <div className="small text-muted">
                {order.payment?.paymentMethod && (
                  <span>Paid via {order.payment.paymentMethod.replace('_', ' ')}</span>
                )}
                {order.payment?.paymentReference && (
                  <span className="ms-2 text-muted">· Ref: {order.payment.paymentReference}</span>
                )}
              </div>
              <div className="fw-bold" style={{ color: '#1a1a2e', fontSize: '1.05rem' }}>
                Total: ₹{parseFloat(order.totalAmount).toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
